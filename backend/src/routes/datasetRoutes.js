const express = require("express");

const {
    createDataset,
    getDatasets,
    getDatasetById,
    updateDataset,
    deleteDataset
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

router.put(
    "/:id",
    authorizeRoles("admin", "analyst"),
    updateDataset
);

router.delete(
    "/:id",
    authorizeRoles("admin", "analyst"),
    deleteDataset
);

module.exports = router;