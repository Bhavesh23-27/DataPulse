const pool = require("../db");

async function createRecord(req, res) {
    try {
        const datasetId = req.params.id;
        const organizationId = req.user.organizationId;

        const { data, row_number } = req.body;

        if (!data || row_number === undefined) {
            return res.status(400).json({
                error: "Data and row_number are required"
            });
        }

        if (
            typeof data !== "object" ||
            Array.isArray(data) ||
            data === null
        ) {
            return res.status(400).json({
                error: "Data must be a JSON object"
            });
        }

        if (!Number.isInteger(row_number) || row_number <= 0) {
            return res.status(400).json({
                error: "row_number must be a positive integer"
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

        const existingRecord = await pool.query(
            `SELECT id
             FROM dataset_records
             WHERE dataset_id = $1
               AND row_number = $2`,
            [datasetId, row_number]
        );

        if (existingRecord.rows.length > 0) {
            return res.status(409).json({
                error: "Row number already exists"
            });
        }

        const result = await pool.query(
            `INSERT INTO dataset_records
            (dataset_id, data, row_number)
            VALUES ($1, $2, $3)
            RETURNING id, dataset_id, data, row_number, created_at`,
            [
                datasetId,
                data,
                row_number
            ]
        );

        res.status(201).json({
            message: "Record created successfully",
            record: result.rows[0]
        });
    } catch (error) {
        console.error("Failed to create dataset record:", error.message);

        res.status(500).json({
            error: "Failed to create dataset record"
        });
    }
}

async function getRecords(req, res) {
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
            `SELECT id, dataset_id, data, row_number, created_at
             FROM dataset_records
             WHERE dataset_id = $1
             ORDER BY row_number`,
            [datasetId]
        );

        res.json({
            records: result.rows
        });
    } catch (error) {
        console.error("Failed to fetch dataset records:", error.message);

        res.status(500).json({
            error: "Failed to fetch dataset records"
        });
    }
}

module.exports = {
    createRecord,
    getRecords
};