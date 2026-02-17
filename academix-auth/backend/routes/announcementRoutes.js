const router = require("express").Router();
const Announcement = require("../models/Announcement");
const multer = require("multer");

// ==========================
// Multer Config
// ==========================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// ==========================
// Create Announcement
// ==========================

router.post("/create", upload.single("image"), async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;

    const newAnnouncement = new Announcement({
      title,
      description,
      startDate,
      endDate,
      image: req.file ? req.file.filename : null,
      status: "official"
    });

    await newAnnouncement.save();

    res.status(201).json({
      message: "Announcement created successfully"
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ==========================
// Get All Announcements
// ==========================

router.get("/all", async (req, res) => {
  try {
    const announcements = await Announcement.find({ status: "official" }).sort({ createdAt: -1 });
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
