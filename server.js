const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

// Home Page (Unique Colorful Web UI)
app.get('/', (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Color Blast Calculator</title>
            <style>
                body {
                    margin: 0;
                    font-family: 'Segoe UI', sans-serif;
                    height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: linear-gradient(135deg, #ff6a00, #ee0979, #00c6ff);
                    background-size: 400% 400%;
                    animation: gradientBG 10s ease infinite;
                }

                @keyframes gradientBG {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                .card {
                    background: rgba(255,255,255,0.15);
                    backdrop-filter: blur(15px);
                    padding: 40px;
                    border-radius: 25px;
                    text-align: center;
                    width: 380px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                    color: white;
                }

                h1 {
                    margin-bottom: 30px;
                    letter-spacing: 1px;
                }

                input {
                    padding: 12px;
                    margin: 10px;
                    width: 140px;
                    border-radius: 12px;
                    border: none;
                    outline: none;
                    font-size: 16px;
                    text-align: center;
                }

                .buttons {
                    margin-top: 20px;
                }

                button {
                    width: 70px;
                    height: 70px;
                    margin: 10px;
                    border-radius: 50%;
                    border: none;
                    font-size: 26px;
                    font-weight: bold;
                    cursor: pointer;
                    color: white;
                    transition: 0.3s;
                }

                .add { background: #00c9ff; }
                .sub { background: #ff512f; }
                .mul { background: #24c6dc; }
                .div { background: #f7971e; }

                button:hover {
                    transform: scale(1.15);
                    box-shadow: 0 0 20px rgba(255,255,255,0.8);
                }

                #result {
                    margin-top: 25px;
                    font-size: 22px;
                    font-weight: bold;
                    min-height: 30px;
                }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>🌈 Color Blast Calculator</h1>

                <input type="number" id="num1" placeholder="Number 1">
                <input type="number" id="num2" placeholder="Number 2">

                <div class="buttons">
                    <button class="add" onclick="calculate('add')">+</button>
                    <button class="sub" onclick="calculate('sub')">−</button>
                    <button class="mul" onclick="calculate('mul')">×</button>
                    <button class="div" onclick="calculate('div')">÷</button>
                </div>

                <div id="result"></div>
            </div>

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

// API Routes (UNCHANGED)
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
    console.log(\`Server running on port \${PORT}\`);
});
