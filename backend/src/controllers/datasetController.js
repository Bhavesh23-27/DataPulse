const pool = require("../db");

async function createDataset(req, res) {
    try {
        const { name, description, source_type } = req.body;
        const organizationId = req.user.organizationId;
        const createdBy = req.user.userId;

        if (!name || !source_type) {
            return res.status(400).json({
                error: "Name and source_type are required"
            });
        }

        const result = await pool.query(
            `INSERT INTO datasets
            (organization_id, created_by, name, description, source_type, status)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, organization_id, created_by, name,
                      description, source_type, status, created_at`,
            [
                organizationId,
                createdBy,
                name,
                description || null,
                source_type,
                "pending"
            ]
        );

        res.status(201).json({
            message: "Dataset created successfully",
            dataset: result.rows[0]
        });
    } catch (error) {
        console.error("Failed to create dataset:", error.message);

        res.status(500).json({
            error: "Failed to create dataset"
        });
    }
}

async function getDatasets(req, res) {
    try {
        const organizationId = req.user.organizationId;

        const result = await pool.query(
            `SELECT id, organization_id, created_by, name,
                    description, source_type, status, created_at
             FROM datasets
             WHERE organization_id = $1
             ORDER BY id`,
            [organizationId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Failed to fetch datasets:", error.message);

        res.status(500).json({
            error: "Failed to fetch datasets"
        });
    }
}

async function getDatasetById(req, res) {
    try {
        const datasetId = req.params.id;
        const organizationId = req.user.organizationId;

        const result = await pool.query(
            `SELECT id, organization_id, created_by, name,
                    description, source_type, status, created_at
             FROM datasets
             WHERE id = $1
               AND organization_id = $2`,
            [datasetId, organizationId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Dataset not found"
            });
        }

        res.json({
            dataset: result.rows[0]
        });
    } catch (error) {
        console.error("Failed to fetch dataset:", error.message);

        res.status(500).json({
            error: "Failed to fetch dataset"
        });
    }
}

module.exports = {
    createDataset,
    getDatasets,
    getDatasetById
};