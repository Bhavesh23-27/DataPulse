const express = require("express");
const cors = require("cors");

const organizationRoutes = require("./routes/organizationRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const datasetRoutes = require("./routes/datasetRoutes");
const datasetColumnRoutes = require("./routes/datasetColumnRoutes");
const datasetRecordRoutes = require("./routes/datasetRecordRoutes");
const importRoutes = require("./routes/importRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();

const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "DataPulse API is running"
    });
});

app.use("/api/organizations", organizationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/datasets", datasetRoutes);
app.use("/api/datasets", datasetColumnRoutes);
app.use("/api/datasets", datasetRecordRoutes);
app.use("/api/datasets", importRoutes);
app.use("/api/datasets", analyticsRoutes);

app.listen(PORT, () => {
    console.log(`DataPulse API running on port ${PORT}`);
});