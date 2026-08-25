const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./config/db");

const authRoutes = require("./routes/authRoutes");
const organizationRoutes = require("./routes/organizationRoutes");
const userRoutes = require("./routes/userRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const teacherClassRoutes = require("./routes/teacherClassRoutes");
const teacherLearningRoutes = require("./routes/teacherLearningRoutes");
const studentRoutes = require("./routes/studentRoutes");
const studentLearningRoutes = require("./routes/studentLearningRoutes");
const classRoutes = require("./routes/classRoutes");
const subjectRoutes = require("./routes/subjectRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/teachers/classes", teacherClassRoutes);
app.use("/api/teachers/learning", teacherLearningRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/students/learning", studentLearningRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/subjects", subjectRoutes);

app.get("/", (req, res) => {
  res.send("🚀 EduSphere Backend is Running...");
});

app.get("/test", (req, res) => {
  res.send("Test route works!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
