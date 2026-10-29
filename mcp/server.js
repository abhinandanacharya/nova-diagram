#!/usr/bin/env node
// nova-diagram MCP server: zero dependencies, JSON-RPC 2.0 over stdio (newline-delimited).
import { createInterface } from "node:readline";
import { createDiagram, validate } from "./render.js";
import { CHEATSHEETS, DIAGRAM_TYPES } from "./cheatsheet.js";

const SERVER_INFO = { name: "nova-diagram", version: "1.0.0" };
const DEFAULT_PROTOCOL = "2025-06-18";

const TOOLS = [
  {
    name: "render_diagram",
    description:
      "Validate Mermaid diagram code and write it to disk. Default output is a self-contained HTML page " +
      "(interactive, dark/light, SVG download). Also always writes the .mmd source. " +
      "svg/png output requires @mermaid-js/mermaid-cli to be installed.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Diagram title; also used for the file name. Reuse it to overwrite on iteration." },
        code: { type: "string", description: "Mermaid source, starting with the diagram type (e.g. 'flowchart TD')." },
        format: { type: "string", enum: ["html", "svg", "png", "mmd"], description: "Output format. Default html." },
        theme: { type: "string", enum: ["auto", "light", "dark"], description: "Default auto (follows system)." },
        outDir: { type: "string", description: "Output directory. Default ./diagrams in the current working directory." },
      },
      required: ["code"],
    },
  },
  {
    name: "diagram_cheatsheet",
    description:
      "Return a compact Mermaid syntax reference for a diagram type. Call this before writing a diagram type you are unsure about.",
    inputSchema: {
      type: "object",
      properties: { type: { type: "string", enum: DIAGRAM_TYPES, description: "Diagram type. Omit to list all types." } },
    },
  },
  {
    name: "validate_diagram",
    description: "Run quick checks on Mermaid code (diagram type, quotes, brackets) without writing any files.",
    inputSchema: { type: "object", properties: { code: { type: "string" } }, required: ["code"] },
  },
];

const text = (t, isError = false) => ({ content: [{ type: "text", text: t }], ...(isError ? { isError: true } : {}) });

function callTool(name, args = {}) {
  switch (name) {
    case "render_diagram": {
      const r = createDiagram(args);
      if (!r.validation.ok) return text("Diagram not written:\n- " + r.validation.errors.join("\n- "), true);
      const lines = ["Diagram written:", ...r.files.map((f) => `- ${f}`)];
      if (r.validation.warnings.length) lines.push("", "Warnings:", ...r.validation.warnings.map((w) => `- ${w}`));
      if (r.notes.length) lines.push("", ...r.notes);
      const htmlFile = r.files.find((f) => f.endsWith(".html"));
      if (htmlFile) lines.push("", "Open the .html file in a browser to view it (needs internet for the Mermaid CDN).");
      return text(lines.join("\n"), r.files.length === 0);
    }
    case "diagram_cheatsheet": {
      if (!args.type) return text("Available types: " + DIAGRAM_TYPES.join(", "));
      const sheet = CHEATSHEETS[args.type];
      return sheet ? text("```mermaid\n" + sheet + "\n```") : text(`Unknown type "${args.type}". Available: ${DIAGRAM_TYPES.join(", ")}`, true);
    }
    case "validate_diagram": {
      const v = validate(args.code);
      return text(v.ok ? "Looks OK." + (v.warnings.length ? "\nWarnings:\n- " + v.warnings.join("\n- ") : "") : "Problems:\n- " + v.errors.join("\n- "), !v.ok);
    }
    default:
      return null;
  }
}

function handle(msg) {
  const { id, method, params } = msg;
  const isRequest = id !== undefined && id !== null;
  const reply = (result) => isRequest && send({ jsonrpc: "2.0", id, result });
  const fail = (code, message) => isRequest && send({ jsonrpc: "2.0", id, error: { code, message } });

  switch (method) {
    case "initialize":
      return reply({
        protocolVersion: (params && params.protocolVersion) || DEFAULT_PROTOCOL,
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
      });
    case "ping":
      return reply({});
    case "tools/list":
      return reply({ tools: TOOLS });
    case "tools/call": {
      try {
        const out = callTool(params && params.name, params && params.arguments);
        return out ? reply(out) : fail(-32602, `Unknown tool: ${params && params.name}`);
      } catch (e) {
        return reply(text(`Tool failed: ${e && e.message ? e.message : e}`, true));
      }
    }
    default:
      if (method && method.startsWith("notifications/")) return; // no response to notifications
      return fail(-32601, `Method not found: ${method}`);
  }
}

function send(obj) {
  process.stdout.write(JSON.stringify(obj) + "\n");
}

const rl = createInterface({ input: process.stdin });
rl.on("line", (line) => {
  if (!line.trim()) return;
  let msg;
  try {
    msg = JSON.parse(line);
  } catch {
    return send({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } });
  }
  handle(msg);
});
