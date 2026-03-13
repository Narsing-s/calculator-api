# Calculator UI — Android-like Web App (Mule API )

An Android-inspired, touch‑friendly **Calculator Web UI** that proxies to a **MuleSoft APIKit** calculator backend.  
Built for quick demos, clean UX, and zero CORS friction—your browser hits `/api/*` on this server, and the server forwards to CloudHub.

**Watermark:** `#CreatedByNarsing-s` (clickable in the UI).

---

## ✨ Features

- **Android-like UI/UX**: app bar, operation chips, soft shadows, large touch targets, and a fixed bottom area for watermark.
- **Numeric keypad**: enter values with tap-friendly keys; supports decimal input, backspace, clear, and compute.
- **Operation chips**: quickly switch between **Add / Subtract / Multiply / Divide**.
- **Live URL preview**: shows the exact `/api/:op?num1=…&num2=…` request.
- **Inline UI (no static files required)**: the UI is embedded in `server.js` to avoid path issues in deployments.
- **Proxy to Mule**: server routes `/api/:op` to your Mule endpoint (e.g., `…cloudhub.io/api/add`), returning JSON.
- **Health endpoint**: `GET /health` returns basic server info.
- **Watermark**: `#CreatedByNarsing-s` shown near the bottom (clickable link to your profile).

---
## 🧱 Architecture

The Calculator UI uses a **simple three‑layer architecture** designed for clarity, speed, and reliability:
