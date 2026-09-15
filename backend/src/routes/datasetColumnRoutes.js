const express = require("express");

const {
    createColumn,
    getColumns
} = require("../controllers/datasetColumnController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const {
    authorizeRoles
} = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.post(
    "/:id/columns",
    authorizeRoles("admin", "analyst"),
    createColumn
);

router.get(
    "/:id/columns",
    authorizeRoles("admin", "analyst", "viewer"),
    getColumns
);

module.exports = router;
