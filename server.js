// server.js
const path = require("path");
const fs = require("fs");
const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// 🎯 Your Mule Calculator base (includes /api)
const MULE_API_BASE =
  process.env.MULE_API_BASE ||
  "https://calculator-api-jik9pb.5sc6y6-4.usa-e2.cloudhub.io/api";

/* ---------- Diagnostics ---------- */
app.use((req, res, next) => {
  res.setHeader("X-App", "Calculator-UI");
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

/* ---------- Static UI ---------- */
const publicDir = path.join(__dirname, "public");
const indexPath = path.join(publicDir, "index.html");
console.log("Public dir:", publicDir);
console.log("Index HTML exists?", fs.existsSync(indexPath));

app.use(express.static(publicDir));

// Root serves UI
app.get("/", (_req, res) => {
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error("Error sending index.html:", err.message);
      res.status(500).send("Failed to load UI");
    }
  });
});

// Health
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    node: process.version,
    muleApiBase: MULE_API_BASE,
    indexHtmlExists: fs.existsSync(indexPath)
  });
});

// (Optional) Route listing for debugging
app.get("/__routes", (_req, res) => {
  const routes = [];
  app._router.stack.forEach((layer) => {
    if (layer.route && layer.route.path) {
      const methods = Object.keys(layer.route.methods)
        .filter(m => layer.route.methods[m]).map(m => m.toUpperCase());
      routes.push({ methods, path: layer.route.path });
    }
  });
  res.json({ routes });
});

/* ---------- Proxy to Mule /api/:op ---------- */
const VALID_OPS = new Set(["add", "sub", "mul", "dev"]);

async function safeParse(resp) {
  const text = await resp.text();
  try { return { ok: true, data: JSON.parse(text), raw: text }; }
  catch { return { ok: false, data: null, raw: text }; }
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

    if (parsed.ok) return res.json(parsed.data);
    return res.json({ raw: parsed.raw });

  } catch (err) {
    res.status(500).json({ error: "Proxy error", details: err.message });
  }
});

/* ---------- Catch-all to UI (SPA-friendly) ---------- */
app.get(/^\/(?!api|health|__routes).*$/, (_req, res) => res.sendFile(indexPath));

/* ---------- 404 LAST ---------- */
app.use((req, res) => {
  res.status(404).json({ error: "Not Found", path: req.path });
});

app.listen(PORT, () => {
  console.log(`Calculator UI running on port ${PORT}`);
});
