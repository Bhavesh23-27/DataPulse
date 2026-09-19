const express = require("express");

const { importCsv } = require("../controllers/importController");
const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.post(
    "/:id/import",
    authorizeRoles("admin", "analyst"),
    importCsv
);

module.exports = router;