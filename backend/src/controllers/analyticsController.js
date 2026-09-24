const { getDatasetSummary } = require("../services/analyticsService");

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

module.exports = {
    getSummary
};