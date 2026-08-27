const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./config/db");

const authRoutes = require("./routes/authRoutes");
const organizationRoutes = require("./routes/organizationRoutes");
const userRoutes = require("./routes/userRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const studentRoutes = require("./routes/studentRoutes");
const classRoutes = require("./routes/classRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const vleRoutes = require("./routes/vleRoutes");

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const allowedOrigin = process.env.FRONTEND_URL?.trim();

if (isProduction && !allowedOrigin) {
  throw new Error("FRONTEND_URL must be configured in production.");
}

const corsOptions = isProduction
  ? { origin: allowedOrigin }
  : { origin: allowedOrigin || true };

app.disable("x-powered-by");
app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/vle", vleRoutes);

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "EduSphere Backend" });
});

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);

  res.status(err.status || 500).json({
    message: isProduction ? "An unexpected server error occurred." : err.message || "Internal server error.",
  });
});

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => console.log(`EduSphere API listening on port ${PORT}`));
