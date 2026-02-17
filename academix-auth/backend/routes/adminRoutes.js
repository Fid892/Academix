const router = require("express").Router();
const AllowedUser = require("../models/AllowedUser");

const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");

// ============================
// Multer Storage Configuration
// ============================
const upload = multer({
  dest: "uploads/"
});


// ============================
// Add Single Allowed User
// ============================
router.post("/add", async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ message: "Email and role required" });
    }

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
    res.status(500).json({ message: "Server error", error });
  }
});


// ============================
// Get All Allowed Users
// ============================
router.get("/all", async (req, res) => {
  try {
    const users = await AllowedUser.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});


// ============================
// Bulk Upload CSV File
// CSV Format:
// email,role
// student1@gmail.com,student
// faculty1@gmail.com,faculty
// ============================
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
          const { email, role } = row;

          if (!email || !role) continue;

          const exists = await AllowedUser.findOne({ email });

          if (!exists) {
            await AllowedUser.create({ email, role });
          }
        }

        // Delete uploaded file after processing
        fs.unlinkSync(req.file.path);

        res.json({ message: "Bulk users uploaded successfully" });
      });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});
// Delete user by ID
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await AllowedUser.findByIdAndDelete(id);

    res.status(200).json({ message: "User deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
