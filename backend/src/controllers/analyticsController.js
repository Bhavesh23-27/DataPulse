const {
    getDatasetSummary,
    getColumnDistribution,
    getColumnTrend,
    getDashboardData
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

async function getTrend(req, res) {
    try {
        const datasetId = req.params.id;
        const dateColumnName = req.params.dateColumn;
        const valueColumnName = req.params.valueColumn;
        const organizationId = req.user.organizationId;

        const trend = await getColumnTrend(
            datasetId,
            organizationId,
            dateColumnName,
            valueColumnName
        );

        return res.status(200).json(trend);
    } catch (error) {
        console.error(
            "Column trend failed:",
            error.message
        );

        if (
            error.message === "Dataset not found" ||
            error.message === "Date column not found" ||
            error.message === "Value column not found"
        ) {
            return res.status(404).json({
                error: error.message
            });
        }

        if (
            error.message ===
            "Trend date column must be a date or datetime column" ||
            error.message ===
            "Trend value column must be a number column"
        ) {
            return res.status(400).json({
                error: error.message
            });
        }

        return res.status(500).json({
            error: "Failed to generate column trend"
        });
    }
}

async function getDashboard(req, res) {
    try {
        const datasetId = req.params.id;
        const organizationId = req.user.organizationId;

        const dashboard = await getDashboardData(
            datasetId,
            organizationId
        );

        return res.status(200).json(dashboard);
    } catch (error) {
        console.error(
            "Dashboard analytics failed:",
            error.message
        );

        if (error.message === "Dataset not found") {
            return res.status(404).json({
                error: "Dataset not found"
            });
        }

        return res.status(500).json({
            error: "Failed to generate dashboard data"
        });
    }
}

module.exports = {
    getSummary,
    getDistribution,
    getTrend,
    getDashboard
};