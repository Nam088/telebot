/**
 * Webhook HTTP Server and request validation handler.
 *
 * @packageDocumentation
 */

import { createServer, type Server, type IncomingMessage, type ServerResponse } from "node:http";
import { timingSafeEqual } from "node:crypto";
import type { ErrorHandlerCallback } from "./app.js";

/**
 * Maximum accepted size, in bytes, of an incoming webhook request body.
 */
export const MAX_WEBHOOK_BODY_BYTES = 5 * 1024 * 1024;

/**
 * Compares the received `X-Telegram-Bot-Api-Secret-Token` header against the configured
 * secret using a constant-time comparison, so that response timing cannot leak how many
 * leading characters matched.
 *
 * @param received - The raw header value as read from the incoming request.
 * @param expected - The secret token configured via webhook.
 * @returns `true` if `received` matches `expected`.
 */
export function isSecretTokenValid(
  received: string | string[] | undefined,
  expected: string,
): boolean {
  if (typeof received !== "string") return false;
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  if (receivedBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(receivedBuffer, expectedBuffer);
}

/**
 * Options for configuring the Webhook HTTP server.
 */
export interface WebhookServerOptions {
  /** Host address to listen on (default: `0.0.0.0`). */
  listen?: string;
  /** Port number to listen on (default: `8080`). */
  port?: number;
  /** URL path that Telegram webhook POSTs to (default: `/`). */
  path?: string;
  /** Secret token to validate against `X-Telegram-Bot-Api-Secret-Token`. */
  secret_token?: string;
  /** Custom `http.Server` instance. */
  server?: Server;
}

/**
 * Creates and starts a webhook HTTP server to receive Telegram updates.
 *
 * @param options - Webhook configuration options.
 * @param onUpdate - Callback invoked with the parsed raw update object.
 * @param errorHandlers - Array of error handler callbacks.
 * @returns The active `http.Server` instance.
 */
export async function createWebhookServer(
  options: WebhookServerOptions,
  onUpdate: (rawUpdate: Record<string, unknown>) => Promise<void>,
  errorHandlers: ErrorHandlerCallback[],
): Promise<Server> {
  const listenHost = options.listen ?? "0.0.0.0";
  const listenPort = options.port ?? 8080;
  const webhookPath = options.path ?? "/";
  const secretToken = options.secret_token;

  const server = options.server ?? createServer();

  server.on("request", async (req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url ?? "/", `http://${req.headers.host || "localhost"}`);
    if (req.method !== "POST" || url.pathname !== webhookPath) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
      return;
    }

    if (secretToken) {
      const receivedToken = req.headers["x-telegram-bot-api-secret-token"];
      if (!isSecretTokenValid(receivedToken, secretToken)) {
        res.writeHead(401, { "Content-Type": "text/plain" });
        res.end("Unauthorized");
        return;
      }
    }

    const declaredLength = Number(req.headers["content-length"]);
    if (Number.isFinite(declaredLength) && declaredLength > MAX_WEBHOOK_BODY_BYTES) {
      res.writeHead(413, { "Content-Type": "text/plain" });
      res.end("Payload Too Large");
      req.resume();
      return;
    }

    let body = "";
    let receivedBytes = 0;
    let rejected = false;

    req.on("data", (chunk: Buffer) => {
      if (rejected) return;
      receivedBytes += chunk.length;
      if (receivedBytes > MAX_WEBHOOK_BODY_BYTES) {
        rejected = true;
        res.writeHead(413, { "Content-Type": "text/plain" });
        res.end("Payload Too Large");
        return;
      }
      body += chunk;
    });

    req.on("end", async () => {
      if (rejected) return;
      try {
        const rawUpdate = JSON.parse(body);
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("OK");

        await onUpdate(rawUpdate);
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        for (const errHandler of errorHandlers) {
          try {
            await errHandler(error);
          } catch (ehErr) {
            console.error("Error in webhook error handler:", ehErr);
          }
        }
        if (!res.headersSent) {
          res.writeHead(400, { "Content-Type": "text/plain" });
          res.end("Bad Request");
        }
      }
    });
  });

  if (!options.server) {
    await new Promise<void>((resolve) => {
      server.listen(listenPort, listenHost, () => {
        resolve();
      });
    });
  }

  return server;
}
