const express = require("express");

const {
    createColumn,
    getColumns,
    updateColumn
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

router.put(
    "/:id/columns/:columnId",
    authorizeRoles("admin", "analyst"),
    updateColumn
);

module.exports = router;