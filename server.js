// server.js
const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ✅ Mule Calculator API base (INCLUDES /api)
const MULE_API_BASE =
  process.env.MULE_API_BASE ||
  "https://calculator-api-jik9pb.5sc6y6-4.usa-e2.cloudhub.io/api";

/* ---------- Diagnostics ---------- */
app.use((req, res, next) => {
  res.setHeader("X-App", "Calculator-UI");
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

/* ---------- Health ---------- */
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    node: process.version,
    muleApiBase: MULE_API_BASE
  });
});

/* ---------- INLINE UI (Android-like + Bottom Nav) ---------- */
const UI_HTML = `<!doctype html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="utf-8" />
  <title>Calculator — Android-like UI</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root {
      --bg: #0b1020; --bg2:#0e1530; --card:#121a2f; --text:#eef3ff; --muted:#9aa7cc;
      --accent:#4ae387; --accent2:#5aa1ff; --danger:#ff7a7a;
      --shadow:0 20px 40px rgba(0,0,0,.45); --ring:0 0 0 3px rgba(74,227,135,.22);
      --mono: ui-monospace, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      --radius:16px; --radius-sm:12px; --nav-h:72px;
    }
    [data-theme="light"]{
      --bg:#eaf0ff; --bg2:#f7f9ff; --card:#fff; --text:#0e1440; --muted:#5a648a;
      --accent:#1fb170; --accent2:#2a62ff; --danger:#d93025;
      --shadow:0 16px 32px rgba(0,0,0,.08); --ring:0 0 0 3px rgba(42,98,255,.18);
    }

    * { box-sizing: border-box; }
    html, body { height: 100%; }
    body {
      margin: 0; color: var(--text);
      background:
        radial-gradient(1100px 600px at -10% -30%, #1b2b65 0%, transparent 55%),
        radial-gradient(800px 500px at 110% -10%, #142b52 0%, transparent 55%),
        linear-gradient(180deg, var(--bg) 0%, var(--bg2) 100%);
      font: 16px/1.5 system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Helvetica Neue", Arial, "Noto Sans";
      -webkit-font-smoothing: antialiased;
      padding: 16px 16px calc(var(--nav-h) + 16px);
    }

    .appbar {
      display:flex; align-items:center; justify-content:space-between; gap:12px;
      margin: 0 auto 16px; max-width: 980px;
    }
    .brand { display:flex; align-items:center; gap:12px; }
    .brand .logo { width:36px; height:36px; border-radius:10px; background: linear-gradient(135deg, var(--accent), var(--accent2)); box-shadow: 0 6px 16px rgba(0,0,0,.25); }
    .brand h1 { margin:0; font-size: 18px; letter-spacing:.2px; }
    .brand small { color: var(--muted); }

    .theme-toggle { display:inline-flex; align-items:center; gap:10px; padding:8px 12px; border-radius:999px; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12); cursor:pointer; }
    .theme-toggle input{ display:none; }
    .knob{ width:44px; height:24px; border-radius:999px; background:#172048; border:1px solid rgba(255,255,255,.16); position:relative; }
    .knob::after{ content:""; position:absolute; top:50%; left:3px; transform:translateY(-50%); width:18px; height:18px; border-radius:50%; background:var(--accent); transition:left .22s ease; box-shadow: 0 2px 10px rgba(0,0,0,.25); }
    input:checked + .knob::after{ left:23px; }

    .wrap { max-width: 980px; margin: 0 auto; display:grid; gap:16px; }

    .card { background: var(--card); border:1px solid rgba(255,255,255,.08); border-radius: var(--radius); box-shadow: var(--shadow); padding: 16px; }

    /* Screens */
    .screen { display: none; }
    .screen.active { display: block; }

    /* Calculator layout */
    .panel { display:grid; grid-template-columns: 1.2fr .8fr; gap: 16px; }
    @media (max-width: 860px) { .panel { grid-template-columns: 1fr; } }

    .field-row { display:grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
    .field {
      display:flex; flex-direction:column; gap:6px; background:rgba(255,255,255,.03);
      border:1px solid rgba(255,255,255,.1); border-radius: var(--radius-sm); padding: 10px 12px; cursor:text;
    }
    .field.active { outline: var(--ring); border-color: transparent; }
    .field label { font-size: 12px; color: var(--muted); }
    .value { font-size: 20px; min-height: 26px; letter-spacing:.2px; }

    .chips { display:flex; gap:8px; flex-wrap:wrap; margin: 8px 0 14px; }
    .chip {
      padding:8px 12px; border-radius: 999px; border:1px solid rgba(255,255,255,.16);
      background: rgba(255,255,255,.06); color: var(--text); cursor:pointer; transition: background .15s ease, transform .02s ease; user-select:none;
    }
    .chip:hover { background: rgba(255,255,255,.12); }
    .chip:active { transform: translateY(1px); }
    .chip.active { background: linear-gradient(135deg, var(--accent), var(--accent2)); border:none; color:#071225; }

    .url-box, .result-box {
      border: 1px dashed rgba(255,255,255,.16); background: rgba(255,255,255,.04);
      border-radius: var(--radius-sm); padding: 12px; font-family: var(--mono);
      white-space: pre-wrap; word-break: break-word;
    }
    .result-box.error { color: var(--danger); border-color: rgba(255,0,0,.25); background: rgba(255,0,0,.06); }

    .keypad { display:grid; gap:10px; grid-template-columns: repeat(3, minmax(0, 1fr)); grid-auto-rows: 56px; user-select:none; }
    .key {
      display:grid; place-items:center; border-radius: 14px; font-weight:700;
      background: rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.12); cursor:pointer; transition: transform .02s ease, background .12s ease;
    }
    .key:hover { background: rgba(255,255,255,.12); }
    .key:active { transform: translateY(1px); }
    .key.accent { background: linear-gradient(135deg, var(--accent), var(--accent2)); border:none; color:#061127; }
    .key.wide { grid-column: span 2; }
    .muted { color: var(--muted); }

    .foot { display:flex; align-items:center; justify-content:space-between; margin-top:10px; color: var(--muted); font-size:13px; }

    /* History */
    .history-list { display:grid; gap:10px; }
    .history-item {
      display:flex; align-items:center; justify-content:space-between; gap:10px;
      background: rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.12); border-radius:12px; padding: 10px 12px;
      font-family: var(--mono);
    }
    .history-item button { padding:6px 10px; border-radius:10px; border:1px solid rgba(255,255,255,.2); background: rgba(255,255,255,.06); color: var(--text); cursor:pointer; }
    .history-empty { color: var(--muted); }

    /* Settings */
    .form-row { display:grid; gap:8px; margin-bottom:12px; }
    .input {
      width: 100%; padding: 12px 14px; border-radius: 10px; color: var(--text);
      background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.18); outline:none;
    }
    .btn { padding:10px 14px; border-radius:12px; border:1px solid rgba(255,255,255,.18); background: rgba(255,255,255,.06); color:var(--text); cursor:pointer; }
    .btn.primary { background: linear-gradient(135deg, var(--accent), var(--accent2)); border:none; color:#081226; }

    /* Bottom Navigation Bar */
    .bottom-nav {
      position: fixed; left:0; right:0; bottom:0; height: var(--nav-h);
      background: rgba(10,14,30,.85); backdrop-filter: blur(8px);
      border-top: 1px solid rgba(255,255,255,.08);
      display:flex; align-items:center; justify-content: space-around; z-index: 10;
    }
    .nav-item {
      display:flex; flex-direction:column; align-items:center; gap:4px; color: var(--muted);
      text-decoration:none; padding: 8px 12px; border-radius: 12px; min-width: 88px;
    }
    .nav-item.active { color: var(--text); background: rgba(255,255,255,.06); }
    .nav-ico { font-size: 20px; line-height: 1; }
    .nav-label { font-size: 12px; }

  </style>
</head>
<body>
  <!-- App bar -->
  <div class="appbar">
    <div class="brand">
      <div class="logo"></div>
      <div>
        <h1>Calculator</h1>
        <small>Android-like • Fast • Clean</small>
      </div>
    </div>
    <label class="theme-toggle" title="Toggle theme">
      <span>Theme</span>
      <input id="theme" type="checkbox" />
      <span class="knob"></span>
    </label>
  </div>

  <div class="wrap">
    <!-- Screen: Calculator -->
    <div id="screen-calc" class="screen active">
      <div class="panel card">
        <div>
          <div class="field-row">
            <div id="f1" class="field active" data-target="n1">
              <label>Number 1</label>
              <div id="n1" class="value" contenteditable="false"></div>
            </div>
            <div id="f2" class="field" data-target="n2">
              <label>Number 2</label>
              <div id="n2" class="value" contenteditable="false"></div>
            </div>
          </div>

          <div class="chips" id="chips">
            <div class="chip active" data-op="add">➕ Add</div>
            <div class="chip" data-op="sub">➖ Subtract</div>
            <div class="chip" data-op="mul">✖ Multiply</div>
            <div class="chip" data-op="dev">➗ Divide</div>
          </div>

          <div class="url-box" id="lastUrl">Request URL will appear here.</div>
          <div style="height:10px"></div>
          <div class="result-box" id="out">Result will appear here.</div>

          <div class="foot">
            <div>Base: <code id="baseVal">/api</code></div>
            <div>© <span id="year"></span></div>
          </div>
        </div>

        <!-- Keypad -->
        <div class="">
          <div class="keypad" id="pad">
            <div class="key">7</div><div class="key">8</div><div class="key">9</div>
            <div class="key">4</div><div class="key">5</div><div class="key">6</div>
            <div class="key">1</div><div class="key">2</div><div class="key">3</div>
            <div class="key">0</div><div class="key">.</div><div class="key muted" data-act="back">⌫</div>
            <div class="key muted wide" data-act="clear">Clear</div>
