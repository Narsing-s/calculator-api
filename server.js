app.get('/', (req, res) => {
res.send(`
<!DOCTYPE html>
<html>
<head>
<title>Neon Calculator</title>

<style>
body {
    margin: 0;
    font-family: 'Segoe UI', sans-serif;
    background: linear-gradient(135deg, #141e30, #243b55);
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    color: white;
}

.card {
    backdrop-filter: blur(20px);
    background: rgba(255,255,255,0.05);
    border-radius: 20px;
    padding: 40px;
    width: 380px;
    text-align: center;
    box-shadow: 0 0 40px rgba(0,255,255,0.2);
    animation: fadeIn 1s ease-in-out;
}

h1 {
    margin-bottom: 30px;
    letter-spacing: 2px;
}

input {
    width: 140px;
    padding: 12px;
    margin: 10px;
    border-radius: 10px;
    border: none;
    font-size: 18px;
    text-align: center;
    outline: none;
}

.operators {
    margin-top: 20px;
}

.operators button {
    width: 70px;
    height: 70px;
    margin: 10px;
    font-size: 30px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    background: #00ffff;
    color: black;
    font-weight: bold;
    transition: 0.3s;
    box-shadow: 0 0 20px #00ffff;
}

.operators button:hover {
    transform: scale(1.15);
    box-shadow: 0 0 35px #00ffff;
}

.calculate {
    margin-top: 25px;
    padding: 12px 30px;
    border-radius: 30px;
    border: none;
    font-size: 18px;
    cursor: pointer;
    background: #ff00cc;
    color: white;
    transition: 0.3s;
    box-shadow: 0 0 20px #ff00cc;
}

.calculate:hover {
    transform: scale(1.05);
    box-shadow: 0 0 35px #ff00cc;
}

#result {
    margin-top: 30px;
    font-size: 24px;
    font-weight: bold;
    min-height: 30px;
}

@keyframes fadeIn {
    from {opacity:0; transform:translateY(20px);}
    to {opacity:1; transform:translateY(0);}
}
</style>
</head>

<body>

<div class="card">
    <h1>⚡ Neon Calculator ⚡</h1>

    <input type="number" id="num1" placeholder="First Number">
    <input type="number" id="num2" placeholder="Second Number">

    <div class="operators">
        <button onclick="setOp('add')">+</button>
        <button onclick="setOp('sub')">−</button>
        <button onclick="setOp('mul')">×</button>
        <button onclick="setOp('div')">÷</button>
    </div>

    <button class="calculate" onclick="calculate()">CALCULATE</button>

    <div id="result"></div>
</div>

<script>
let operation = 'add';

function setOp(op){
    operation = op;
}

async function calculate(){
    const a = document.getElementById('num1').value;
    const b = document.getElementById('num2').value;

    if(!a || !b){
        document.getElementById('result').innerText = "Enter both numbers!";
        return;
    }

    const response = await fetch('/' + operation + '?a=' + a + '&b=' + b);
    const data = await response.json();

    document.getElementById('result').innerText =
        data.result !== undefined ? "Result: " + data.result : data.error;
}
</script>

</body>
</html>
`);
});
