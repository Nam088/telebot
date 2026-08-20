---
name: subagent-delegation
trigger: always_on
---

# Subagent Delegation & Communication Rule

Whenever a parent agent invokes a subagent via `invoke_subagent` or sends instructions via `send_message`:

## 1. Mandatory Structured Prompting
All subagent prompts and dispatched tasks MUST follow the standard prompt template defined in `.agents/templates/subagent-prompt-template.md`:
- **Mission & Scope**: State exact task IDs and clear boundaries.
- **Target Files**: Enumerate all files to create or modify.
- **Ground Truth & Context7**: Mandate external documentation verification via Context7 MCP.
- **Technical Constraints**: Strict types (no loose `any`), PTB naming conventions, zero required runtime dependencies.
- **TDD Workflow**: Test first (Red) -> Implement (Green) -> Refactor.
- **Definition of Done (Quality Gates)**: Explicit requirements to run and pass `npm run build`, `npm run test:coverage` (>80% lines), and `npm run docs` (0 errors, 0 warnings).

## 2. Quality Gate Enforcement
- Parent agents must verify that subagents report the completion of all quality gates before accepting work as done.
- If a subagent reports failures or misses quality checks, the parent agent must instruct the subagent to fix the issues before completing the task.
