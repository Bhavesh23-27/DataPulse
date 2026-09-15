const express = require("express");

const app = express();

const PORT = 3000;

app.get("/", (req, res) => {
    res.json({
       message: "DataPulse API is running"
    });
});

app.listen(PORT, () => {
    console.log(`DataPulse API running on port ${PORT}`);
});