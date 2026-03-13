// server.js
const path = require("path");
const express = require("express");

const app = express();
app.use(express.json());

// ---------- Config ----------
const PORT = process.env.PORT || 3000;

// Your Mule API base. Include `/api` here so we can append /add|/sub|/mul|/dev.
const MULE_API_BASE =
  process.env.MULE_API_BASE ||
  "https://calculator-api-jik9pb.5sc6y6-4.usa-e2.cloudhub.io/api";

// ---------- Diagnostics ----------
app.use((req, res, next) => {
  res.setHeader("X-App", "Calculator-Proxy-UI");
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ---------- Static UI ----------
app.use(express.static(path.join(__dirname, "public")));

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    node: process.version,
    muleApiBase: MULE_API_BASE
  });
});

// Root sends UI (index.html in /public)
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ---------- Helper: Safe JSON parse ----------
async function safeParse(res) {
  const text = await res.text();
  try {
    return { ok: true, data: JSON.parse(text), raw: text };
  } catch {
    return { ok: false, data: null, raw: text };
  }
}

// ---------- Proxy route generator ----------
const VALID_OPS = new Set(["add", "sub", "mul", "dev"]);

app.get("/api/:op", async (req, res) => {
  try {
    const { op } = req.params;
    const { num1, num2 } = req.query;

    if (!VALID_OPS.has(op)) {
      return res.status(400).json({ error: "Invalid operation", allowed: [...VALID_OPS] });
    }
    if (num1 === undefined || num2 === undefined) {
      return res.status(400).json({ error: "Missing query params 'num1' and 'num2'" });
    }

    // Build Mule URL: <MULE_API_BASE>/<op>?num1=...&num2=...
    const url = `${MULE_API_BASE}/${encodeURIComponent(op)}?num1=${encodeURIComponent(num1)}&num2=${encodeURIComponent(num2)}`;

    const upstream = await fetch(url, { headers: { "Accept": "application/json" } });
    const parsed = await safeParse(upstream);

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: "Upstream error from Mule",
        status: upstream.status,
        ...(parsed.ok ? { response: parsed.data } : { rawResponse: parsed.raw })
      });
    }
    // Return JSON if possible, else raw text
    if (parsed.ok) return res.json(parsed.data);
    return res.json({ raw: parsed.raw });

  } catch (err) {
    res.status(500).json({ error: "Proxy error", details: err.message });
  }
});

// ---------- 404 (keep this last) ----------
app.use((req, res) => {
  res.status(404).json({ error: "Not Found", path: req.path });
});

app.listen(PORT, () => {
  console.log(`Calculator Proxy UI running on port ${PORT}`);
});
