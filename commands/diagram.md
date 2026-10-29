---
description: Generate a diagram (flowchart, sequence, ER, architecture...) from a plain-English idea
argument-hint: <describe what you want to visualize>
---

Use the `diagram-from-prompt` skill to turn the following idea into a diagram:

$ARGUMENTS

If no description was given above, ask the user in one short question what they want to visualize.
Pick the best diagram type, write valid Mermaid, render it with the `render_diagram` tool
(format `html` unless the user asked for svg/png), then tell the user the file path and offer one
concrete refinement.
