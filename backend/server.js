const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./config/db");

const authRoutes = require("./routes/authRoutes");
const organizationRoutes = require("./routes/organizationRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/organizations", organizationRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("🚀 EduSphere Backend is Running...");
});

app.get("/test", (req, res) => {
  res.send("Test route works!");
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});