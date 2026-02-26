const router = require("express").Router();
const Announcement = require("../models/Announcement");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const multer = require("multer");

/* ==========================
   Multer Config
========================== */

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

/* =====================================================
   STUDENT → Send Announcement Request (Pending)
===================================================== */

router.post(
  "/student-request",
  isAuthenticated,
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        title,
        description,
        venue,
        eventType,
        startDate,
        endDate,
        registrationRequired
      } = req.body;

      const newAnnouncement = new Announcement({
        title,
        description,
        venue,
        eventType,
        startDate,
        endDate,
        registrationRequired,
        image: req.file ? req.file.filename : null,
        status: "pending",
        postedBy: req.user._id
      });

      await newAnnouncement.save();

      res.status(201).json({
        message: "Request sent to admin for approval"
      });

    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
);

/* =====================================================
   ADMIN → Direct Official Post
===================================================== */

router.post(
  "/create",
  isAuthenticated,
  isAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        title,
        description,
        venue,
        eventType,
        startDate,
        endDate,
        registrationRequired
      } = req.body;

      const newAnnouncement = new Announcement({
        title,
        description,
        venue,
        eventType,
        startDate,
        endDate,
        registrationRequired,
        image: req.file ? req.file.filename : null,
        status: "official",
        postedBy: req.user._id
      });

      await newAnnouncement.save();

      res.status(201).json({
        message: "Announcement posted successfully"
      });

    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
);

/* =====================================================
   PUBLIC → Get Official Announcements
   ?type=admin   → only admin posts
   ?type=student → only approved student posts
===================================================== */

router.get("/official", async (req, res) => {
  try {
    const { type } = req.query;

    const announcements = await Announcement.find({
      status: "official"
    })
      .populate({
        path: "postedBy",
        select: "name role",
        match:
          type === "student"
            ? { role: "student" }
            : { role: { $in: ["admin", "mainAdmin"] } }
      })
      .sort({ createdAt: -1 });

    // Remove unmatched populated results
    const filtered = announcements.filter(a => a.postedBy);

    res.status(200).json(filtered);

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/* =====================================================
   ADMIN → Get Pending Requests
===================================================== */

router.get(
  "/pending",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      const pendingAnnouncements = await Announcement.find({
        status: "pending"
      })
        .populate("postedBy", "name email role")
        .sort({ createdAt: -1 });

      res.status(200).json(pendingAnnouncements);

    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
);

/* =====================================================
   ADMIN → Approve Request
===================================================== */

router.patch(
  "/:id/approve",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      const updated = await Announcement.findByIdAndUpdate(
        req.params.id,
        { status: "official" },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ message: "Announcement not found" });
      }

      res.status(200).json({
        message: "Announcement approved successfully"
      });

    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
);

module.exports = router;
