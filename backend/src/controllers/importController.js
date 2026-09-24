const {
    parseCsv,
    parseJson,
    validateAndTransformRows,
    getDatasetColumns,
    insertRecords
} = require("../services/csvImportService");

async function importData(req, res) {
    try {
        const datasetId = req.params.id;
        const organizationId = req.user.organizationId;

        if (!req.file) {
            return res.status(400).json({
                error: "CSV or JSON file is required"
            });
        }

        const fileName = req.file.originalname.toLowerCase();
        const fileContent = req.file.buffer.toString("utf-8");

        let rows;

        if (fileName.endsWith(".csv")) {
            rows = parseCsv(fileContent);
        } else if (fileName.endsWith(".json")) {
            rows = parseJson(fileContent);
        } else {
            return res.status(400).json({
                error: "Only CSV and JSON files are supported"
            });
        }

        const columns = await getDatasetColumns(
            datasetId,
            organizationId
        );

        const validationResult = validateAndTransformRows(
            rows,
            columns
        );

        if (validationResult.errors.length > 0) {
            return res.status(400).json({
                error: "File validation failed",
                errors: validationResult.errors
            });
        }

        if (validationResult.transformedRows.length === 0) {
            return res.status(400).json({
                error: "File does not contain any data rows"
            });
        }

        const insertedRecords = await insertRecords(
            datasetId,
            validationResult.transformedRows
        );

        return res.status(201).json({
            message: "File imported successfully",
            imported_count: insertedRecords.length,
            records: insertedRecords
        });
    } catch (error) {
        console.error("Data import failed:", error.message);

        return res.status(400).json({
            error: error.message
        });
    }
}

module.exports = {
    importData
};