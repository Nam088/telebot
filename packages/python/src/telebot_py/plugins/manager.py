"""Plugin registration, ordering, dispatch, and removal (T044).

Backs the future ``Application.add_plugin`` / ``Application.remove_plugin``
surface (contracts/public-api.md section 8). Hook order is resolved from the
plugins' ``order`` argument and ``depends_on`` graph; cycles raise the typed
:class:`PluginOrderingError` (data-model.md section 7).
"""

from __future__ import annotations

import dataclasses
import typing as t

from telebot_py.bot.errors import TelebotError
from telebot_py.plugins.plugin import Plugin

if t.TYPE_CHECKING:
    from telebot_py.kernel.context import CallbackContext

T = t.TypeVar("T")


class PluginError(TelebotError):
    """Base class for plugin system failures."""


class PluginOrderingError(PluginError):
    """The plugins' ``depends_on`` declarations form a dependency cycle."""


@dataclasses.dataclass(slots=True)
class _Entry:
    """Bookkeeping for one registered plugin."""

    plugin: Plugin
    order: int
    seq: int
    installed: bool


class PluginManager:
    """Owns plugin lifecycle: ordered dispatch, namespaced state, removal.

    Standalone by design; the kernel integration pass owns one manager per
    application and calls :meth:`dispatch_response` / :meth:`dispatch_error`
    around handler dispatch.

    Example:
        >>> manager = PluginManager()
        >>> manager.add_plugin(I18nPlugin(default_locale="en", locales=locales))
        >>> result = await manager.dispatch_response(context, response)
    """

    def __init__(self) -> None:
        """Create an empty manager with no plugins installed."""
        self._entries: dict[str, _Entry] = {}
        self._states: dict[str, dict[str, t.Any]] = {}
        self._seq = 0

    @property
    def plugins(self) -> list[Plugin]:
        """Installed plugins in hook order (resolved on every access).

        Returns:
            A fresh list; mutating it does not affect the manager.
        """
        return [entry.plugin for entry in self._installed_in_order()]

    def has(self, name: str) -> bool:
        """Whether a plugin with the given name is currently installed.

        Args:
            name: Plugin name to look up.

        Returns:
            True when installed; pending (unsatisfied dependencies) plugins
            do not count.
        """
        entry = self._entries.get(name)
        return entry is not None and entry.installed

    def add_plugin(self, plugin: Plugin, *, order: int = 0) -> None:
        """Register a plugin and install every registrant whose deps are met.

        Plugins whose ``depends_on`` names are not all installed yet stay
        pending and are flushed automatically by later ``add_plugin`` calls.

        Args:
            plugin: The plugin to register.
            order: Relative hook position; lower values hook first, ties
                fall back to registration order.

        Raises:
            ValueError: If a plugin with the same name is already registered.
            PluginOrderingError: If the dependency graph now contains a cycle
                (the registration is rolled back).
        """
        name = plugin.name
        if name in self._entries:
            msg = f'plugin "{name}" is already registered'
            raise ValueError(msg)
        entry = _Entry(plugin=plugin, order=order, seq=self._seq, installed=False)
        self._seq += 1
        self._entries[name] = entry
        try:
            resolved = self._resolve(list(self._entries.values()))
        except PluginOrderingError:
            del self._entries[name]
            raise
        self._install_ready(resolved)

    def remove_plugin(self, name: str) -> None:
        """Uninstall a plugin; its hooks stop firing before the next update.

        The name can be reused afterwards and its namespaced state is
        dropped.

        Args:
            name: Name of the registered plugin to remove.

        Raises:
            ValueError: If no plugin with that name is registered.
        """
        entry = self._entries.pop(name, None)
        if entry is None:
            msg = f'plugin "{name}" is not registered'
            raise ValueError(msg)
        self._states.pop(name, None)

    def state(self, name: str) -> dict[str, t.Any]:
        """Mutable namespaced state for one plugin, created on first access.

        Args:
            name: Plugin name owning the state.

        Returns:
            The plugin's state dict; distinct plugins never see each other's
            state.
        """
        return self._states.setdefault(name, {})

    async def dispatch_response(self, context: CallbackContext, response: T) -> T:
        """Run every installed response hook over ``response`` in hook order.

        Each hook's return value feeds the next hook; the final value is
        returned. This is the seam the kernel integration calls around
        handler results.

        Args:
            context: The callback context of the update being processed.
            response: The pipeline result to transform.

        Returns:
            The transformed response.
        """
        result: t.Any = response
        for entry in self._installed_in_order():
            result = await entry.plugin.on_response(context, result)
        return t.cast("T", result)

    async def dispatch_error(self, context: CallbackContext, error: Exception) -> None:
        """Notify every installed error hook of a failure, in hook order.

        This is the seam the kernel integration calls when a handler (or an
        error handler) raises.

        Args:
            context: The callback context of the failed update.
            error: The exception that was raised.
        """
        for entry in self._installed_in_order():
            await entry.plugin.on_error(context, error)

    def _installed_in_order(self) -> list[_Entry]:
        installed = [entry for entry in self._entries.values() if entry.installed]
        return self._resolve(installed)

    def _install_ready(self, resolved: list[_Entry]) -> None:
        """Install every pending plugin whose dependencies are installed.

        Args:
            resolved: All registered entries in dependency order.
        """
        for entry in resolved:
            if entry.installed:
                continue
            if all(
                dep in self._entries and self._entries[dep].installed
                for dep in entry.plugin.depends_on
            ):
                entry.installed = True

    def _resolve(self, entries: list[_Entry]) -> list[_Entry]:
        """Topologically order ``entries`` by depends_on, then (order, seq).

        Args:
            entries: Entries to sort; dependencies pointing outside the set
                are ignored.

        Returns:
            The entries in hook order.

        Raises:
            PluginOrderingError: If the dependencies contain a cycle.
        """
        by_name = {entry.plugin.name: entry for entry in entries}
        indegree: dict[str, int] = {}
        dependents: dict[str, list[str]] = {}
        for entry in entries:
            name = entry.plugin.name
            deps = [dep for dep in entry.plugin.depends_on if dep in by_name]
            indegree[name] = len(deps)
            for dep in deps:
                dependents.setdefault(dep, []).append(name)

        def sort_key(name: str) -> tuple[int, int]:
            entry = by_name[name]
            return (entry.order, entry.seq)

        ready = sorted((name for name, degree in indegree.items() if degree == 0), key=sort_key)
        out: list[_Entry] = []
        while ready:
            name = ready.pop(0)
            out.append(by_name[name])
            unlocked = []
            for dependent in dependents.get(name, ()):
                indegree[dependent] -= 1
                if indegree[dependent] == 0:
                    unlocked.append(dependent)
            if unlocked:
                ready.extend(unlocked)
                ready.sort(key=sort_key)

        if len(out) != len(entries):
            stuck = sorted(
                name
                for name, degree in indegree.items()
                if degree > 0 and name not in {entry.plugin.name for entry in out}
            )
            msg = f"plugin dependency cycle among: {', '.join(stuck)}"
            raise PluginOrderingError(msg)
        return out
