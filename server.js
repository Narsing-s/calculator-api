const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send("Calculator API is running 🚀");
});

app.get('/add', (req, res) => {
    const a = Number(req.query.a);
    const b = Number(req.query.b);
    res.json({ result: a + b });
});

app.get('/sub', (req, res) => {
    const a = Number(req.query.a);
    const b = Number(req.query.b);
    res.json({ result: a - b });
});

app.get('/mul', (req, res) => {
    const a = Number(req.query.a);
    const b = Number(req.query.b);
    res.json({ result: a * b });
});

app.get('/div', (req, res) => {
    const a = Number(req.query.a);
    const b = Number(req.query.b);

    if (b === 0) {
        return res.json({ error: "Cannot divide by zero" });
    }

    res.json({ result: a / b });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
