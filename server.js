const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

const MULE_API = "https://calculator-api-jik9pb.5sc6y6-4.usa-e2.cloudhub.io";

app.get("/", (req, res) => {
  res.send("Calculator Proxy API is Running 🚀");
});

// ADD
app.get("/add", async (req, res) => {
  try {
    const { a, b } = req.query;

    const response = await fetch(`${MULE_API}/add?a=${a}&b=${b}`);

    const text = await response.text();   // get raw response first

    try {
      const data = JSON.parse(text);      // convert to JSON
      res.json(data);
    } catch {
      res.status(500).json({
        error: "Mule API did not return JSON",
        muleResponse: text
      });
    }

  } catch (error) {
    res.status(500).json({
      error: "Error calling Mule API",
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
