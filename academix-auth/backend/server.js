const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const path = require("path");
const departmentRoutes = require("./routes/departments");

dotenv.config();
require("./config/passport");

const app = express();

/* =============================
   CORS
============================= */
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

/* =============================
   Middlewares
============================= */
app.use(express.json());

app.use(session({
  secret: "academixsecret",
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    sameSite: 'lax'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

/* =============================
   MongoDB Connection
============================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));
console.log("MONGO_URI:", process.env.MONGO_URI);

/* =============================
   Static Upload Folder
============================= */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =============================
   Routes
============================= */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/admin/management", require("./routes/adminUserRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));
app.use("/api/departments", departmentRoutes);
app.use("/api/study-groups", require("./routes/studyGroupRoutes"));
app.use("/api/doubts", require("./routes/doubtRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/study-planner", require("./routes/studyPlannerRoutes"));
app.use("/api/recommendations", require("./routes/recommendationRoutes"));
app.use("/api/favorites", require("./routes/favoriteRoutes"));
app.use("/api/timetable", require("./routes/timetableRoutes"));

/* =============================
   Start Server
============================= */
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
