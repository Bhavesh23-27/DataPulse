const express = require("express");
const {
    createDataset,
    getDatasets,
    getDatasetById
} = require("../controllers/datasetController");
const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.post(
    "/",
    authorizeRoles("admin", "analyst"),
    createDataset
);

router.get(
    "/",
    authorizeRoles("admin", "analyst", "viewer"),
    getDatasets
);

router.get(
    "/:id",
    authorizeRoles("admin", "analyst", "viewer"),
    getDatasetById
);

module.exports = router;