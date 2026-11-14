# Agent Definitions Update

The current `.opencode/agents/` definitions provide more consistent, detailed guidance for each subagent. This note summarizes each agent's role, assigned model, and main permission boundaries; the agent files remain the source of truth for full workflows and outputs.

## Building agents

| Agent                 | Model                          | Main permission setup                                                                                                                            |
| --------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `building/developer`  | `opencode-go/kimi-k2.7-code`   | Read/edit allowed; shell requires approval; subagents denied; `.env` reads denied.                                                               |
| `building/fixer`      | `opencode-go/glm-5.3-flash`    | Read/edit allowed; shell requires approval; subagents denied; `.env` reads denied.                                                               |
| `building/debugger`   | `opencode-go/deepseek-v4-pro`  | Read/edit allowed; shell requires approval; subagents denied; `.env` reads denied.                                                               |
| `building/explainer`  | `opencode-go/claude-haiku-5-5` | Read-only; shell and edits denied; subagents denied; `.env` reads denied.                                                                        |
| `building/documenter` | `opencode-go/gpt-6-luna`       | Read-only except Markdown edits; shell and subagents denied; `.env` reads denied. Edits under `.opencode/agents/` and to `AGENTS.md` are denied. |

Developer handles substantial implementation, Fixer makes focused corrections, and Explainer describes existing code. Documenter maintains implementation-accurate Markdown. Debugger takes on complex bugs escalated from Fixer.

## Planning agents

| Agent                        | Model                         | Main permission setup                                                     |
| ---------------------------- | ----------------------------- | ------------------------------------------------------------------------- |
| `planning/feature-developer` | `opencode-go/deepseek-v4-pro` | Read-only; shell and edits denied; subagents denied; `.env` reads denied. |
| `planning/code-reviewer`     | `opencode-go/deepseek-v4-pro` | Read-only; shell and edits denied; tasks denied; `.env` reads denied.     |
| `planning/refiner`           | `opencode-go/gemini-4-argon`  | Read-only; shell and edits denied; subagents denied; `.env` reads denied. |
| `planning/simplifier`        | `opencode-go/glm-5.3-flash`   | Read-only; shell and edits denied; subagents denied; `.env` reads denied. |

Feature Developer breaks approved requests into implementation tasks. Code Reviewer reports evidence-based findings without making changes. Refiner recommends targeted improvements, while Simplifier seeks less complex approaches.

## What changed

- Existing agent descriptions and guidance were expanded and made more consistent, including mission, inputs, workflow, guidelines, output, and boundaries.
- Frontmatter descriptions were made more specific. Some agents also switched to the nested `permission` map format; others retain the `permissions` rule-list format.
- Feature Developer's model changed to `opencode-go/deepseek-v4-pro`; Simplifier's changed to `opencode-go/glm-5.3-flash`.
- Documenter's explicit agent-file edit denial now targets `.opencode/agents/**/*.md` (and the single-level `.opencode/agents/*` pattern), rather than a broad agent-directory pattern.
- Planning agents now consider implementation plans alongside their other review and recommendation work.

## New: Debugger

`building/debugger` is a read-and-edit agent for complex bugs that Fixer cannot safely or successfully resolve. It traces root causes across relevant files, preserves intended behavior, and reports the cause, solution, changed files, verification, and remaining risks. Shell use requires approval, subagent use is denied, and reads of `.env` files are denied.

For exact permission patterns and complete instructions, see the corresponding files in `.opencode/agents/building/` and `.opencode/agents/planning/`.
