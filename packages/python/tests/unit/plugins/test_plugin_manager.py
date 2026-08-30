"""Unit tests for the plugin system (T039, plugin half).

Covers registration ordering, response-hook pipeline mutation in declared
order, error-hook delivery, namespaced state isolation, runtime removal, and
typed ordering-cycle errors — per contracts/public-api.md section 8 and
data-model.md section 7.
"""

from __future__ import annotations

from collections.abc import Sequence
from typing import Any

import pytest

from telebot_py import ApplicationBuilder, CallbackContext
from telebot_py.plugins import (
    Plugin,
    PluginError,
    PluginManager,
    PluginOrderingError,
)
from telebot_py.types import Update

ME_PAYLOAD = {"id": 999, "is_bot": True, "first_name": "EchoBot", "username": "echo_bot"}


def make_context(bot_transport: Any, ok_response: Any, make_update: Any) -> CallbackContext:
    """Build a real CallbackContext backed by a MockTransport app."""
    app = (
        ApplicationBuilder()
        .token("123456:TEST")
        .transport(bot_transport(ok_response(ME_PAYLOAD)))
        .build()
    )
    return CallbackContext(app, Update.from_dict(make_update()))


class AppendingPlugin(Plugin):
    """Test plugin appending its marker to the response pipeline."""

    def __init__(self, name: str, marker: str, *, depends_on: Sequence[str] = ()) -> None:
        self.name = name
        self.marker = marker
        self.depends_on = tuple(depends_on)

    async def on_response(self, context: CallbackContext, response: object) -> object:
        assert isinstance(response, str)
        return response + self.marker


class RecordingErrorPlugin(Plugin):
    """Test plugin recording on_error deliveries."""

    def __init__(self, name: str, sink: list[tuple[str, object, Exception]]) -> None:
        self.name = name
        self.sink = sink

    async def on_error(self, context: CallbackContext, error: Exception) -> None:
        self.sink.append((self.name, context, error))


class TestRegistrationOrdering:
    async def test_hooks_fire_in_declared_order_not_insertion_order(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_update: Any,
    ) -> None:
        manager = PluginManager()
        manager.add_plugin(AppendingPlugin("late", "2"), order=2)
        manager.add_plugin(AppendingPlugin("early", "1"), order=1)
        ctx = make_context(bot_transport, ok_response, make_update)

        result = await manager.dispatch_response(ctx, "")
        assert result == "12"

    async def test_equal_order_falls_back_to_insertion_order(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_update: Any,
    ) -> None:
        manager = PluginManager()
        manager.add_plugin(AppendingPlugin("first", "a"))
        manager.add_plugin(AppendingPlugin("second", "b"))
        ctx = make_context(bot_transport, ok_response, make_update)

        assert await manager.dispatch_response(ctx, "") == "ab"

    async def test_depends_on_constrains_hook_order(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_update: Any,
    ) -> None:
        manager = PluginManager()
        # "b" is added first but depends on "a", so "a" must hook first.
        manager.add_plugin(AppendingPlugin("b", "B", depends_on=["a"]))
        manager.add_plugin(AppendingPlugin("a", "A"))
        ctx = make_context(bot_transport, ok_response, make_update)

        assert await manager.dispatch_response(ctx, "") == "AB"

    async def test_duplicate_plugin_name_raises(self) -> None:
        manager = PluginManager()
        manager.add_plugin(AppendingPlugin("dup", "1"))
        with pytest.raises(ValueError, match="dup"):
            manager.add_plugin(AppendingPlugin("dup", "2"))


class TestResponseHooks:
    async def test_hooks_mutate_pipeline_result_in_order(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_update: Any,
    ) -> None:
        manager = PluginManager()
        manager.add_plugin(AppendingPlugin("p1", "[p1]"), order=1)
        manager.add_plugin(AppendingPlugin("p2", "[p2]"), order=2)
        manager.add_plugin(AppendingPlugin("p3", "[p3]"), order=3)
        ctx = make_context(bot_transport, ok_response, make_update)

        result = await manager.dispatch_response(ctx, "base")
        assert result == "base[p1][p2][p3]"

    async def test_default_on_response_is_passthrough(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_update: Any,
    ) -> None:
        class Inert(Plugin):
            name = "inert"

        manager = PluginManager()
        manager.add_plugin(Inert())
        ctx = make_context(bot_transport, ok_response, make_update)

        assert await manager.dispatch_response(ctx, 42) == 42


class TestErrorHooks:
    async def test_error_hooks_receive_context_and_error_in_order(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_update: Any,
    ) -> None:
        sink: list[tuple[str, object, Exception]] = []
        manager = PluginManager()
        manager.add_plugin(RecordingErrorPlugin("e1", sink), order=1)
        manager.add_plugin(RecordingErrorPlugin("e2", sink), order=2)
        ctx = make_context(bot_transport, ok_response, make_update)
        boom = RuntimeError("boom")

        await manager.dispatch_error(ctx, boom)

        assert [(name, context, error) for name, context, error in sink] == [
            ("e1", ctx, boom),
            ("e2", ctx, boom),
        ]

    async def test_default_on_error_is_noop(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_update: Any,
    ) -> None:
        class Inert(Plugin):
            name = "inert"

        manager = PluginManager()
        manager.add_plugin(Inert())
        ctx = make_context(bot_transport, ok_response, make_update)

        await manager.dispatch_error(ctx, RuntimeError("boom"))  # must not raise


class TestNamespacedState:
    def test_state_is_namespaced_per_plugin(self) -> None:
        manager = PluginManager()
        manager.add_plugin(AppendingPlugin("a", "x"))
        manager.add_plugin(AppendingPlugin("b", "y"))

        manager.state("a")["counter"] = 1
        assert manager.state("a")["counter"] == 1
        assert "counter" not in manager.state("b")
        assert manager.state("a") is manager.state("a")

    def test_state_cleared_on_removal(self) -> None:
        manager = PluginManager()
        manager.add_plugin(AppendingPlugin("a", "x"))
        manager.state("a")["counter"] = 1

        manager.remove_plugin("a")
        assert manager.state("a") == {}


class TestRuntimeRemoval:
    async def test_removal_stops_hooks_before_next_update(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_update: Any,
    ) -> None:
        manager = PluginManager()
        manager.add_plugin(AppendingPlugin("p1", "[p1]"))
        manager.add_plugin(AppendingPlugin("p2", "[p2]"))
        ctx = make_context(bot_transport, ok_response, make_update)
        assert await manager.dispatch_response(ctx, "") == "[p1][p2]"

        manager.remove_plugin("p1")
        assert await manager.dispatch_response(ctx, "") == "[p2]"
        assert not manager.has("p1")

    async def test_removed_name_can_be_reused(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_update: Any,
    ) -> None:
        manager = PluginManager()
        manager.add_plugin(AppendingPlugin("p1", "old"))
        manager.remove_plugin("p1")
        manager.add_plugin(AppendingPlugin("p1", "new"))
        ctx = make_context(bot_transport, ok_response, make_update)

        assert await manager.dispatch_response(ctx, "") == "new"

    def test_removing_unknown_plugin_raises(self) -> None:
        manager = PluginManager()
        with pytest.raises(ValueError, match="ghost"):
            manager.remove_plugin("ghost")


class TestOrderingCycles:
    def test_mutual_dependency_cycle_raises_typed_error(self) -> None:
        manager = PluginManager()
        manager.add_plugin(AppendingPlugin("p1", "1", depends_on=["p2"]))
        with pytest.raises(PluginOrderingError, match="cycle"):
            manager.add_plugin(AppendingPlugin("p2", "2", depends_on=["p1"]))

    def test_self_dependency_raises_typed_error(self) -> None:
        manager = PluginManager()
        with pytest.raises(PluginOrderingError, match="cycle"):
            manager.add_plugin(AppendingPlugin("solo", "s", depends_on=["solo"]))

    def test_ordering_error_is_a_plugin_error(self) -> None:
        assert issubclass(PluginOrderingError, PluginError)


class TestDeferredInstallation:
    async def test_plugin_with_missing_dependency_stays_pending(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_update: Any,
    ) -> None:
        manager = PluginManager()
        manager.add_plugin(AppendingPlugin("waiting", "W", depends_on=["base"]))
        ctx = make_context(bot_transport, ok_response, make_update)

        assert not manager.has("waiting")
        assert await manager.dispatch_response(ctx, "") == ""

    async def test_dependency_installation_flushes_pending(
        self,
        bot_transport: Any,
        ok_response: Any,
        make_update: Any,
    ) -> None:
        manager = PluginManager()
        manager.add_plugin(AppendingPlugin("waiting", "W", depends_on=["base"]))
        manager.add_plugin(AppendingPlugin("base", "B"))
        ctx = make_context(bot_transport, ok_response, make_update)

        assert manager.has("waiting")
        assert await manager.dispatch_response(ctx, "") == "BW"
