const express = require("express");

const {
    createRecord,
    getRecords,
    getRecordById
} = require("../controllers/datasetRecordController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const {
    authorizeRoles
} = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.post(
    "/:id/records",
    authorizeRoles("admin", "analyst"),
    createRecord
);

router.get(
    "/:id/records",
    authorizeRoles("admin", "analyst", "viewer"),
    getRecords
);

router.get(
    "/:id/records/:recordId",
    authorizeRoles("admin", "analyst", "viewer"),
    getRecordById
);

module.exports = router;