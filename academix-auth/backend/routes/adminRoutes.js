const router = require("express").Router();
const AllowedUser = require("../models/AllowedUser");
const Announcement = require("../models/Announcement");
const User = require("../models/User");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");

/* ============================
   Multer Setup
============================ */
const upload = multer({ dest: "uploads/" });

/* ============================
   Add Single Allowed User
============================ */
router.post("/add", async (req, res) => {
  try {
    let { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ message: "Email and role required" });
    }

    email = email.toLowerCase().trim();

    const existing = await AllowedUser.findOne({ email });

    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const newUser = await AllowedUser.create({ email, role });

    res.status(201).json({
      message: "Allowed user added successfully",
      data: newUser
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ============================
   Get All Allowed Users
============================ */
router.get("/all", async (req, res) => {
  try {
    const users = await AllowedUser.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ============================
   Bulk Upload CSV
============================ */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const results = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {

        for (const row of results) {
          let { email, role } = row;

          if (!email || !role) continue;

          email = email.toLowerCase().trim();

          const exists = await AllowedUser.findOne({ email });

          if (!exists) {
            await AllowedUser.create({ email, role });
          }
        }

        // Only ONE unlink
        fs.unlinkSync(req.file.path);

        // Only ONE response
        res.json({ message: "Bulk users uploaded successfully" });
      });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


/* ============================
   Delete Allowed User
============================ */
router.delete("/delete/:id", async (req, res) => {
  try {
    await AllowedUser.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ============================
   Dashboard Stats
============================ */
router.get(
  "/dashboard-stats",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      const totalStudents = await User.countDocuments({ role: "student" });

      const totalAnnouncements = await Announcement.countDocuments({
        status: "official"
      });

      const pendingRequests = await Announcement.countDocuments({
        status: "pending"
      });

      const recentActivity = await Announcement.find()
        .populate("postedBy", "name role")
        .sort({ createdAt: -1 })
        .limit(5);

      res.json({
        totalStudents,
        totalAnnouncements,
        pendingRequests,
        recentActivity
      });

    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
