const pool = require("../db");

function validateRecordData(data, columns) {
    for (const column of columns) {
        const value = data[column.name];

        if (value === undefined || value === null) {
            if (!column.nullable) {
                return `${column.name} is required`;
            }

            continue;
        }

        switch (column.data_type) {
            case "text":
                if (typeof value !== "string") {
                    return `${column.name} must be text`;
                }
                break;

            case "number":
                if (typeof value !== "number" || !Number.isFinite(value)) {
                    return `${column.name} must be a number`;
                }
                break;

            case "boolean":
                if (typeof value !== "boolean") {
                    return `${column.name} must be a boolean`;
                }
                break;

            case "date":
                if (
                    typeof value !== "string" ||
                    !/^\d{4}-\d{2}-\d{2}$/.test(value)
                ) {
                    return `${column.name} must be a valid date in YYYY-MM-DD format`;
                }
                break;

            case "datetime":
                if (
                    typeof value !== "string" ||
                    Number.isNaN(Date.parse(value))
                ) {
                    return `${column.name} must be a valid datetime`;
                }
                break;

            default:
                return `Unsupported data type for ${column.name}`;
        }
    }

    const allowedFields = new Set(
        columns.map((column) => column.name)
    );

    for (const field of Object.keys(data)) {
        if (!allowedFields.has(field)) {
            return `${field} is not a valid dataset column`;
        }
    }

    return null;
}

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

        const columnsResult = await pool.query(
            `SELECT name, data_type, nullable
             FROM dataset_columns
             WHERE dataset_id = $1
             ORDER BY position`,
            [datasetId]
        );

        const validationError = validateRecordData(
            data,
            columnsResult.rows
        );

        if (validationError) {
            return res.status(400).json({
                error: validationError
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

async function getRecordById(req, res) {
    try {
        const datasetId = req.params.id;
        const recordId = req.params.recordId;
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
             WHERE id = $1
               AND dataset_id = $2`,
            [recordId, datasetId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Record not found"
            });
        }

        res.json({
            record: result.rows[0]
        });
    } catch (error) {
        console.error("Failed to fetch dataset record:", error.message);

        res.status(500).json({
            error: "Failed to fetch dataset record"
        });
    }
}

async function updateRecord(req, res) {
    try {
        const datasetId = req.params.id;
        const recordId = req.params.recordId;
        const organizationId = req.user.organizationId;

        const { data } = req.body;

        if (!data) {
            return res.status(400).json({
                error: "Data is required"
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

        const recordResult = await pool.query(
            `SELECT id, row_number
             FROM dataset_records
             WHERE id = $1
               AND dataset_id = $2`,
            [recordId, datasetId]
        );

        if (recordResult.rows.length === 0) {
            return res.status(404).json({
                error: "Record not found"
            });
        }

        const columnsResult = await pool.query(
            `SELECT name, data_type, nullable
             FROM dataset_columns
             WHERE dataset_id = $1
             ORDER BY position`,
            [datasetId]
        );

        const validationError = validateRecordData(
            data,
            columnsResult.rows
        );

        if (validationError) {
            return res.status(400).json({
                error: validationError
            });
        }

        const result = await pool.query(
            `UPDATE dataset_records
             SET data = $1
             WHERE id = $2
               AND dataset_id = $3
             RETURNING id, dataset_id, data, row_number, created_at`,
            [
                data,
                recordId,
                datasetId
            ]
        );

        res.json({
            message: "Record updated successfully",
            record: result.rows[0]
        });
    } catch (error) {
        console.error("Failed to update dataset record:", error.message);

        res.status(500).json({
            error: "Failed to update dataset record"
        });
    }
}

module.exports = {
    createRecord,
    getRecords,
    getRecordById,
    updateRecord
};