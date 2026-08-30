"""Telegram Passport element error-reporting types."""

from __future__ import annotations

import dataclasses

from telebot_py.types.base import TelegramObject


@dataclasses.dataclass(frozen=True, slots=True)
class PassportElementError(TelegramObject):
    """An error in one of the Telegram Passport elements a user provided.

    Sent by :meth:`telebot_py.bot.games.GamesMixin.set_passport_data_errors`
    to inform a user that the data they submitted could not be accepted.

    This mirrors the node reference model, which carries only the keys shared
    by every error source. Variant-specific keys (``field_name``,
    ``file_hash``, ``file_hashes``, ``element_hash``) are not modeled; pass a
    plain dict for those errors instead, since the method accepts both shapes.

    Attributes:
        source: Source of the error, one of ``data_field``, ``front_side``,
            ``reverse_side``, ``selfie``, ``file``, ``files``,
            ``translation_file``, ``translation_files``, or ``unspecified``.
        type: Element type of the user's Telegram Passport which has the
            issue, one of ``personal_details``, ``passport``, ``driver_license``,
            ``identity_card``, ``internal_passport``, ``address``,
            ``utility_bill``, ``bank_statement``, ``rental_agreement``,
            ``passport_registration``, ``temporary_registration``.
        message: Human-readable error message.

    Telegram API: https://core.telegram.org/bots/api#passportelementerror
    """

    source: str
    type: str
    message: str
