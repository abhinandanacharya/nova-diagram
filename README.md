# nova-diagram

**Turn a plain-English idea into a flowchart, sequence diagram, ER diagram, architecture diagram and more, right inside Claude.**

Describe what you want ("show the login flow with account lockout after 5 failed attempts") and Claude picks the right diagram type, writes valid [Mermaid](https://mermaid.js.org/), and saves it as an interactive HTML page you can open, share or download as SVG.

- **Zero dependencies.** The MCP server is plain Node.js (18+). No `npm install` needed.
- **Skill + command + tools.** A skill that teaches Claude good diagram design, a `/diagram` slash command, and three MCP tools.
- **Works offline-first for your files.** Source is always saved as `.mmd`; HTML loads Mermaid from a pinned CDN version.

## Install (Claude Code)

```text
/plugin marketplace add abhinandanacharya/nova-diagram
/plugin install nova-diagram@nova-diagram
```

Then just ask:

```text
/diagram checkout flow: cart -> payment -> order confirmation, with a failed-payment path
```

or in normal chat: *"Draw the sequence diagram for OAuth login with refresh tokens."*

Diagrams are saved to `./diagrams/` in your current project.

## Use without the plugin system

**MCP only** (any MCP client, including Claude Desktop): add to your config

```json
{
  "mcpServers": {
    "nova-diagram": {
      "command": "node",
      "args": ["/absolute/path/to/nova-diagram/mcp/server.js"]
    }
  }
}
```

**Skill only** (claude.ai): zip the skill folder and upload it under Settings, Capabilities, Skills:

```bash
cd skills && zip -r diagram-from-prompt.zip diagram-from-prompt
```

Without the MCP server the skill still works: Claude returns a ```` ```mermaid ```` block, which claude.ai and GitHub render natively.

## What's inside

| Path | Purpose |
|---|---|
| `skills/diagram-from-prompt/SKILL.md` | How Claude chooses a diagram type and avoids syntax errors |
| `commands/diagram.md` | The `/diagram` slash command |
| `mcp/server.js` | Zero-dependency MCP server (stdio) |
| `mcp/render.js` | Validation + HTML/SVG/PNG output |
| `mcp/cheatsheet.js` | Mermaid syntax cheatsheets per diagram type |
| `.mcp.json` | Registers the MCP server with the plugin |
| `.claude-plugin/` | Plugin and marketplace manifests |
| `examples/` | Sample `.mmd` diagrams |

## MCP tools

| Tool | What it does |
|---|---|
| `render_diagram` | Validates Mermaid code and writes `.mmd` plus `.html` (default), `.svg` or `.png` |
| `diagram_cheatsheet` | Returns syntax reference for flowchart, sequence, class, state, er, gantt, mindmap, journey, gitgraph, architecture |
| `validate_diagram` | Quick checks (diagram type, quotes, brackets) without writing files |

### SVG and PNG export

HTML export has no dependencies. For `svg`/`png`, install Mermaid CLI once:

```bash
npm i -g @mermaid-js/mermaid-cli
```

## Supported diagrams

Flowchart, sequence, class, state, ER, Gantt, mindmap, user journey, gitGraph, architecture, plus anything else Mermaid supports (C4, timeline, quadrant, sankey, and more).

## Development

```bash
npm test
node mcp/server.js   # speaks JSON-RPC over stdio
```

## Known limitations

- The HTML page loads Mermaid from jsDelivr, so viewing it needs internet access.
- `validate_diagram` is a lightweight check; Mermaid itself reports the final syntax errors when the page renders.

## License

MIT, by [Abhinandan Acharya](https://github.com/abhinandanacharya).
