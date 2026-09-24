const express = require("express");

const {
    getSummary,
    getDistribution,
    getTrend
} = require("../controllers/analyticsController");

const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.get(
    "/:id/summary",
    authorizeRoles("admin", "analyst"),
    getSummary
);

router.get(
    "/:id/distribution/:columnName",
    authorizeRoles("admin", "analyst"),
    getDistribution
);

router.get(
    "/:id/trend/:dateColumn/:valueColumn",
    authorizeRoles("admin", "analyst"),
    getTrend
);

module.exports = router;