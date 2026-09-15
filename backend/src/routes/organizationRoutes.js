const express = require("express");
const { getOrganizations } = require("../controllers/organizationController");
const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
    "/",
    authenticateToken,
    authorizeRoles("admin", "analyst"),
    getOrganizations
);

module.exports = router;