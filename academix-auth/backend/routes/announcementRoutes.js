const router = require("express").Router();
const Announcement = require("../models/Announcement");
const AnnouncementLike = require("../models/AnnouncementLike");
const AnnouncementComment = require("../models/AnnouncementComment");
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

/* =====================================================
   LIKE SYSTEM (Twitter-style)
===================================================== */

router.post("/like", isAuthenticated, async (req, res) => {
  try {
    const { announcementId } = req.body;
    const userId = req.user._id;

    const existingLike = await AnnouncementLike.findOne({ userId, announcementId });
    if (existingLike) {
      return res.status(400).json({ message: "Already liked" });
    }

    const like = new AnnouncementLike({ userId, announcementId });
    await like.save();

    res.status(201).json({ message: "Like added" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.delete("/like", isAuthenticated, async (req, res) => {
  try {
    const { announcementId } = req.body;
    const userId = req.user._id;

    await AnnouncementLike.findOneAndDelete({ userId, announcementId });
    res.status(200).json({ message: "Like removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/* =====================================================
   COMMENT SYSTEM (Thread-based)
===================================================== */

router.post("/comment", isAuthenticated, async (req, res) => {
  try {
    const { announcementId, content } = req.body;

    const newComment = new AnnouncementComment({
      announcementId,
      userId: req.user._id,
      userName: req.user.name,
      role: req.user.role,
      content
    });

    await newComment.save();
    res.status(201).json({ message: "Comment added", comment: newComment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/:id/comments", isAuthenticated, async (req, res) => {
  try {
    const comments = await AnnouncementComment.find({ announcementId: req.params.id })
      .sort({ createdAt: 1 });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/* =====================================================
   TRENDING MODULE
===================================================== */

router.get("/trending", isAuthenticated, async (req, res) => {
  try {
    // Basic trending: mostly relying on recent announcements and aggregating likes + comments natively.
    // For simplicity, we fetch recent announcements (status official) and compute a score.
    const announcements = await Announcement.find({ status: "official" })
      .sort({ createdAt: -1 })
      .limit(30);

    const trendingData = [];

    for (const ann of announcements) {
      const likeCount = await AnnouncementLike.countDocuments({ announcementId: ann._id });
      const commentCount = await AnnouncementComment.countDocuments({ announcementId: ann._id });
      const viewCount = 0; // if tracking views later

      // Algorithm: (Likes * 3) + (Comments * 2) + Views
      const score = (likeCount * 3) + (commentCount * 2) + viewCount;

      trendingData.push({
        ...ann.toObject(),
        likeCount,
        commentCount,
        score
      });
    }

    // Sort by score
    trendingData.sort((a, b) => b.score - a.score);

    // Return Top 5
    res.status(200).json(trendingData.slice(0, 5));
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/:id/stats", isAuthenticated, async (req, res) => {
  try {
    const likeCount = await AnnouncementLike.countDocuments({ announcementId: req.params.id });
    const isLiked = await AnnouncementLike.exists({ announcementId: req.params.id, userId: req.user._id });
    const commentCount = await AnnouncementComment.countDocuments({ announcementId: req.params.id });

    res.status(200).json({ likeCount, commentCount, isLiked: !!isLiked });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
