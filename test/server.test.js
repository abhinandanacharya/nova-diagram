import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validate } from "../mcp/render.js";

const server = join(dirname(fileURLToPath(import.meta.url)), "..", "mcp", "server.js");

function rpc(messages) {
  return new Promise((resolve, reject) => {
    const p = spawn("node", [server]);
    let out = "";
    p.stdout.on("data", (d) => (out += d));
    p.on("error", reject);
    p.on("close", () => resolve(out.trim().split("\n").filter(Boolean).map((l) => JSON.parse(l))));
    for (const m of messages) p.stdin.write(JSON.stringify(m) + "\n");
    p.stdin.end();
  });
}

test("validate catches bad and good code", () => {
  assert.equal(validate("").ok, false);
  assert.equal(validate("hello world").ok, false);
  assert.equal(validate("flowchart TD\n A-->B").ok, true);
  assert.equal(validate("%%{init: {}}%%\nsequenceDiagram\n A->>B: hi").ok, true);
});

test("initialize, list tools, render html", async () => {
  const dir = mkdtempSync(join(tmpdir(), "nd-"));
  const res = await rpc([
    { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18" } },
    { jsonrpc: "2.0", method: "notifications/initialized" },
    { jsonrpc: "2.0", id: 2, method: "tools/list" },
    { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "render_diagram", arguments: { title: "Login Flow", code: "flowchart TD\n A([Start]) --> B{Valid?}\n B -->|Yes| C[Dashboard]\n B -->|No| D[Error]", outDir: dir } } },
    { jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "render_diagram", arguments: { code: "not a diagram" } } },
    { jsonrpc: "2.0", id: 5, method: "tools/call", params: { name: "diagram_cheatsheet", arguments: { type: "sequence" } } },
  ]);
  const byId = Object.fromEntries(res.map((r) => [r.id, r]));
  assert.equal(res.length, 5); // no reply to the notification
  assert.equal(byId[1].result.serverInfo.name, "nova-diagram");
  assert.deepEqual(byId[2].result.tools.map((t) => t.name), ["render_diagram", "diagram_cheatsheet", "validate_diagram"]);
  assert.ok(existsSync(join(dir, "login-flow.html")));
  assert.ok(existsSync(join(dir, "login-flow.mmd")));
  assert.match(readFileSync(join(dir, "login-flow.html"), "utf8"), /mermaid@11\.4\.1/);
  assert.equal(byId[4].result.isError, true);
  assert.match(byId[5].result.content[0].text, /sequenceDiagram/);
});

test("ER cardinality braces do not trigger bracket warnings", () => {
  const v = validate("erDiagram\n  A ||--o{ B : has\n  B ||--|{ C : has");
  assert.equal(v.ok, true);
  assert.deepEqual(v.warnings, []);
});
