const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

// Home route
app.get('/', (req, res) => {
    res.send("Calculator API is running 🚀");
});

// Validation function
function validateNumbers(a, b, res) {
    if (isNaN(a) || isNaN(b)) {
        res.status(400).json({ error: "Invalid numbers" });
        return false;
    }
    return true;
}

// Addition
app.get('/add', (req, res) => {
    const a = Number(req.query.a);
    const b = Number(req.query.b);

    if (!validateNumbers(a, b, res)) return;

    res.json({ result: a + b });
});

// Subtraction
app.get('/sub', (req, res) => {
    const a = Number(req.query.a);
    const b = Number(req.query.b);

    if (!validateNumbers(a, b, res)) return;

    res.json({ result: a - b });
});

// Multiplication
app.get('/mul', (req, res) => {
    const a = Number(req.query.a);
    const b = Number(req.query.b);

    if (!validateNumbers(a, b, res)) return;

    res.json({ result: a * b });
});

// Division
app.get('/div', (req, res) => {
    const a = Number(req.query.a);
    const b = Number(req.query.b);

    if (!validateNumbers(a, b, res)) return;

    if (b === 0) {
        return res.status(400).json({ error: "Cannot divide by zero" });
    }

    res.json({ result: a / b });
});

app.listen(PORT, () => {
    console.log(`Calculator API running on port ${PORT}`);
});
