"""File Bot API methods (parity with packages/go/pkg/bot/files.go)."""

from __future__ import annotations

from telebot_py.bot.base import Requester, clean_payload, parse_result
from telebot_py.types.files import File, UserProfilePhotos


class FilesMixin(Requester):
    """Bot methods for file metadata and user profile photos."""

    async def get_file(self, file_id: str) -> File:
        """Get basic information about a file and prepare it for downloading.

        The actual download URL is ``{base_url}/file/bot{token}/{file_path}``.

        Example:
            >>> file = await bot.get_file("file_123")

        Args:
            file_id: File identifier to get information about.

        Returns:
            The File object; ``file_path`` is set when the file is ready.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(file_id=file_id)
        return parse_result(File, await self.request("getFile", payload))

    async def get_user_profile_photos(
        self, user_id: int, *, offset: int | None = None, limit: int | None = None
    ) -> UserProfilePhotos:
        """Get a list of profile pictures for a user.

        Example:
            >>> photos = await bot.get_user_profile_photos(42, limit=10)

        Args:
            user_id: Unique identifier of the target user.
            offset: Sequential number of the first photo to return.
            limit: Maximum number of photos to retrieve, 1-100.

        Returns:
            The UserProfilePhotos object.

        Raises:
            InvalidTokenError: If Telegram rejects the token (HTTP 401).
            TelegramApiError: If Telegram responds not-ok or retries exhaust.
            NetworkError: If the transport keeps failing after retries.
        """
        payload = clean_payload(user_id=user_id, offset=offset, limit=limit)
        return parse_result(UserProfilePhotos, await self.request("getUserProfilePhotos", payload))
