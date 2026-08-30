"""Webhook HTTP server: asyncio streams plus a minimal HTTP/1.1 parser (T052).

Implements research R4: one POST route served by ``asyncio.start_server``
with no ASGI dependency. The parser understands a request line, headers, and
a fixed ``Content-Length`` body; chunked, oversized, truncated, and malformed
requests are rejected with an HTTP error status and never kill the server
(quickstart V6). TLS termination is the operator's responsibility — bind the
server to localhost behind a reverse proxy in production.

Webhook registration at Telegram (``set_webhook``/``delete_webhook``) is
deliberately left to the operator, mirroring ``packages/node``'s
``runWebhook``, which also only serves deliveries.
"""

from __future__ import annotations

import asyncio
import contextlib
import hmac
import json
import logging
from collections.abc import Callable

from telebot_py.types import Update

logger = logging.getLogger("telebot_py.webhook")

#: Maximum accepted size in bytes of an incoming webhook request body
#: (parity with ``packages/node`` ``MAX_WEBHOOK_BODY_BYTES``).
MAX_WEBHOOK_BODY_BYTES = 5 * 1024 * 1024

#: Header-count guard rail so hostile requests cannot exhaust memory.
MAX_HEADER_COUNT = 100

#: Seconds a client may take to deliver the request head and body.
REQUEST_TIMEOUT_SECONDS = 10.0

#: Header carrying the shared secret on every Telegram delivery.
SECRET_TOKEN_HEADER = "x-telegram-bot-api-secret-token"

#: Callback receiving each parsed update (e.g. ``Application._spawn_update``).
OnUpdate = Callable[[Update], object]

_REASONS: dict[int, str] = {
    200: "OK",
    400: "Bad Request",
    401: "Unauthorized",
    404: "Not Found",
    405: "Method Not Allowed",
}


class WebhookRequestError(Exception):
    """A request that must be answered with an HTTP error status.

    Attributes:
        status: The HTTP status code to respond with.
    """

    def __init__(self, status: int, detail: str) -> None:
        """Initialize the error with the response status and a log detail.

        Args:
            status: The HTTP status code to respond with.
            detail: Human-readable reason, logged but not sent to the client.
        """
        super().__init__(detail)
        self.status = status


def is_secret_token_valid(received: str | None, expected: str) -> bool:
    """Compare a received secret token against the configured one.

    Uses a constant-time comparison so response timing cannot leak how many
    leading characters matched (parity with ``packages/node``).

    Args:
        received: Raw ``X-Telegram-Bot-Api-Secret-Token`` header value.
        expected: The secret token configured for this webhook.

    Returns:
        True when ``received`` matches ``expected``.
    """
    if received is None:
        return False
    return hmac.compare_digest(received.encode("utf-8"), expected.encode("utf-8"))


async def _read_line(reader: asyncio.StreamReader) -> bytes:
    """Read one CRLF-terminated line without its terminator.

    Raises:
        WebhookRequestError: 400 when the line is overlong or the client
            disconnects before terminating it.
    """
    try:
        line = await reader.readuntil(b"\r\n")
    except asyncio.LimitOverrunError as exc:
        raise WebhookRequestError(400, "request line too long") from exc
    except asyncio.IncompleteReadError as exc:
        raise WebhookRequestError(400, "connection closed mid-line") from exc
    return line[:-2]


def _parse_request_line(line: bytes) -> tuple[str, str]:
    """Split the request line into (method, path), dropping any query.

    Raises:
        WebhookRequestError: 400 on a malformed line or non-HTTP version.
    """
    try:
        method, target, version = line.decode("latin-1").split(" ")
    except (UnicodeDecodeError, ValueError) as exc:
        raise WebhookRequestError(400, "malformed request line") from exc
    if not version.startswith("HTTP/"):
        raise WebhookRequestError(400, "unsupported protocol version")
    path = target.partition("?")[0]
    return method, path or "/"


async def _read_headers(reader: asyncio.StreamReader) -> dict[str, str]:
    """Read headers into a lower-cased name -> value mapping (last wins).

    Raises:
        WebhookRequestError: 400 on malformed header lines or too many headers.
    """
    headers: dict[str, str] = {}
    while True:
        line = await _read_line(reader)
        if not line:
            return headers
        name, separator, value = line.partition(b":")
        if not separator or not name.strip():
            raise WebhookRequestError(400, "malformed header line")
        headers[name.decode("latin-1").strip().lower()] = value.decode("latin-1").strip()
        if len(headers) > MAX_HEADER_COUNT:
            raise WebhookRequestError(400, "too many headers")


async def _read_body(reader: asyncio.StreamReader, headers: dict[str, str]) -> bytes:
    """Read a fixed ``Content-Length`` body, rejecting chunked/oversized input.

    Args:
        reader: The connection to read from.
        headers: The parsed request headers (lower-cased names).

    Returns:
        The body bytes (empty when no Content-Length was sent).

    Raises:
        WebhookRequestError: 400 for chunked encoding, a missing/invalid/
            oversized Content-Length, or a truncated body.
    """
    if "chunked" in headers.get("transfer-encoding", "").lower():
        raise WebhookRequestError(400, "chunked transfer encoding is not supported")
    raw_length = headers.get("content-length")
    if raw_length is None:
        return b""
    try:
        length = int(raw_length)
    except ValueError as exc:
        raise WebhookRequestError(400, "invalid Content-Length") from exc
    if length < 0 or length > MAX_WEBHOOK_BODY_BYTES:
        raise WebhookRequestError(400, "body exceeds the maximum webhook body size")
    try:
        return await reader.readexactly(length)
    except asyncio.IncompleteReadError as exc:
        raise WebhookRequestError(400, "truncated body") from exc


def _parse_update(body: bytes) -> Update:
    """Decode a request body into an Update.

    Args:
        body: The raw request body.

    Returns:
        The parsed Update.

    Raises:
        WebhookRequestError: 400 when the body is not valid JSON, not a JSON
            object, or not a well-formed Telegram Update.
    """
    try:
        payload = json.loads(body.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise WebhookRequestError(400, f"invalid JSON body: {exc}") from exc
    if not isinstance(payload, dict):
        raise WebhookRequestError(400, "webhook body must be a JSON object")
    try:
        return Update.from_dict(payload)
    except Exception as exc:  # noqa: BLE001 - any parse failure is a 400, never a crash
        raise WebhookRequestError(400, f"body is not a valid Update: {exc}") from exc


def _build_response(status: int, *, allow: str | None = None) -> bytes:
    """Serialize a complete HTTP/1.1 response closing the connection."""
    reason = _REASONS.get(status, "Error")
    body = reason.encode("utf-8")
    lines = [
        f"HTTP/1.1 {status} {reason}",
        "Content-Type: text/plain; charset=utf-8",
        f"Content-Length: {len(body)}",
    ]
    if allow is not None:
        lines.append(f"Allow: {allow}")
    lines.append("Connection: close")
    return ("\r\n".join(lines) + "\r\n\r\n").encode("latin-1") + body


async def _write_response(
    writer: asyncio.StreamWriter, status: int, *, allow: str | None = None
) -> None:
    """Write and drain a response; a vanished client is logged, not raised."""
    try:
        writer.write(_build_response(status, allow=allow))
        await writer.drain()
    except (ConnectionError, OSError):
        logger.debug("Client went away before the %s response could be written", status)


class WebhookServer:
    """Single-route HTTP/1.1 endpoint feeding parsed updates to a callback.

    Each connection is handled independently and closed after one response;
    routing, secret-token, and body errors produce 400/401/404/405 responses
    without ever stopping the server.

    Example:
        >>> server = await serve_webhook(
        ...     listen="127.0.0.1", port=8443, url_path="/hook",
        ...     secret_token="s3cret", on_update=app._spawn_update,
        ... )

    Attributes:
        url_path: The path Telegram must POST updates to.
        secret_token: The expected secret token, or None when verification
            is disabled.
    """

    def __init__(
        self,
        *,
        listen: str,
        port: int,
        url_path: str,
        secret_token: str | None,
        on_update: OnUpdate,
    ) -> None:
        """Configure the server without starting it; call :meth:`serve`.

        Args:
            listen: Interface address to bind to.
            port: Port to bind; 0 picks a free ephemeral port.
            url_path: Route accepting POSTed updates; a leading slash is
                added when missing.
            secret_token: When set, deliveries must echo it in
                ``X-Telegram-Bot-Api-Secret-Token`` or get a 401.
            on_update: Synchronous callable invoked once per accepted update,
                expected to schedule dispatch and return immediately.
        """
        self.url_path = url_path if url_path.startswith("/") else f"/{url_path}"
        self.secret_token = secret_token
        self._listen = listen
        self._port = port
        self._on_update = on_update
        self._server: asyncio.Server | None = None
        self._bound_port = port
        self._connection_tasks: set[asyncio.Task[None]] = set()

    @property
    def port(self) -> int:
        """The port actually bound (differs from the request when it was 0)."""
        return self._bound_port

    async def serve(self) -> None:
        """Bind and start accepting connections.

        Raises:
            OSError: If the address/port cannot be bound.
        """
        self._server = await asyncio.start_server(self._handle_connection, self._listen, self._port)
        sockets = self._server.sockets
        if sockets:
            address = sockets[0].getsockname()
            if isinstance(address, tuple) and len(address) >= 2:
                self._bound_port = int(address[1])
        logger.info(
            "Webhook server listening on %s:%s%s", self._listen, self._bound_port, self.url_path
        )

    async def close(self) -> None:
        """Stop accepting connections and cancel any in-flight handlers."""
        server, self._server = self._server, None
        if server is None:
            return
        server.close()
        await server.wait_closed()
        tasks = set(self._connection_tasks)
        for task in tasks:
            task.cancel()
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)

    async def _handle_connection(
        self, reader: asyncio.StreamReader, writer: asyncio.StreamWriter
    ) -> None:
        """Handle one connection: answer exactly one request, then close."""
        task = asyncio.current_task()
        if task is not None:
            self._connection_tasks.add(task)
        try:
            await self._process_request(reader, writer)
        finally:
            if task is not None:
                self._connection_tasks.discard(task)
            writer.close()
            with contextlib.suppress(ConnectionError, OSError):
                await writer.wait_closed()

    async def _process_request(
        self, reader: asyncio.StreamReader, writer: asyncio.StreamWriter
    ) -> None:
        """Parse, route, and answer one request; never raises."""
        try:
            method, path, headers = await asyncio.wait_for(
                self._read_request_head(reader), timeout=REQUEST_TIMEOUT_SECONDS
            )
        except WebhookRequestError as exc:
            logger.warning("Rejecting webhook request: %s", exc)
            await _write_response(writer, exc.status)
            return
        except (
            asyncio.TimeoutError,
            asyncio.IncompleteReadError,
            asyncio.LimitOverrunError,
            ConnectionError,
            OSError,
        ):
            logger.debug("Dropping unreadable webhook connection")
            return

        if path != self.url_path:
            await _write_response(writer, 404)
            return
        if method != "POST":
            await _write_response(writer, 405, allow="POST")
            return
        if self.secret_token is not None and not is_secret_token_valid(
            headers.get(SECRET_TOKEN_HEADER), self.secret_token
        ):
            logger.warning("Rejecting webhook delivery with a missing or wrong secret token")
            await _write_response(writer, 401)
            return

        try:
            body = await asyncio.wait_for(
                _read_body(reader, headers), timeout=REQUEST_TIMEOUT_SECONDS
            )
            update = _parse_update(body)
        except WebhookRequestError as exc:
            logger.warning("Rejecting webhook request: %s", exc)
            await _write_response(writer, exc.status)
            return
        except (asyncio.TimeoutError, asyncio.IncompleteReadError, ConnectionError, OSError):
            logger.warning("Webhook request body could not be read")
            await _write_response(writer, 400)
            return

        # Acknowledge before dispatch (node parity): Telegram delivery must
        # not wait on handler latency.
        await _write_response(writer, 200)
        try:
            self._on_update(update)
        except Exception:  # noqa: BLE001 - a dispatch failure must never kill the server
            logger.exception("Webhook update dispatch failed for update %s", update.update_id)

    async def _read_request_head(
        self, reader: asyncio.StreamReader
    ) -> tuple[str, str, dict[str, str]]:
        """Read and parse the request line and headers."""
        method, path = _parse_request_line(await _read_line(reader))
        headers = await _read_headers(reader)
        return method, path, headers


async def serve_webhook(
    *,
    listen: str,
    port: int,
    url_path: str,
    secret_token: str | None,
    on_update: OnUpdate,
) -> WebhookServer:
    """Create a :class:`WebhookServer` and start listening.

    Args:
        listen: Interface address to bind to.
        port: Port to bind; 0 picks a free ephemeral port.
        url_path: Route accepting POSTed updates.
        secret_token: Shared secret for delivery verification, or None.
        on_update: Callback invoked once per accepted, parsed update.

    Returns:
        The listening server; read its ``port`` for the actually bound port.

    Raises:
        OSError: If the address/port cannot be bound.
    """
    server = WebhookServer(
        listen=listen, port=port, url_path=url_path, secret_token=secret_token, on_update=on_update
    )
    await server.serve()
    return server
