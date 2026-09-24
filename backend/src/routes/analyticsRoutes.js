const express = require("express");

const { getSummary } = require("../controllers/analyticsController");
const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.get(
    "/:id/summary",
    authorizeRoles("admin", "analyst"),
    getSummary
);

module.exports = router;