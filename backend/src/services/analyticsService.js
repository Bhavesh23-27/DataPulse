const pool = require("../db");

async function getDatasetSummary(datasetId, organizationId) {
    const datasetResult = await pool.query(
        `
        SELECT id, name
        FROM datasets
        WHERE id = $1
          AND organization_id = $2
        `,
        [datasetId, organizationId]
    );

    if (datasetResult.rows.length === 0) {
        throw new Error("Dataset not found");
    }

    const columnsResult = await pool.query(
        `
        SELECT name, data_type
        FROM dataset_columns
        WHERE dataset_id = $1
        ORDER BY position
        `,
        [datasetId]
    );

    const recordsResult = await pool.query(
        `
        SELECT data
        FROM dataset_records
        WHERE dataset_id = $1
        ORDER BY row_number
        `,
        [datasetId]
    );

    const summary = {
        dataset_id: datasetId,
        dataset_name: datasetResult.rows[0].name,
        row_count: recordsResult.rows.length,
        columns: {}
    };

    for (const column of columnsResult.rows) {
        if (column.data_type !== "number") {
            continue;
        }

        const values = recordsResult.rows
            .map((record) => record.data[column.name])
            .filter(
                (value) =>
                    value !== null &&
                    value !== undefined &&
                    value !== "" &&
                    !Number.isNaN(Number(value))
            )
            .map(Number);

        if (values.length === 0) {
            summary.columns[column.name] = {
                count: 0,
                sum: 0,
                average: 0,
                minimum: null,
                maximum: null
            };

            continue;
        }

        const sum = values.reduce(
            (total, value) => total + value,
            0
        );

        summary.columns[column.name] = {
            count: values.length,
            sum,
            average: sum / values.length,
            minimum: Math.min(...values),
            maximum: Math.max(...values)
        };
    }

    return summary;
}

module.exports = {
    getDatasetSummary
};