const express = require("express");
const organizationRoutes = require("./routes/organizationRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "DataPulse API is running"
    });
});

app.use("/api/organizations", organizationRoutes);
app.use("/api/users", userRoutes);

app.listen(PORT, () => {
    console.log(`DataPulse API running on port ${PORT}`);
});