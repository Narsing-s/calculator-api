const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Log every request + tag responses so we know which server handled it
app.use((req, res, next) => {
  res.setHeader("X-App", "Calc-UI-Min");
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Serve the same tiny page for EVERY path (no 404 for now)
app.get("*", (req, res) => {
  res.type("html").send(`<!doctype html><html><head><meta charset="utf-8"><title>UI</title></head>
  <body><h1>✅ UI is working at ${req.path}</h1><p>Server: Calc-UI-Min</p></body></html>`);
});

app.listen(PORT, () => console.log(`Mini UI server on :${PORT}`));
