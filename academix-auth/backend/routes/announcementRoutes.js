const router = require("express").Router();
const Announcement = require("../models/Announcement");
const Notification = require("../models/Notification");
const { isAuthenticated, isAdmin, isFaculty } = require("../middleware/auth");
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
        target: "student",
        postedByRole: "student",
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
   FACULTY → Direct Official Post (No Approval Needed)
===================================================== */

router.post(
  "/faculty-post",
  isAuthenticated,
  isFaculty,
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
        target: "student",
        postedByRole: "faculty",
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
        registrationRequired,
        target
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
        target: target || "student",
        postedByRole: "admin",
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
   GET Official Announcements
   ?type=admin   → admin-posted, target=student
   ?type=student → student-approved posts
   ?type=faculty → admin-posted, target=faculty (for Faculty Dashboard)
   ?type=facultyPosts → faculty-posted, target=student (for Student Dashboard)
===================================================== */

router.get("/official", async (req, res) => {
  try {
    const { type } = req.query;

    let filter = { status: "official" };

    if (type === "student") {
      // Approved student-submitted posts
      filter.postedByRole = "student";
    } else if (type === "faculty") {
      // Admin-posted announcements targeted TO faculty
      filter.postedByRole = { $in: ["admin", "mainAdmin"] };
      filter.target = "faculty";
    } else if (type === "facultyPosts") {
      // Faculty-posted announcements for students
      filter.postedByRole = "faculty";
      filter.target = "student";
    } else {
      // Default: admin-posted for students
      filter.postedByRole = { $in: ["admin", "mainAdmin"] };
      filter.target = { $in: ["student", "all"] };
    }

    const announcements = await Announcement.find(filter)
      .populate("postedBy", "name role department")
      .sort({ createdAt: -1 });

    res.status(200).json(announcements);

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/* =====================================================
   GET My Announcements (current user)
===================================================== */

router.get("/my", isAuthenticated, async (req, res) => {
  try {
    const announcements = await Announcement.find({ postedBy: req.user._id })
      .populate("postedBy", "name role department")
      .sort({ createdAt: -1 });

    res.status(200).json(announcements);

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

      // Notify the requester
      try {
        const newNotif = new Notification({
          recipient: updated.postedBy,
          sender: req.user._id,
          type: "announcement",
          title: "Post Approved! 🚀",
          message: `Your post "${updated.title.substring(0, 20)}..." has been approved and is now live.`,
          link: "/dashboard"
        });
        await newNotif.save();
      } catch (err) {
        console.error("Approval notification error:", err);
      }

      res.status(200).json({
        message: "Announcement approved successfully"
      });

    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
);

/* =====================================================
   ADMIN → Reject Request
===================================================== */

router.patch(
  "/:id/reject",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      const updated = await Announcement.findByIdAndUpdate(
        req.params.id,
        { status: "rejected" },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ message: "Announcement not found" });
      }

      res.status(200).json({ message: "Announcement rejected" });

    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
);

module.exports = router;
