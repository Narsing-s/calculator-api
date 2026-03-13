// server.js
const path = require("path");
const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ✅ Your Mule base (includes /api)
const MULE_API_BASE =
  process.env.MULE_API_BASE ||
  "https://calculator-api-jik9pb.5sc6y6-4.usa-e2.cloudhub.io/api";

// Diagnostics: tag responses + log requests
app.use((req, res, next) => {
  res.setHeader("X-App", "Calculator-Proxy-UI");
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

/* ----------------- Serve UI ----------------- */
// Serve everything in /public (CSS, JS, index.html)
app.use(express.static(path.join(__dirname, "public")));

// Ensure "/" serves the HTML file (not a string)
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ----------------- Health ----------------- */
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    node: process.version,
    muleApiBase: MULE_API_BASE
  });
});

/* ----------------- Proxy to Mule ----------------- */
/**
 * GET /api/:op?num1=..&num2=..
 * Allowed ops: add, sub, mul, dev
 * Forwards to: <MULE_API_BASE>/<op>?num1=..&num2=..
 */
const VALID_OPS = new Set(["add", "sub", "mul", "dev"]);

async function safeParse(upstreamRes) {
  const text = await upstreamRes.text();
  try {
    return { ok: true, data: JSON.parse(text), raw: text };
  } catch {
    return { ok: false, data: null, raw: text };
  }
}

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

    const url = `${MULE_API_BASE}/${encodeURIComponent(op)}?num1=${encodeURIComponent(num1)}&num2=${encodeURIComponent(num2)}`;
    const upstream = await fetch(url, { headers: { Accept: "application/json" } });
    const parsed = await safeParse(upstream);

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: "Upstream error from Mule",
        status: upstream.status,
        ...(parsed.ok ? { response: parsed.data } : { rawResponse: parsed.raw })
      });
    }

    // Return JSON if possible, else raw text wrapper
    if (parsed.ok) return res.json(parsed.data);
    return res.json({ raw: parsed.raw });
  } catch (err) {
    res.status(500).json({ error: "Proxy error", details: err.message });
  }
});

/* ----------------- 404 fallback LAST ----------------- */
app.use((req, res) => {
  res.status(404).json({ error: "Not Found", path: req.path });
});

app.listen(PORT, () => {
  console.log(`Calculator Proxy UI running on port ${PORT}`);
});
