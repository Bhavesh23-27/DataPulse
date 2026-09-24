const {
    getDatasetSummary,
    getColumnDistribution
} = require("../services/analyticsService");

async function getSummary(req, res) {
    try {
        const datasetId = req.params.id;
        const organizationId = req.user.organizationId;

        const summary = await getDatasetSummary(
            datasetId,
            organizationId
        );

        return res.status(200).json(summary);
    } catch (error) {
        console.error("Analytics summary failed:", error.message);

        if (error.message === "Dataset not found") {
            return res.status(404).json({
                error: "Dataset not found"
            });
        }

        return res.status(500).json({
            error: "Failed to generate dataset summary"
        });
    }
}

async function getDistribution(req, res) {
    try {
        const datasetId = req.params.id;
        const columnName = req.params.columnName;
        const organizationId = req.user.organizationId;

        const distribution = await getColumnDistribution(
            datasetId,
            organizationId,
            columnName
        );

        return res.status(200).json(distribution);
    } catch (error) {
        console.error(
            "Column distribution failed:",
            error.message
        );

        if (
            error.message === "Dataset not found" ||
            error.message === "Column not found"
        ) {
            return res.status(404).json({
                error: error.message
            });
        }

        if (
            error.message ===
            "Distribution is only available for text and boolean columns"
        ) {
            return res.status(400).json({
                error: error.message
            });
        }

        return res.status(500).json({
            error: "Failed to generate column distribution"
        });
    }
}

module.exports = {
    getSummary,
    getDistribution
};