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

        const trimmedName = name.trim();

        if (!trimmedName) {
            return res.status(400).json({
                error: "Column name cannot be empty"
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

        if (
            nullable !== undefined &&
            typeof nullable !== "boolean"
        ) {
            return res.status(400).json({
                error: "nullable must be a boolean"
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
            [datasetId, trimmedName]
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
                trimmedName,
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
        console.error(
            "Failed to create dataset column:",
            error.message
        );

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
        console.error(
            "Failed to fetch dataset columns:",
            error.message
        );

        res.status(500).json({
            error: "Failed to fetch dataset columns"
        });
    }
}

async function updateColumn(req, res) {
    const client = await pool.connect();

    try {
        const datasetId = req.params.id;
        const columnId = req.params.columnId;
        const organizationId = req.user.organizationId;

        const {
            name,
            nullable
        } = req.body;

        if (!name || nullable === undefined) {
            return res.status(400).json({
                error: "Name and nullable are required"
            });
        }

        const trimmedName = name.trim();

        if (!trimmedName) {
            return res.status(400).json({
                error: "Column name cannot be empty"
            });
        }

        if (typeof nullable !== "boolean") {
            return res.status(400).json({
                error: "nullable must be a boolean"
            });
        }

        await client.query("BEGIN");

        const datasetResult = await client.query(
            `SELECT id
             FROM datasets
             WHERE id = $1
               AND organization_id = $2`,
            [datasetId, organizationId]
        );

        if (datasetResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                error: "Dataset not found"
            });
        }

        const columnResult = await client.query(
            `SELECT id, name, data_type, position, nullable
             FROM dataset_columns
             WHERE id = $1
               AND dataset_id = $2`,
            [columnId, datasetId]
        );

        if (columnResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                error: "Column not found"
            });
        }

        const existingColumnData = columnResult.rows[0];
        const oldName = existingColumnData.name;

        const duplicateColumn = await client.query(
            `SELECT id
             FROM dataset_columns
             WHERE dataset_id = $1
               AND name = $2
               AND id <> $3`,
            [
                datasetId,
                trimmedName,
                columnId
            ]
        );

        if (duplicateColumn.rows.length > 0) {
            await client.query("ROLLBACK");

            return res.status(409).json({
                error: "Column name already exists"
            });
        }

        if (!nullable) {
            const recordsResult = await client.query(
                `SELECT id
                 FROM dataset_records
                 WHERE dataset_id = $1
                   AND (
                       data -> $2 IS NULL
                       OR data -> $2 = 'null'::jsonb
                   )
                 LIMIT 1`,
                [
                    datasetId,
                    oldName
                ]
            );

            if (recordsResult.rows.length > 0) {
                await client.query("ROLLBACK");

                return res.status(400).json({
                    error:
                        "Column cannot be non-nullable because existing records contain null or missing values"
                });
            }
        }

        if (oldName !== trimmedName) {
            await client.query(
                `UPDATE dataset_records
                 SET data =
                     (data - $1) ||
                     jsonb_build_object(
                         $2::text,
                         data -> $1
                     )
                 WHERE dataset_id = $3
                   AND data ? $1`,
                [
                    oldName,
                    trimmedName,
                    datasetId
                ]
            );
        }

        const result = await client.query(
            `UPDATE dataset_columns
             SET name = $1,
                 nullable = $2
             WHERE id = $3
               AND dataset_id = $4
             RETURNING id, dataset_id, name, data_type,
                       position, nullable, created_at`,
            [
                trimmedName,
                nullable,
                columnId,
                datasetId
            ]
        );

        await client.query("COMMIT");

        res.json({
            message: "Column updated successfully",
            column: result.rows[0]
        });
    } catch (error) {
        try {
            await client.query("ROLLBACK");
        } catch (rollbackError) {
            console.error(
                "Rollback failed:",
                rollbackError.message
            );
        }

        console.error(
            "Failed to update dataset column:",
            error.message
        );

        res.status(500).json({
            error: "Failed to update dataset column"
        });
    } finally {
        client.release();
    }
}

module.exports = {
    createColumn,
    getColumns,
    updateColumn
};