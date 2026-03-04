const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

// Home Page (Web UI)
app.get('/', (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Calculator</title>
            <style>
                body {
                    font-family: Arial;
                    text-align: center;
                    margin-top: 100px;
                    background: #f4f4f4;
                }
                input {
                    padding: 10px;
                    margin: 5px;
                    width: 100px;
                }
                button {
                    padding: 10px 15px;
                    margin: 5px;
                    cursor: pointer;
                }
                #result {
                    margin-top: 20px;
                    font-size: 20px;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <h1>Calculator Web UI 🚀</h1>

            <input type="number" id="num1" placeholder="Number 1">
            <input type="number" id="num2" placeholder="Number 2">
            <br>

            <button onclick="calculate('add')">+</button>
            <button onclick="calculate('sub')">-</button>
            <button onclick="calculate('mul')">*</button>
            <button onclick="calculate('div')">/</button>

            <div id="result"></div>

            <script>
                async function calculate(operation) {
                    const a = document.getElementById('num1').value;
                    const b = document.getElementById('num2').value;

                    const response = await fetch('/' + operation + '?a=' + a + '&b=' + b);
                    const data = await response.json();

                    document.getElementById('result').innerText =
                        data.result !== undefined
                        ? "Result: " + data.result
                        : data.error;
                }
            </script>
        </body>
        </html>
    `);
});

// API Routes
app.get('/add', (req, res) => {
    res.json({ result: Number(req.query.a) + Number(req.query.b) });
});

app.get('/sub', (req, res) => {
    res.json({ result: Number(req.query.a) - Number(req.query.b) });
});

app.get('/mul', (req, res) => {
    res.json({ result: Number(req.query.a) * Number(req.query.b) });
});

app.get('/div', (req, res) => {
    const a = Number(req.query.a);
    const b = Number(req.query.b);

    if (b === 0) {
        return res.status(400).json({ error: "Cannot divide by zero" });
    }

    res.json({ result: a / b });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
