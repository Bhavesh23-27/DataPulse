const express = require("express");
const pool = require("./db");

const app = express();

const PORT = 3000;

app.get("/", (req, res) => {
    res.json({
        message: "DataPulse API is running"
    });
});

app.get("/api/organizations", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, name, created_at FROM organizations ORDER BY id"
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Failed to fetch organizations:", error.message);

        res.status(500).json({
            error: "Failed to fetch organizations"
        });
    }
});

app.listen(PORT, () => {
    console.log(`DataPulse API running on port ${PORT}`);
});