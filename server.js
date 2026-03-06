const express = require('express');
const fetch = require('node-fetch');

const app = express();

const PORT = process.env.PORT || 3000;

// 👉 Mule CloudHub URL
const MULE_API = "https://calculator-api-jik9pb.5sc6y6-4.usa-e2.cloudhub.io/api/";

app.get('/add', async (req, res) => {
    try {
        const a = req.query.a;
        const b = req.query.b;

        const response = await fetch(`${MULE_API}/add?a=${a}&b=${b}`);
        const data = await response.json();

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Error calling Mule API" });
    }
});

app.get('/sub', async (req, res) => {
    try {
        const a = req.query.a;
        const b = req.query.b;

        const response = await fetch(`${MULE_API}/sub?a=${a}&b=${b}`);
        const data = await response.json();

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Error calling Mule API" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
