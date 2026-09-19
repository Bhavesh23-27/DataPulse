const { parse } = require("csv-parse/sync");

function parseCsv(csvText) {
    const records = parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    });

    return records;
}

function convertValue(value, dataType) {
    if (value === undefined || value === null || value === "") {
        return null;
    }

    switch (dataType) {
        case "text":
            return String(value);

        case "number": {
            const numberValue = Number(value);

            if (!Number.isFinite(numberValue)) {
                throw new Error(`Invalid number value: ${value}`);
            }

            return numberValue;
        }

        case "boolean": {
            const normalizedValue = String(value).toLowerCase();

            if (normalizedValue === "true") {
                return true;
            }

            if (normalizedValue === "false") {
                return false;
            }

            throw new Error(`Invalid boolean value: ${value}`);
        }

        case "date": {
            const datePattern = /^\d{4}-\d{2}-\d{2}$/;

            if (!datePattern.test(value)) {
                throw new Error(`Invalid date value: ${value}`);
            }

            const date = new Date(`${value}T00:00:00Z`);

            if (Number.isNaN(date.getTime())) {
                throw new Error(`Invalid date value: ${value}`);
            }

            return value;
        }

        case "datetime": {
            const date = new Date(value);

            if (Number.isNaN(date.getTime())) {
                throw new Error(`Invalid datetime value: ${value}`);
            }

            return date.toISOString();
        }

        default:
            throw new Error(`Unsupported data type: ${dataType}`);
    }
}

function validateAndTransformRows(rows, columns) {
    const columnMap = new Map(
        columns.map((column) => [column.name, column])
    );

    const allowedColumnNames = new Set(
        columns.map((column) => column.name)
    );

    const errors = [];
    const transformedRows = [];

    rows.forEach((row, rowIndex) => {
        const rowNumber = rowIndex + 1;
        const rowErrors = [];
        const transformedRow = {};

        for (const columnName of Object.keys(row)) {
            if (!allowedColumnNames.has(columnName)) {
                rowErrors.push(
                    `Unknown column: ${columnName}`
                );
            }
        }

        for (const column of columns) {
            const value = row[column.name];

            if (
                (value === undefined || value === "") &&
                !column.nullable
            ) {
                rowErrors.push(
                    `Missing required value for column: ${column.name}`
                );

                continue;
            }

            if (value === undefined || value === "") {
                transformedRow[column.name] = null;
                continue;
            }

            try {
                transformedRow[column.name] = convertValue(
                    value,
                    column.data_type
                );
            } catch (error) {
                rowErrors.push(
                    `Column ${column.name}: ${error.message}`
                );
            }
        }

        if (rowErrors.length > 0) {
            errors.push({
                row: rowNumber,
                errors: rowErrors
            });
        } else {
            transformedRows.push(transformedRow);
        }
    });

    return {
        transformedRows,
        errors
    };
}

module.exports = {
    parseCsv,
    convertValue,
    validateAndTransformRows
};