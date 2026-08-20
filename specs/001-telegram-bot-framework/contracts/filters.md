# Contract: Filters (FR-5)

```ts
interface BaseFilter {
  check(message: Message): boolean | Promise<boolean>;
  and(other: BaseFilter): CompositeFilter;
  or(other: BaseFilter): CompositeFilter;
  not(): NegateFilter;
}
```

- **Purity**: `check` must not mutate `message` or any shared state — filters may be evaluated speculatively by handlers whose `checkUpdate` calls into a filter before deciding to run.
- **Combinators**: `.and()`/`.or()`/`.not()` return a new `BaseFilter` (never mutate the receiver), mirroring PTB's `&`/`|`/`~` operator overloads, which have no TypeScript equivalent (Naming Conventions research entry).
- **Built-in constants** (`filters.TEXT`, `filters.COMMAND`, `filters.PHOTO`, ... — full list in spec.md FR-5) are pre-built `BaseFilter` instances, not factory functions — `filters.TEXT`, not `filters.TEXT()`.
- **Namespaced groups**: `filters.ChatType.PRIVATE|GROUP|SUPERGROUP|CHANNEL` and `filters.StatusUpdate.*` are `BaseFilter` instances under a namespace object, matching PTB's `filters.ChatType.PRIVATE` access pattern exactly (Naming Conventions noun rule — namespace and constant names are unchanged from PTB).
- **Parameterized filters**: `filters.Regex(pattern, flags?)` and `filters.Custom(fn)` are factory functions (called with `()`) since they take arguments, per the "is it called with `()`?" rule — but the filter instance they return still behaves like any other `BaseFilter`.
- **Regex side effect**: a filter built by `filters.Regex(...)` that matches populates `context.matches` (an array of `RegExpMatchArray`) for the handler's callback to read — this is the one filter with an observable effect beyond its boolean result, and it must run to completion (no early-exit short-circuiting) so `matches` is fully populated before `handleUpdate` runs.
