---
name: diagram-from-prompt
description: Turn an idea, spec, codebase flow or system description into a diagram. Use this whenever the user asks for a flowchart, flow chart, sequence diagram, ER diagram, database schema visual, class diagram, state machine, architecture or system design diagram, user journey, Gantt chart, mindmap, or says things like "visualize this", "draw this", "diagram my idea", "map out this flow", even if they never say the word "Mermaid".
---

# Diagram from prompt

Convert what the user describes into a correct, readable Mermaid diagram and render it to a file.

## Workflow

1. **Understand the idea.** If the request is clear, do not ask questions; make reasonable assumptions and state them in one line afterwards. Ask at most one question, and only if the subject itself is unclear.
2. **Choose the diagram type** with the table below.
3. **Get syntax right.** If you are not 100% sure of the syntax for the chosen type, call `diagram_cheatsheet` first.
4. **Write the Mermaid code** following the rules below.
5. **Render** with `render_diagram` (default format `html`; use `svg` or `png` only if the user asks, since those need the optional mermaid-cli). If the tool is unavailable, output the code in a ```mermaid block instead.
6. **Report briefly:** file path, the assumptions you made, and one concrete refinement you can offer.

## Choosing the type

| The user wants to show... | Use |
|---|---|
| Process, algorithm, decision logic, user flow | `flowchart TD` (or `LR` for wide flows) |
| Who calls whom over time (API calls, auth, checkout) | `sequenceDiagram` |
| Database tables and relations | `erDiagram` |
| Classes, interfaces, domain model | `classDiagram` |
| Lifecycle, order status, UI states | `stateDiagram-v2` |
| System components, services, cloud layout | `flowchart` with `subgraph`s, or `architecture-beta` |
| Schedule, roadmap | `gantt` |
| Brainstorm, topic breakdown | `mindmap` |
| Customer or user experience steps | `journey` |
| Branching strategy | `gitGraph` |

## Rules that prevent broken diagrams

- Quote any label containing spaces plus special characters: `A["Validate (JWT)"]`. Unquoted parentheses, slashes, colons or `#` break parsing.
- Never use a bare lowercase `end` as a node name or label; write `End` or `"end"`.
- Node IDs are short and alphanumeric (`auth`, `db1`); put the readable text in the label.
- Use `<br/>` for line breaks inside labels, not `\n`.
- Keep it readable: aim for 25 nodes or fewer per diagram. If the system is bigger, split it into an overview plus detail diagrams, or use `subgraph` groups.
- Label decision branches (`-->|Yes|`) and keep one clear start and end.
- In `sequenceDiagram`, declare participants first with aliases (`participant U as User`) to control order.
- In `erDiagram`, use cardinality syntax (`USER ||--o{ ORDER : places`) and list key attributes only, not every column.
- One diagram, one message. Do not mix flow and structure in the same chart.
- Do not invent facts about the user's system. Where something is assumed, mark it in the label with a `?` or mention it in your reply.

## Iterating

When the user asks for changes, edit the existing code and re-render with the same `title` so the file is overwritten. Common follow-ups: add error paths, group into subgraphs, switch `TD` to `LR`, split into two diagrams, add a legend via a note.
