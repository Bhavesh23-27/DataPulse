const {
    validateCsvForDataset,
    insertRecords
} = require("../services/csvImportService");

async function importCsv(req, res) {
    try {
        const datasetId = req.params.id;
        const organizationId = req.user.organizationId;

        if (!req.file) {
            return res.status(400).json({
                error: "CSV file is required"
            });
        }

        const csv = req.file.buffer.toString("utf-8");

        const validationResult = await validateCsvForDataset(
            csv,
            datasetId,
            organizationId
        );

        if (validationResult.errors.length > 0) {
            return res.status(400).json({
                error: "CSV validation failed",
                errors: validationResult.errors
            });
        }

        if (validationResult.transformedRows.length === 0) {
            return res.status(400).json({
                error: "CSV does not contain any data rows"
            });
        }

        const insertedRecords = await insertRecords(
            datasetId,
            validationResult.transformedRows
        );

        res.status(201).json({
            message: "CSV imported successfully",
            imported_count: insertedRecords.length,
            records: insertedRecords
        });
    } catch (error) {
        console.error("CSV import failed:", error.message);

        res.status(500).json({
            error: "CSV import failed"
        });
    }
}

module.exports = {
    importCsv
};