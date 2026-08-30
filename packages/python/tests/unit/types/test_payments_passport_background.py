"""Unit tests for the payments, Telegram Passport and chat-background types.

Round-trips every class added in the Bot API parity pass and checks that the
``Message`` fields pointing at them are now typed instead of raw payloads.
"""

from __future__ import annotations

import dataclasses
import typing as t

import pytest

from telebot_py.types import (
    BackgroundFill,
    BackgroundFillFreeformGradient,
    BackgroundFillGradient,
    BackgroundFillSolid,
    BackgroundType,
    BackgroundTypeChatTheme,
    BackgroundTypeFill,
    BackgroundTypePattern,
    BackgroundTypeWallpaper,
    Chat,
    ChatBackground,
    Document,
    EncryptedCredentials,
    EncryptedPassportElement,
    Invoice,
    Message,
    PassportData,
    PassportFile,
    SuccessfulPayment,
)

PASSPORT_FILE: dict[str, t.Any] = {
    "file_id": "pf1",
    "file_unique_id": "pfu1",
    "file_size": 128,
    "file_date": 1700000000,
}


class TestInvoice:
    """Docs fields: title, description, start_parameter, currency, total_amount."""

    def test_declared_fields_match_the_docs(self) -> None:
        assert {f.name for f in dataclasses.fields(Invoice)} == {
            "title",
            "description",
            "start_parameter",
            "currency",
            "total_amount",
        }

    def test_round_trip(self) -> None:
        raw: dict[str, t.Any] = {
            "title": "Widget",
            "description": "A widget",
            "start_parameter": "s",
            "currency": "XTR",
            "total_amount": 1000,
        }
        invoice = Invoice.from_dict(raw)
        assert invoice == Invoice(
            title="Widget",
            description="A widget",
            start_parameter="s",
            currency="XTR",
            total_amount=1000,
        )
        assert invoice.to_dict() == raw


class TestSuccessfulPayment:
    """Docs fields: currency, total_amount, invoice_payload, shipping_option_id,
    order_info, telegram_payment_charge_id, provider_payment_charge_id,
    is_recurring, is_first_recurring, subscription_expiration_date."""

    def test_declared_fields_match_the_docs(self) -> None:
        assert {f.name for f in dataclasses.fields(SuccessfulPayment)} == {
            "currency",
            "total_amount",
            "invoice_payload",
            "shipping_option_id",
            "order_info",
            "telegram_payment_charge_id",
            "provider_payment_charge_id",
            "is_recurring",
            "is_first_recurring",
            "subscription_expiration_date",
        }

    def test_minimal_construction_keeps_optionals_off_the_wire(self) -> None:
        payment = SuccessfulPayment(
            currency="XTR",
            total_amount=50,
            invoice_payload="cGF5bG9hZA==",
            telegram_payment_charge_id="tg1",
            provider_payment_charge_id="pr1",
        )
        assert payment.to_dict() == {
            "currency": "XTR",
            "total_amount": 50,
            "invoice_payload": "cGF5bG9hZA==",
            "telegram_payment_charge_id": "tg1",
            "provider_payment_charge_id": "pr1",
        }

    def test_round_trip_with_nested_order_info(self) -> None:
        raw: dict[str, t.Any] = {
            "currency": "USD",
            "total_amount": 1299,
            "invoice_payload": "cGF5bG9hZA==",
            "shipping_option_id": "std",
            "order_info": {
                "name": "Ada",
                "phone_number": "+1",
                "email": "a@example.com",
                "shipping_address": {
                    "country_code": "US",
                    "city": "SF",
                    "street_line1": "1 Market",
                    "post_code": "94105",
                    "state": "CA",
                    "street_line2": "Apt 2",
                },
            },
            "telegram_payment_charge_id": "tg1",
            "provider_payment_charge_id": "pr1",
            "is_recurring": True,
            "is_first_recurring": True,
            "subscription_expiration_date": 1800000000,
        }
        payment = SuccessfulPayment.from_dict(raw)
        assert payment.order_info is not None
        assert payment.order_info.name == "Ada"
        assert payment.order_info.shipping_address is not None
        assert payment.order_info.shipping_address.city == "SF"
        assert payment.is_recurring is True
        assert payment.subscription_expiration_date == 1800000000
        assert payment.to_dict() == raw


class TestPassportTypes:
    def test_encrypted_credentials_round_trip(self) -> None:
        raw: dict[str, t.Any] = {"data": "ZGF0YQ==", "hash": "aGFzaA==", "secret": "c2VjcmV0"}
        credentials = EncryptedCredentials.from_dict(raw)
        assert credentials == EncryptedCredentials(
            data="ZGF0YQ==", hash="aGFzaA==", secret="c2VjcmV0"
        )
        assert credentials.to_dict() == raw

    def test_passport_file_round_trip(self) -> None:
        file = PassportFile.from_dict(PASSPORT_FILE)
        assert file.file_size == 128
        assert file.to_dict() == PASSPORT_FILE

    def test_encrypted_passport_element_nested_files(self) -> None:
        raw: dict[str, t.Any] = {
            "type": "utility_bill",
            "hash": "aGFzaA==",
            "files": [PASSPORT_FILE, {**PASSPORT_FILE, "file_id": "pf2"}],
            "front_side": PASSPORT_FILE,
            "translation": [PASSPORT_FILE],
            "email": "a@example.com",
        }
        element = EncryptedPassportElement.from_dict(raw)
        assert [item.file_id for item in element.files or []] == ["pf1", "pf2"]
        assert isinstance(element.front_side, PassportFile)
        assert element.front_side is not None and element.front_side.file_unique_id == "pfu1"
        assert element.translation == [PassportFile.from_dict(PASSPORT_FILE)]
        assert element.files is not None
        assert element.translation == [element.files[0]]
        assert element.email == "a@example.com"
        assert element.to_dict() == raw

    def test_encrypted_passport_element_required_only(self) -> None:
        element = EncryptedPassportElement(type="passport", hash="aGFzaA==")
        assert element.to_dict() == {"type": "passport", "hash": "aGFzaA=="}

    def test_passport_data_round_trip(self) -> None:
        raw: dict[str, t.Any] = {
            "data": [{"type": "personal_details", "hash": "aGFzaA==", "data": "ZW5jcnlwdGVk"}],
            "credentials": {"data": "ZGF0YQ==", "hash": "aGFzaA==", "secret": "c2VjcmV0"},
        }
        payload = PassportData.from_dict(raw)
        assert payload.data[0].type == "personal_details"
        assert payload.credentials.secret == "c2VjcmV0"
        assert payload.to_dict() == raw

    def test_message_passport_data_is_typed(self) -> None:
        hints = t.get_type_hints(Message)
        assert hints["passport_data"] == (PassportData | None)


class TestBackgroundTypes:
    def test_fill_variant_literals(self) -> None:
        assert (
            BackgroundTypeFill(fill=BackgroundFillSolid(color=16711680), dark_theme_dimming=0).type
            == "fill"
        )
        assert (
            BackgroundTypeWallpaper(
                document=Document(file_id="d", file_unique_id="u"), dark_theme_dimming=0
            ).type
            == "wallpaper"
        )
        assert (
            BackgroundTypePattern(
                document=Document(file_id="d", file_unique_id="u"),
                fill=BackgroundFillSolid(color=0),
                intensity=0,
            ).type
            == "pattern"
        )
        assert BackgroundTypeChatTheme(theme_name="dark").type == "chat_theme"

    def test_fill_union_hydrates_by_discriminator(self) -> None:
        for raw, expected in (
            ({"type": "solid", "color": 1}, BackgroundFillSolid),
            (
                {"type": "gradient", "top_color": 1, "bottom_color": 2, "rotation_angle": 45},
                BackgroundFillGradient,
            ),
            ({"type": "freeform_gradient", "colors": [1, 2, 3]}, BackgroundFillFreeformGradient),
        ):
            assert isinstance(
                BackgroundTypeFill.from_dict(
                    {"type": "fill", "dark_theme_dimming": 0, "fill": raw}
                ).fill,
                expected,
            )
            assert isinstance(expected.from_dict(raw), expected)

    def test_fill_alias_members(self) -> None:
        assert set(t.get_args(BackgroundFill)) == {
            BackgroundFillSolid,
            BackgroundFillGradient,
            BackgroundFillFreeformGradient,
        }

    def test_background_type_alias_members(self) -> None:
        assert set(t.get_args(BackgroundType)) == {
            BackgroundTypeFill,
            BackgroundTypeWallpaper,
            BackgroundTypePattern,
            BackgroundTypeChatTheme,
        }

    def test_chat_background_round_trip(self) -> None:
        raw: dict[str, t.Any] = {
            "type": {
                "type": "wallpaper",
                "document": {"file_id": "d", "file_unique_id": "u", "file_size": 10},
                "dark_theme_dimming": 70,
                "is_blurred": True,
                "is_moving": False,
            }
        }
        background = ChatBackground.from_dict(raw)
        assert isinstance(background.type, BackgroundTypeWallpaper)
        assert background.type.dark_theme_dimming == 70
        assert background.type.is_blurred is True
        assert background.type.is_moving is False
        assert background.type.document is not None
        assert background.type.document.file_size == 10
        assert background.to_dict() == raw

    def test_pattern_background_with_gradient_fill_round_trip(self) -> None:
        raw: dict[str, t.Any] = {
            "type": {
                "type": "pattern",
                "document": {"file_id": "d", "file_unique_id": "u"},
                "fill": {
                    "type": "freeform_gradient",
                    "colors": [16777215, 8421504, 0, 123456],
                },
                "intensity": -40,
                "is_inverted": True,
            }
        }
        assert ChatBackground.from_dict(raw).to_dict() == raw

    def test_message_chat_background_set_is_typed(self) -> None:
        hints = t.get_type_hints(Message)
        assert hints["chat_background_set"] == (ChatBackground | None)
        message = Message.from_dict(
            {
                "message_id": 4,
                "date": 1700000000,
                "chat": {"id": 1, "type": "private"},
                "chat_background_set": {"type": {"type": "chat_theme", "theme_name": "classic"}},
            }
        )
        assert message.chat_background_set is not None
        assert message.chat_background_set.type == BackgroundTypeChatTheme(theme_name="classic")

    def test_payment_and_preview_fields_on_message_are_typed(self) -> None:
        hints = t.get_type_hints(Message)
        assert hints["invoice"] == (Invoice | None)
        assert hints["successful_payment"] == (SuccessfulPayment | None)
        assert t.get_type_hints(Chat)["id"] == (int | str)

    def test_unknown_background_variant_stays_raw(self) -> None:
        background = ChatBackground.from_dict({"type": {"type": "brand_new"}})
        assert background.type == {"type": "brand_new"}

    @pytest.mark.parametrize(
        "cls",
        [
            BackgroundFillSolid,
            BackgroundFillGradient,
            BackgroundFillFreeformGradient,
            BackgroundTypeFill,
            BackgroundTypeWallpaper,
            BackgroundTypePattern,
            BackgroundTypeChatTheme,
            ChatBackground,
        ],
    )
    def test_frozen_dataclasses(self, cls: type[t.Any]) -> None:
        assert dataclasses.is_dataclass(cls)
        assert cls.__dataclass_params__.frozen  # type: ignore[attr-defined]
