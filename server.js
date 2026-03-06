const express = require('express');
const fetch = require('node-fetch');

const app = express();

const PORT = process.env.PORT || 3000;

// 👉 Mule CloudHub URL
const MULE_API = "https://calculator-api-jik9pb.5sc6y6-4.usa-e2.cloudhub.io";

// Root endpoint (to avoid Cannot GET /)
app.get('/', (req, res) => {
    res.send("Calculator Proxy API is Running 🚀");
});

// ADD
app.get('/add', async (req, res) => {
    try {
        const { a, b } = req.query;

        const response = await fetch(`${MULE_API}/add?a=${a}&b=${b}`);
        const data = await response.json();

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Error calling Mule API (ADD)" });
    }
});

// SUBTRACT
app.get('/sub', async (req, res) => {
    try {
        const { a, b } = req.query;

        const response = await fetch(`${MULE_API}/sub?a=${a}&b=${b}`);
        const data = await response.json();

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Error calling Mule API (SUB)" });
    }
});

// MULTIPLY
app.get('/mul', async (req, res) => {
    try {
        const { a, b } = req.query;

        const response = await fetch(`${MULE_API}/mul?a=${a}&b=${b}`);
        const data = await response.json();

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Error calling Mule API (MUL)" });
    }
});

// DIVIDE
app.get('/div', async (req, res) => {
    try {
        const { a, b } = req.query;

        const response = await fetch(`${MULE_API}/div?a=${a}&b=${b}`);
        const data = await response.json();

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Error calling Mule API (DIV)" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
