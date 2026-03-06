const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// 👉 Mule CloudHub URL
const MULE_API = "https://calculator-api-jik9pb.5sc6y6-4.usa-e2.cloudhub.io";

// Root endpoint
app.get("/", (req, res) => {
  res.send("Calculator Proxy API is Running 🚀");
});

// ADD
app.get("/add", async (req, res) => {
  try {
    const { a, b } = req.query;

    const response = await fetch(`${MULE_API}/add?a=${a}&b=${b}`);
    const data = await response.json();

    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: "Error calling Mule API (ADD)",
      details: error.message
    });
  }
});

// SUBTRACT
app.get("/sub", async (req, res) => {
  try {
    const { a, b } = req.query;

    const response = await fetch(`${MULE_API}/sub?a=${a}&b=${b}`);
    const data = await response.json();

    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: "Error calling Mule API (SUB)",
      details: error.message
    });
  }
});

// MULTIPLY
app.get("/mul", async (req, res) => {
  try {
    const { a, b } = req.query;

    const response = await fetch(`${MULE_API}/mul?a=${a}&b=${b}`);
    const data = await response.json();

    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: "Error calling Mule API (MUL)",
      details: error.message
    });
  }
});

// DIVIDE
app.get("/div", async (req, res) => {
  try {
    const { a, b } = req.query;

    const response = await fetch(`${MULE_API}/div?a=${a}&b=${b}`);
    const data = await response.json();

    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: "Error calling Mule API (DIV)",
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
