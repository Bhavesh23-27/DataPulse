const express = require("express");

const { importData } = require("../controllers/importController");
const { authenticateToken } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.post(
    "/:id/import",
    authorizeRoles("admin", "analyst"),
    upload.single("file"),
    importData
);

module.exports = router;