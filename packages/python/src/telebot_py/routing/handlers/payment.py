"""Handlers for payments, invoicing, and paid media updates."""

from __future__ import annotations

from telebot_py.routing.handlers.base import BaseHandler
from telebot_py.types import Update


class PreCheckoutQueryHandler(BaseHandler):
    """Handler for incoming pre-checkout queries.

    Matches ``pre_checkout_query`` updates, allowing validation of shipping
    information and confirmation of the final order before payment
    processing. Mirrors the node ``PreCheckoutQueryHandler``.
    """

    def check_update(self, update: object) -> bool:
        """Return whether the update carries a pre-checkout query.

        Args:
            update: The incoming update.

        Returns:
            ``True`` when the update carries a ``pre_checkout_query`` payload.
        """
        return isinstance(update, Update) and update.pre_checkout_query is not None


class ShippingQueryHandler(BaseHandler):
    """Handler for incoming shipping queries.

    Matches ``shipping_query`` updates (flexible-price invoices), allowing
    the bot to provide available shipping options for the delivery address.
    Mirrors the node ``ShippingQueryHandler``.
    """

    def check_update(self, update: object) -> bool:
        """Return whether the update carries a shipping query.

        Args:
            update: The incoming update.

        Returns:
            ``True`` when the update carries a ``shipping_query`` payload.
        """
        return isinstance(update, Update) and update.shipping_query is not None


class PurchasedPaidMediaHandler(BaseHandler):
    """Handler for purchased paid media events.

    Matches ``purchased_paid_media`` updates, triggered when a user buys
    paid media with Telegram Stars. Mirrors the node
    ``PurchasedPaidMediaHandler``.
    """

    def check_update(self, update: object) -> bool:
        """Return whether the update carries a purchased paid media event.

        Args:
            update: The incoming update.

        Returns:
            ``True`` when the update carries a ``purchased_paid_media``
            payload.
        """
        return isinstance(update, Update) and update.purchased_paid_media is not None
