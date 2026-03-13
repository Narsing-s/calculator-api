// server.js
const fs = require("fs");
const path = require("path");
const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ✅ Your Mule Calculator API base (includes /api)
const MULE_API_BASE =
  process.env.MULE_API_BASE ||
  "https://calculator-api-jik9pb.5sc6y6-4.usa-e2.cloudhub.io/api";

/* ---------------- Diagnostics ---------------- */
app.use((req, res, next) => {
  res.setHeader("X-App", "Calculator-Proxy-UI");
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

function dumpRoutes() {
  const routes = [];
  const walk = (stack, prefix = "") => {
    stack.forEach((layer) => {
      if (layer.route && layer.route.path) {
        const methods = Object.keys(layer.route.methods)
          .filter((m) => layer.route.methods[m])
          .map((m) => m.toUpperCase());
        routes.push({ methods, path: prefix + layer.route.path });
      } else if (layer.name === "router" && layer.handle?.stack) {
        const sub = layer.regexp?.toString() || "";
        walk(layer.handle.stack, prefix);
      }
    });
  };
  if (app._router?.stack) walk(app._router.stack);
  return routes;
}

/* ---------------- Health ---------------- */
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    node: process.version,
    muleApiBase: MULE_API_BASE
  });
});

/* ---------------- Debug helpers ---------------- */
// Lists routes registered in this process
app.get("/__routes", (_req, res) => {
  res.json({ routes: dumpRoutes() });
});

// Lists current working directory (to ensure we run the expected code)
app.get("/__cwd", (_req, res) => {
  try {
    const cwd = process.cwd();
    const items = fs.readdirSync(cwd);
    res.json({ cwd, items });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ---------------- Inline UI ---------------- */
const UI_HTML = `<!doctype html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="utf-8" />
  <title>Calculator API — Modern UI</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root { --bg:#0b1020; --bg-alt:#0e1530; --card:rgba(255,255,255,.05); --card-border:rgba(255,255,255,.1);
            --text:#e8edff; --muted:#a8b0cc; --accent:#7cfe92; --accent-2:#7a9cff; --danger:#ff7a7a;
            --shadow:0 20px 50px rgba(0,0,0,.45); --ring:0 0 0 3px rgba(124,254,146,.25);
            --mono: ui-monospace, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; --radius:14px; }
    [data-theme="light"]{ --bg:#eef2ff; --bg-alt:#f7f8ff; --card:rgba(255,255,255,.9); --card-border:rgba(0,0,0,.08);
      --text:#0d1330; --muted:#55608a; --accent:#2fb171; --accent-2:#2c62ff; --danger:#d93025; --shadow:0 18px 40px rgba(0,0,0,.08); --ring:0 0 0 3px rgba(44,98,255,.18); }
    * { box-sizing: border-box; }
    html, body { height: 100%; }
    body {
      margin: 0;
      background:
        radial-gradient(1200px 600px at 10% -20%, #1c2a66 0%, transparent 60%),
        radial-gradient(800px 500px at 100% 0%, #17314d 0%, transparent 60%),
        linear-gradient(180deg, var(--bg) 0%, var(--bg-alt) 100%);
      color: var(--text);
      font: 16px/1.5 system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Helvetica Neue", Arial, "Noto Sans";
      -webkit-font-smoothing: antialiased;
      padding: 32px 18px 40px;
    }
    .wrap { max-width: 920px; margin: 0 auto; }
    .header { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:18px; }
    .title h1 { margin:0; font-weight:800; letter-spacing:.2px; font-size:clamp(1.6rem, 2.2vw + 1rem, 2.4rem); }
    .title p { margin:4px 0 0; color:var(--muted); }
    .theme-toggle { display:inline-flex; align-items:center; gap:10px; padding:10px 12px; border-radius:999px; background:var(--card); border:1px solid var(--card-border); cursor:pointer; box-shadow:var(--shadow); }
    .theme-toggle input { display:none; }
    .knob { width:44px; height:24px; border-radius:999px; position:relative; background:#1b2344; border:1px solid var(--card-border); }
    .knob::after { content:""; position:absolute; top:50%; left:3px; transform:translateY(-50%); width:18px; height:18px; border-radius:50%; background:var(--accent); transition:left .25s ease; box-shadow:0 2px 10px rgba(0,0,0,.25); }
    input:checked + .knob::after { left:23px; }
    .card { border:1px solid var(--card-border); background:var(--card); backdrop-filter:blur(10px); border-radius:var(--radius); box-shadow:var(--shadow); padding:18px; }
    .grid { display:grid; gap:14px; grid-template-columns:repeat(12, 1fr); }
    .col-6 { grid-column:span 6; } .col-12 { grid-column:span 12; }
    @media (max-width: 720px) { .col-6 { grid-column: span 12; } }
    label { display:block; font-size:13px; color:var(--muted); margin-bottom:6px; }
    input[type="number"], input[type="text"], select { width:100%; padding:12px 14px; border-radius:10px; color:var(--text); background:rgba(255,255,255,.06); border:1px solid var(--card-border); outline:none; }
    input:focus, select:focus { box-shadow:var(--ring); border-color:transparent; }
    .toolbar { display:flex; gap:8px; flex-wrap:wrap; }
    .btn, .chip { appearance:none; border:1px solid var(--card-border); padding:10px 14px; border-radius:12px; font-weight:700; background:rgba(255,255,255,.06); color:var(--text); cursor:pointer; transition: transform .03s ease, background .15s ease; }
    .btn:hover, .chip:hover { background: rgba(255,255,255,.12); }
    .btn:active, .chip:active { transform: translateY(1px); }
    .btn.primary { background: linear-gradient(135deg, var(--accent), var(--accent-2)); border: none; color: #081226; }
    .btn.ghost { background: transparent; }
    .chip { font-weight: 600; }
    .chip.add { border-color: rgba(124,254,146,.35); }
    .chip.sub { border-color: rgba(255,180,0,.35); }
    .chip.mul { border-color: rgba(122,156,255,.35); }
    .chip.dev { border-color: rgba(255,122,122,.35); }
    .output { margin-top:16px; display:grid; gap:12px; }
    .result, .url { border:1px dashed var(--card-border); background:rgba(255,255,255,.04); border-radius:12px; padding:14px; font-family:var(--mono); white-space:pre-wrap; word-break:break-word; }
    .result.error { border-color: rgba(255,0,0,.25); color:#ff7a7a; background:rgba(255,0,0,.06); }
    .subtitle { margin:8px 0 0; color:var(--muted); font-size:13px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <div class="title">
        <h1>Calculator API</h1>
        <p>Proxying to Mule at <code>/api/*</code>. View JSON responses below.</p>
      </div>
      <label class="theme-toggle" title="Toggle light/dark">
        <span>Theme</span>
        <input id="theme" type="checkbox" />
        <span class="knob"></span>
      </label>
    </div>

    <div class="card">
      <div class="grid">
        <div class="col-6">
          <label for="num1">Number 1 (<code>num1</code>)</label>
          <input id="num1" type="number" step="any" placeholder="e.g., 12" />
        </div>
        <div class="col-6">
          <label for="num2">Number 2 (<code>num2</code>)</label>
          <input id="num2" type="number" step="any" placeholder="e.g., 3" />
        </div>

        <div class="col-12">
          <label>Quick operations</label>
          <div class="toolbar" role="group">
            <button class="chip add" data-op="add" type="button">➕ Add</button>
            <button class="chip sub" data-op="sub" type="button">➖ Subtract</button>
            <button class="chip mul" data-op="mul" type="button">✖ Multiply</button>
            <button class="chip dev" data-op="dev" type="button">➗ Divide</button>
          </div>
          <p class="subtitle">Or use the selector below.</p>
        </div>

        <div class="col-6">
          <label for="op">Operation</label>
          <select id="op">
            <option value="add">Add</option>
            <option value="sub">Subtract</option>
            <option value="mul">Multiply</option>
            <option value="dev">Divide</option>
          </select>
        </div>

        <div class="col-6">
          <label for="base">API Base URL</label>
          <!-- Default to local proxy to avoid CORS -->
          <input id="base" type="text" value="/api" />
        </div>

        <div class="col-12 toolbar" style="margin-top:6px">
          <button id="go" class="btn primary" type="button">Calculate</button>
          <button id="reset" class="btn ghost" type="button">Reset</button>
        </div>
      </div>

      <div class="output">
        <div class="result" id="out">Result will appear here.</div>
        <div class="url" id="lastUrl">Requested URL will appear here.</div>
      </div>
    </div>

    <p class="subtitle" style="margin-top:12px">
      Tip: Proxy expects <code>GET &lt;base&gt;/&lt;op&gt;?num1=&lt;n1&gt;&amp;num2=&lt;n2&gt;</code> and returns <code>{"result": &lt;number&gt;}</code>.
    </p>

    <p class="subtitle">© <span id="year"></span> Calculator UI • Powered by Mule</p>
  </div>

  <script>
    const $ = (id) => document.getElementById(id);
    $("year").textContent = new Date().getFullYear();

    const THEME_KEY = "calc-ui-theme";
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);
    $("theme").checked = (document.documentElement.getAttribute("data-theme") === "light");
    $("theme").addEventListener("change", () => {
      const mode = $("theme").checked ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", mode);
      localStorage.setItem(THEME_KEY, mode);
    });

    function normBase(base) {
      base = (base || "").replace(/\\s+/g, "");
      base = base.replace(/\\/+$/, "");
      return base || "/api";
    }
    function buildUrl(base, op, n1, n2) {
      base = normBase(base);
      const url = \`\${base}/\${op}?num1=\${encodeURIComponent(n1)}&num2=\${encodeURIComponent(n2)}\`;
