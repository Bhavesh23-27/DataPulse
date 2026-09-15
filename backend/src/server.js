const express = require("express");
const organizationRoutes = require("./routes/organizationRoutes");

const app = express();

const PORT = 3000;

app.get("/", (req, res) => {
    res.json({
        message: "DataPulse API is running"
    });
});

app.use("/api/organizations", organizationRoutes);

app.listen(PORT, () => {
    console.log(`DataPulse API running on port ${PORT}`);
});