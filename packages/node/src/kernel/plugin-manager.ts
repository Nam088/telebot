/**
 * Plugin installation, ordering, tracking, and removal machinery backing {@link Application}.
 *
 * @packageDocumentation
 */

import type { Application } from "./app.js";
import type { Plugin } from "./plugin.js";
import type { MiddlewareFn } from "./dispatcher.js";
import type { BaseHandler } from "../routing/handlers.js";
import type { ErrorHandlerCallback } from "./app.js";

/**
 * Lifecycle hook callback registered through `onInit` / `onShutdown`.
 */
export type LifecycleHook = () => Promise<void> | void;

/**
 * Everything a plugin registered during `install`, tracked so {@link PluginManager.remove} can
 * deregister it cleanly.
 */
interface PluginRegistrations {
  middlewares: MiddlewareFn[];
  initHooks: LifecycleHook[];
  shutdownHooks: LifecycleHook[];
  handlers: BaseHandler[];
  errorHandlers: ErrorHandlerCallback[];
}

/**
 * Owns plugin lifecycle for an {@link Application}: dependency-ordered installation, per-plugin
 * registration tracking, namespaced plugin state, and full removal.
 *
 * The manager mutates the same middleware/hook/handler collections the application dispatches
 * from, so installations and removals take effect immediately.
 */
export class PluginManager {
  private readonly installed: Set<string> = new Set();
  private readonly byName: Map<string, Plugin> = new Map();
  private readonly pending: Plugin[] = [];
  private readonly registrations: Map<string, PluginRegistrations> = new Map();
  private readonly states: Map<string, Record<string, unknown>> = new Map();
  private active?: string;

  /**
   * @param app - Owning application (used to invoke `uninstall` and clear bot hooks).
   * @param middlewares - Live middleware collection of the application.
   * @param initHooks - Live init hook collection of the application.
   * @param shutdownHooks - Live shutdown hook collection of the application.
   * @param handlers - Live handler group map of the application.
   * @param errorHandlers - Live error handler collection of the application.
   */
  constructor(
    private readonly app: Application,
    private readonly middlewares: MiddlewareFn[],
    private readonly initHooks: LifecycleHook[],
    private readonly shutdownHooks: LifecycleHook[],
    private readonly handlers: Map<number, BaseHandler[]>,
    private readonly errorHandlers: ErrorHandlerCallback[],
  ) {}

  /**
   * Returns whether a plugin with the given name is currently installed.
   *
   * @param name - Plugin name to look up.
   * @returns True if the plugin is installed.
   */
  public has(name: string): boolean {
    return this.installed.has(name);
  }

  /**
   * Queues a plugin for installation and immediately installs every queued plugin whose
   * `dependsOn` dependencies are satisfied, in ascending `priority` order.
   *
   * @param plugin - Plugin to install.
   * @throws When a plugin with the same name is already installed or pending.
   */
  public use(plugin: Plugin): void {
    if (this.installed.has(plugin.name) || this.pending.some((p) => p.name === plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already installed.`);
    }
    this.pending.push(plugin);
    this.flush();
  }

  /**
   * Installs all pending plugins whose dependencies are now satisfied, repeating until no more
   * become ready. Remaining pending plugins are still waiting on dependencies not yet passed to
   * `usePlugin`.
   */
  public flush(): void {
    let progressed = true;
    while (progressed) {
      progressed = false;
      const ready = this.pending
        .filter((p) => (p.dependsOn ?? []).every((dep) => this.installed.has(dep)))
        .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
      for (const plugin of ready) {
        this.pending.splice(this.pending.indexOf(plugin), 1);
        this.install(plugin);
        progressed = true;
      }
    }
  }

  /**
   * Throws when plugins are still pending because their dependencies were never installed.
   * Called right before the application starts serving updates.
   *
   * @throws When any plugin is still pending at startup.
   */
  public assertReady(): void {
    if (this.pending.length > 0) {
      const names = this.pending.map((p) => p.name).join(", ");
      throw new Error(
        `Cannot start: plugins with unsatisfied dependencies are still pending: ${names}.`,
      );
    }
  }

  /**
   * Returns the mutable namespaced state object for a plugin, creating it on first access.
   *
   * @typeParam T - Shape the caller expects the state to have.
   * @param name - Plugin name owning the state.
   * @returns The plugin's state object.
   */
  public state<T extends Record<string, unknown> = Record<string, unknown>>(name: string): T {
    let state = this.states.get(name);
    if (!state) {
      state = {};
      this.states.set(name, state);
    }
    return state as T;
  }

  /**
   * Uninstalls a plugin: invokes its optional `uninstall` hook, deregisters every middleware,
   * handler, lifecycle hook, and error handler it added, removes its tagged bot hooks, and drops
   * its namespaced state. The name can be reused afterwards.
   *
   * @param name - Name of the installed plugin to remove.
   * @throws When no plugin with that name is installed.
   */
  public remove(name: string): void {
    const plugin = this.byName.get(name);
    if (!plugin) {
      throw new Error(`Plugin "${name}" is not installed.`);
    }
    plugin.uninstall?.(this.app);

    const reg = this.registrations.get(name);
    if (reg) {
      this.spliceAll(this.middlewares, reg.middlewares);
      this.spliceAll(this.initHooks, reg.initHooks);
      this.spliceAll(this.shutdownHooks, reg.shutdownHooks);
      this.spliceAll(this.errorHandlers, reg.errorHandlers);
      for (const handler of reg.handlers) {
        for (const group of this.handlers.values()) {
          const index = group.indexOf(handler);
          if (index !== -1) {
            group.splice(index, 1);
          }
        }
      }
    }

    this.app.bot.removeHooksByTag(name);
    this.registrations.delete(name);
    this.states.delete(name);
    this.byName.delete(name);
    this.installed.delete(name);
  }

  /**
   * Records a middleware registered while a plugin's `install` is running.
   *
   * @param fn - Middleware function just added to the application.
   */
  public trackMiddleware(fn: MiddlewareFn): void {
    this.track("middlewares", fn);
  }

  /**
   * Records an init hook registered while a plugin's `install` is running.
   *
   * @param hook - Hook just added to the application.
   */
  public trackInitHook(hook: LifecycleHook): void {
    this.track("initHooks", hook);
  }

  /**
   * Records a shutdown hook registered while a plugin's `install` is running.
   *
   * @param hook - Hook just added to the application.
   */
  public trackShutdownHook(hook: LifecycleHook): void {
    this.track("shutdownHooks", hook);
  }

  /**
   * Records a handler registered while a plugin's `install` is running.
   *
   * @param handler - Handler just added to the application.
   */
  public trackHandler(handler: BaseHandler): void {
    this.track("handlers", handler);
  }

  /**
   * Records an error handler registered while a plugin's `install` is running.
   *
   * @param callback - Error handler just added to the application.
   */
  public trackErrorHandler(callback: ErrorHandlerCallback): void {
    this.track("errorHandlers", callback);
  }

  private track(kind: keyof PluginRegistrations, item: unknown): void {
    if (this.active === undefined) {
      return;
    }
    const reg = this.registrations.get(this.active);
    if (reg) {
      (reg[kind] as unknown[]).push(item);
    }
  }

  private install(plugin: Plugin): void {
    this.registrations.set(plugin.name, {
      middlewares: [],
      initHooks: [],
      shutdownHooks: [],
      handlers: [],
      errorHandlers: [],
    });
    this.active = plugin.name;
    try {
      plugin.install(this.app);
    } finally {
      this.active = undefined;
    }
    this.installed.add(plugin.name);
    this.byName.set(plugin.name, plugin);
  }

  private spliceAll<T>(target: T[], items: T[]): void {
    for (const item of items) {
      const index = target.indexOf(item);
      if (index !== -1) {
        target.splice(index, 1);
      }
    }
  }
}
