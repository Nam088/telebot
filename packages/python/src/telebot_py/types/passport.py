"""Telegram Passport types: encrypted payloads and error reporting."""

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


@dataclasses.dataclass(frozen=True, slots=True)
class EncryptedCredentials(TelegramObject):
    """Credentials required to decrypt submitted Telegram Passport data.

    Attributes:
        data: Base64-encoded encrypted JSON-serialized data with unique user's
            payload, data hashes and secrets required for
            ``EncryptedPassportElement`` decryption and authentication.
        hash: Base64-encoded data hash for authentication.
        secret: Base64-encoded secret, encrypted with the bot's public RSA key,
            required for data decryption.

    Telegram API: https://core.telegram.org/bots/api#encryptedcredentials
    """

    data: str
    hash: str
    secret: str


@dataclasses.dataclass(frozen=True, slots=True)
class PassportFile(TelegramObject):
    """A file uploaded to Telegram Passport.

    All files uploaded to Telegram Passport are currently encrypted by the
    same ``EncryptedCredentials`` that accompanies a ``PassportData`` payload.

    Attributes:
        file_id: Identifier for this file, which can be used to download or
            reuse it.
        file_unique_id: Unique identifier for this file.
        file_size: File size in bytes.
        file_date: Unix time when the file was uploaded to Telegram Passport.

    Telegram API: https://core.telegram.org/bots/api#passportfile
    """

    file_id: str
    file_unique_id: str
    file_size: int
    file_date: int


@dataclasses.dataclass(frozen=True, slots=True)
class EncryptedPassportElement(TelegramObject):
    """One encrypted element submitted through Telegram Passport.

    Attributes:
        type: Element type, one of ``personal_details``, ``passport``,
            ``driver_license``, ``identity_card``, ``internal_passport``,
            ``address``, ``utility_bill``, ``bank_statement``,
            ``rental_agreement``, ``passport_registration``,
            ``temporary_registration``, ``phone_number`` or ``email``.
        hash: Base64-encoded element hash, used for authentication on
            Telegram's side.
        data: Base64-encoded encrypted element data, when the element is a
            data field rather than a file.
        phone_number: User's verified phone number; present only for
            ``phone_number`` type elements.
        email: User's verified email address; present only for ``email`` type
            elements.
        files: Files with documents provided by the user, when applicable.
        front_side: File with the front side of the document, when applicable.
        reverse_side: File with the reverse side of the document, when
            applicable.
        selfie: File with the selfie of a user with a document presented by the
            user, when applicable.
        translation: Array of encrypted files with translated versions of the
            documents provided by the user, when applicable.

    Telegram API: https://core.telegram.org/bots/api#encryptedpassportelement
    """

    type: str
    hash: str
    data: str | None = None
    phone_number: str | None = None
    email: str | None = None
    files: list[PassportFile] | None = None
    front_side: PassportFile | None = None
    reverse_side: PassportFile | None = None
    selfie: PassportFile | None = None
    translation: list[PassportFile] | None = None


@dataclasses.dataclass(frozen=True, slots=True)
class PassportData(TelegramObject):
    """Telegram Passport data attached to a message by a user.

    Attributes:
        data: Array with information about the documents and other Telegram
            Passport elements that were provided to the bot.
        credentials: Encrypted credentials required to decrypt the data.

    Telegram API: https://core.telegram.org/bots/api#passportdata
    """

    data: list[EncryptedPassportElement]
    credentials: EncryptedCredentials
