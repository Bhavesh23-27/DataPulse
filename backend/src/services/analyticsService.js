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

async function getColumnDistribution(
    datasetId,
    organizationId,
    columnName
) {
    const datasetResult = await pool.query(
        `
        SELECT id
        FROM datasets
        WHERE id = $1
          AND organization_id = $2
        `,
        [datasetId, organizationId]
    );

    if (datasetResult.rows.length === 0) {
        throw new Error("Dataset not found");
    }

    const columnResult = await pool.query(
        `
        SELECT name, data_type
        FROM dataset_columns
        WHERE dataset_id = $1
          AND name = $2
        `,
        [datasetId, columnName]
    );

    if (columnResult.rows.length === 0) {
        throw new Error("Column not found");
    }

    if (
        columnResult.rows[0].data_type !== "text" &&
        columnResult.rows[0].data_type !== "boolean"
    ) {
        throw new Error(
            "Distribution is only available for text and boolean columns"
        );
    }

    const recordsResult = await pool.query(
        `
        SELECT data
        FROM dataset_records
        WHERE dataset_id = $1
        ORDER BY row_number
        `,
        [datasetId]
    );

    const counts = {};
    let total = 0;

    for (const record of recordsResult.rows) {
        const value = record.data[columnName];

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            continue;
        }

        const key = String(value);

        counts[key] = (counts[key] || 0) + 1;
        total++;
    }

    const distribution = Object.entries(counts)
        .map(([value, count]) => ({
            value,
            count,
            percentage: total === 0
                ? 0
                : (count / total) * 100
        }))
        .sort((a, b) => b.count - a.count);

    return {
        dataset_id: datasetId,
        column: columnName,
        total,
        distribution
    };
}

async function getColumnTrend(
    datasetId,
    organizationId,
    dateColumnName,
    valueColumnName
) {
    const datasetResult = await pool.query(
        `
        SELECT id
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
          AND name IN ($2, $3)
        `,
        [datasetId, dateColumnName, valueColumnName]
    );

    const dateColumn = columnsResult.rows.find(
        (column) => column.name === dateColumnName
    );

    const valueColumn = columnsResult.rows.find(
        (column) => column.name === valueColumnName
    );

    if (!dateColumn) {
        throw new Error("Date column not found");
    }

    if (!valueColumn) {
        throw new Error("Value column not found");
    }

    if (
        dateColumn.data_type !== "date" &&
        dateColumn.data_type !== "datetime"
    ) {
        throw new Error(
            "Trend date column must be a date or datetime column"
        );
    }

    if (valueColumn.data_type !== "number") {
        throw new Error(
            "Trend value column must be a number column"
        );
    }

    const recordsResult = await pool.query(
        `
        SELECT data
        FROM dataset_records
        WHERE dataset_id = $1
        ORDER BY row_number
        `,
        [datasetId]
    );

    const trend = [];

    for (const record of recordsResult.rows) {
        const dateValue = record.data[dateColumnName];
        const value = record.data[valueColumnName];

        if (
            dateValue === null ||
            dateValue === undefined ||
            dateValue === "" ||
            value === null ||
            value === undefined ||
            value === "" ||
            Number.isNaN(Number(value))
        ) {
            continue;
        }

        trend.push({
            date: String(dateValue),
            value: Number(value)
        });
    }

    trend.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
    );

    return {
        dataset_id: datasetId,
        date_column: dateColumnName,
        value_column: valueColumnName,
        total: trend.length,
        trend
    };
}

async function getDashboardData(datasetId, organizationId) {
    const datasetResult = await pool.query(
        `
        SELECT id, name, description, source_type, status, created_at
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
        SELECT name, data_type, position, nullable
        FROM dataset_columns
        WHERE dataset_id = $1
        ORDER BY position
        `,
        [datasetId]
    );

    const summary = await getDatasetSummary(
        datasetId,
        organizationId
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

    const distributions = {};

    for (const column of columnsResult.rows) {
        if (
            column.data_type !== "text" &&
            column.data_type !== "boolean"
        ) {
            continue;
        }

        const counts = {};
        let total = 0;

        for (const record of recordsResult.rows) {
            const value = record.data[column.name];

            if (
                value === null ||
                value === undefined ||
                value === ""
            ) {
                continue;
            }

            const key = String(value);

            counts[key] = (counts[key] || 0) + 1;
            total++;
        }

        distributions[column.name] = {
            total,
            values: Object.entries(counts)
                .map(([value, count]) => ({
                    value,
                    count,
                    percentage: total === 0
                        ? 0
                        : (count / total) * 100
                }))
                .sort((a, b) => b.count - a.count)
        };
    }

    const dateColumns = columnsResult.rows.filter(
        (column) =>
            column.data_type === "date" ||
            column.data_type === "datetime"
    );

    const numberColumns = columnsResult.rows.filter(
        (column) => column.data_type === "number"
    );

    const trends = {};

    for (const dateColumn of dateColumns) {
        for (const numberColumn of numberColumns) {
            const trend = [];

            for (const record of recordsResult.rows) {
                const dateValue = record.data[dateColumn.name];
                const value = record.data[numberColumn.name];

                if (
                    dateValue === null ||
                    dateValue === undefined ||
                    dateValue === "" ||
                    value === null ||
                    value === undefined ||
                    value === "" ||
                    Number.isNaN(Number(value))
                ) {
                    continue;
                }

                trend.push({
                    date: String(dateValue),
                    value: Number(value)
                });
            }

            trend.sort(
                (a, b) =>
                    new Date(a.date) - new Date(b.date)
            );

            trends[`${dateColumn.name}:${numberColumn.name}`] = {
                date_column: dateColumn.name,
                value_column: numberColumn.name,
                total: trend.length,
                trend
            };
        }
    }

    return {
        dataset: datasetResult.rows[0],
        columns: columnsResult.rows,
        summary,
        distributions,
        trends
    };
}

module.exports = {
    getDatasetSummary,
    getColumnDistribution,
    getColumnTrend,
    getDashboardData
};