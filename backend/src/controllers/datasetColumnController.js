const pool = require("../db");

async function createColumn(req, res) {
    try {
        const datasetId = req.params.id;
        const organizationId = req.user.organizationId;

        const {
            name,
            data_type,
            position,
            nullable
        } = req.body;

        if (!name || !data_type || position === undefined) {
            return res.status(400).json({
                error: "Name, data_type and position are required"
            });
        }

        const validDataTypes = [
            "text",
            "number",
            "boolean",
            "date",
            "datetime"
        ];

        if (!validDataTypes.includes(data_type)) {
            return res.status(400).json({
                error: "Invalid data_type"
            });
        }

        if (!Number.isInteger(position) || position <= 0) {
            return res.status(400).json({
                error: "Position must be a positive integer"
            });
        }

        const datasetResult = await pool.query(
            `SELECT id
             FROM datasets
             WHERE id = $1
               AND organization_id = $2`,
            [datasetId, organizationId]
        );

        if (datasetResult.rows.length === 0) {
            return res.status(404).json({
                error: "Dataset not found"
            });
        }

        const existingColumn = await pool.query(
            `SELECT id
             FROM dataset_columns
             WHERE dataset_id = $1
               AND name = $2`,
            [datasetId, name]
        );

        if (existingColumn.rows.length > 0) {
            return res.status(409).json({
                error: "Column name already exists"
            });
        }

        const result = await pool.query(
            `INSERT INTO dataset_columns
            (dataset_id, name, data_type, position, nullable)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, dataset_id, name, data_type,
                      position, nullable, created_at`,
            [
                datasetId,
                name,
                data_type,
                position,
                nullable === undefined ? true : nullable
            ]
        );

        res.status(201).json({
            message: "Column created successfully",
            column: result.rows[0]
        });
    } catch (error) {
        console.error("Failed to create dataset column:", error.message);

        res.status(500).json({
            error: "Failed to create dataset column"
        });
    }
}

async function getColumns(req, res) {
    try {
        const datasetId = req.params.id;
        const organizationId = req.user.organizationId;

        const datasetResult = await pool.query(
            `SELECT id
             FROM datasets
             WHERE id = $1
               AND organization_id = $2`,
            [datasetId, organizationId]
        );

        if (datasetResult.rows.length === 0) {
            return res.status(404).json({
                error: "Dataset not found"
            });
        }

        const result = await pool.query(
            `SELECT id, dataset_id, name, data_type,
                    position, nullable, created_at
             FROM dataset_columns
             WHERE dataset_id = $1
             ORDER BY position`,
            [datasetId]
        );

        res.json({
            columns: result.rows
        });
    } catch (error) {
        console.error("Failed to fetch dataset columns:", error.message);

        res.status(500).json({
            error: "Failed to fetch dataset columns"
        });
    }
}

module.exports = {
    createColumn,
    getColumns
};