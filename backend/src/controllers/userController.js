const pool = require("../db");
const bcrypt = require("bcrypt");

async function createUser(req, res) {
    try {
        const { name, email, password, organization_id, role } = req.body;

        if (!name || !email || !password || !organization_id || !role) {
            return res.status(400).json({
                error: "All fields are required"
            });
        }

        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                error: "Email already registered"
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users
            (organization_id, name, email, password_hash, role)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, organization_id, name, email, role, created_at`,
            [organization_id, name, email, passwordHash, role]
        );

        res.status(201).json({
            message: "User created successfully",
            user: result.rows[0]
        });
    } catch (error) {
        console.error("Failed to create user:", error.message);

        res.status(500).json({
            error: "Failed to create user"
        });
    }
}

module.exports = {
    createUser
};