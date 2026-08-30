"""Unit tests for the error taxonomy (T008)."""

from __future__ import annotations

from telebot_py.bot.errors import (
    InvalidTokenError,
    NetworkError,
    TelebotError,
    TelegramApiError,
)


class TestTelegramApiError:
    def test_carries_error_code_and_description(self) -> None:
        error = TelegramApiError(400, "Bad Request: chat not found")
        assert error.error_code == 400
        assert error.description == "Bad Request: chat not found"
        assert "400" in str(error)
        assert "Bad Request: chat not found" in str(error)

    def test_retry_after_defaults_to_none(self) -> None:
        error = TelegramApiError(429, "Too Many Requests")
        assert error.retry_after is None

    def test_carries_retry_after_and_method(self) -> None:
        error = TelegramApiError(
            429,
            "Too Many Requests: retry after 5",
            method="sendMessage",
            retry_after=5.0,
        )
        assert error.retry_after == 5.0
        assert error.method == "sendMessage"

    def test_is_framework_error(self) -> None:
        assert isinstance(TelegramApiError(500, "Internal Server Error"), TelebotError)


class TestInvalidTokenError:
    def test_is_telegram_api_error_subclass(self) -> None:
        error = InvalidTokenError(401, "Unauthorized")
        assert isinstance(error, TelegramApiError)
        assert isinstance(error, TelebotError)
        assert error.error_code == 401


class TestNetworkError:
    def test_for_transport_failures(self) -> None:
        error = NetworkError("connection reset by peer")
        assert isinstance(error, TelebotError)
        assert isinstance(error, Exception)
        assert str(error) == "connection reset by peer"


class TestTopLevelExports:
    def test_ext_errors_module_reexports_same_classes(self) -> None:
        import telebot_py.ext_errors as ext_errors

        assert ext_errors.TelegramApiError is TelegramApiError
        assert ext_errors.InvalidTokenError is InvalidTokenError
        assert ext_errors.NetworkError is NetworkError
