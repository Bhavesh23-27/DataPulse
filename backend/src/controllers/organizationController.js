const pool = require("../db");

async function getOrganizations(req, res) {
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
}

module.exports = {
    getOrganizations
};