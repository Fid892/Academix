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
const announcementUpload = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "pdf", maxCount: 1 }
]);

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
        expiryDate,
        registrationRequired
      } = req.body;

      // Smart Expiry Logic
      let finalExpiryDate = expiryDate;
      if (!finalExpiryDate) {
        if (endDate) {
          finalExpiryDate = new Date(endDate);
        } else {
          finalExpiryDate = new Date();
          finalExpiryDate.setDate(finalExpiryDate.getDate() + 7);
        }
      }

      const newAnnouncement = new Announcement({
        title,
        description,
        venue,
        eventType,
        startDate,
        endDate,
        expiryDate: finalExpiryDate,
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
  announcementUpload,
  async (req, res) => {
    try {
      const {
        title,
        description,
        venue,
        eventType,
        startDate,
        endDate,
        expiryDate,
        registrationRequired
      } = req.body;

      // Smart Expiry Logic
      let finalExpiryDate = expiryDate;
      if (!finalExpiryDate) {
        if (endDate) {
          finalExpiryDate = new Date(endDate);
        } else {
          finalExpiryDate = new Date();
          finalExpiryDate.setDate(finalExpiryDate.getDate() + 7);
        }
      }

      // Extract file paths from req.files
      const imagePath = req.files && req.files.image ? req.files.image[0].filename : null;
      const pdfPath = req.files && req.files.pdf ? req.files.pdf[0].filename : null;

      const newAnnouncement = new Announcement({
        title,
        description,
        venue,
        eventType,
        startDate,
        endDate,
        expiryDate: finalExpiryDate,
        registrationRequired,
        image: imagePath,
        pdf: pdfPath,
        status: "official",
        target: "student",
        postedByRole: "faculty",
        postedBy: req.user._id,
        targetDepartment: req.user.department
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
        expiryDate,
        registrationRequired,
        target
      } = req.body;

      // Smart Expiry Logic
      let finalExpiryDate = expiryDate;
      if (!finalExpiryDate) {
        if (endDate) {
          finalExpiryDate = new Date(endDate);
        } else {
          finalExpiryDate = new Date();
          finalExpiryDate.setDate(finalExpiryDate.getDate() + 7);
        }
      }

      const newAnnouncement = new Announcement({
        title,
        description,
        venue,
        eventType,
        startDate,
        endDate,
        expiryDate: finalExpiryDate,
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
   GET Admin Announcements (For Dashboard)
   Logic: postedByRole === "admin" || "mainAdmin"
===================================================== */
router.get("/admin", isAuthenticated, async (req, res) => {
  try {
    const announcements = await Announcement.find({
      status: "official",
      postedByRole: { $in: ["admin", "mainAdmin"] },
      isExpired: false,
      "visibility.showInFeed": true
    })
      .populate("postedBy", "name role department profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/* =====================================================
   GET Faculty Announcements (For Faculty Feed Page)
   Logic: postedByRole === "faculty"
===================================================== */
router.get("/faculty", isAuthenticated, async (req, res) => {
  try {
    const announcements = await Announcement.find({
      status: "official",
      postedByRole: "faculty",
      isExpired: false,
      "visibility.showInFeed": true
    })
      .populate("postedBy", "name role department profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/* =====================================================
   GET Student Announcements (For Student Feed Page)
   Logic: postedByRole === "student"
===================================================== */
router.get("/student", isAuthenticated, async (req, res) => {
  try {
    const announcements = await Announcement.find({
      status: "official",
      postedByRole: "student",
      isExpired: false,
      "visibility.showInFeed": true
    })
      .populate("postedBy", "name role department profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/* =====================================================
   GET Official Announcements
   ?type=admin   → admin-posted, target=student
   ?type=student → student-approved posts
   ?type=faculty → admin-posted, target=faculty (for Faculty Dashboard)
   ?type=facultyPosts → faculty-posted, target=student (for Student Dashboard)
   ?type=all → all official announcements
===================================================== */

router.get("/official", isAuthenticated, async (req, res) => {
  try {
    const { type } = req.query;

    let filter = {
      status: "official",
      isExpired: false,
      "visibility.showInFeed": true
    };

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
      // Feature 3: Filter by student department for faculty posts
      if (req.user && req.user.role === "student") {
        filter.$or = [
          { targetDepartment: req.user.department },
          { targetDepartment: { $exists: false } } // Compatibility for old ones
        ];
      }
    } else if (type === "all") {
      // Feature Fix: All official announcements for the main feed (from admin and faculty)
      filter.status = "official";
      filter.postedByRole = { $in: ["admin", "mainAdmin", "faculty"] };
      filter.target = { $in: ["student", "all"] };
    } else {
      // Feature Fix: Default students feed now includes faculty broadcasts
      filter.status = "official";
      filter.postedByRole = { $in: ["admin", "mainAdmin", "faculty"] };
      filter.target = { $in: ["student", "all"] };
    }

    const announcements = await Announcement.find(filter)
      .populate("postedBy", "name role department profileImage")
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
      .populate("postedBy", "name role department profileImage")
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
   ADMIN → Get Expired Announcements
===================================================== */
router.get(
  "/expired",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      const expiredAnnouncements = await Announcement.find({
        status: "official",
        isExpired: true
      })
        .populate("postedBy", "name email role")
        .sort({ createdAt: -1 });

      res.status(200).json(expiredAnnouncements);

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
    const announcements = await Announcement.find({
      status: "official",
      isExpired: false,
      "visibility.showInFeed": true
    })
      .sort({ createdAt: -1 })
      .limit(30);

    const trendingData = [];

    for (const ann of announcements) {
      const likeCount = await AnnouncementLike.countDocuments({ announcementId: ann._id });
      const commentCount = await AnnouncementComment.countDocuments({ announcementId: ann._id });
      const viewCount = 0; // if tracking views later

      // Algorithm: (Likes * 3) + (Comments * 2) + Views
      const score = (likeCount * 3) + (commentCount * 2) + viewCount;

      if (score > 0) {
        trendingData.push({
          ...ann.toObject(),
          likeCount,
          commentCount,
          score
        });
      }
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

/* =====================================================
   GET Single Announcement by ID
===================================================== */
router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate("postedBy", "name role department profileImage");
    
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    res.status(200).json(announcement);
  } catch (error) {
    res.status(500).json({ message: "Invalid ID or Server error", error });
  }
});

/* =====================================================
   SEARCH ENDPOINT
===================================================== */
router.get("/search", isAuthenticated, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(200).json([]);

    const query = {
      status: "official",
      isExpired: false,
      "visibility.showInFeed": true,
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { venue: { $regex: q, $options: "i" } }
      ]
    };

    const results = await Announcement.find(query)
      .populate("postedBy", "name role department profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/* =====================================================
   ADMIN → Restore Expired Announcement
===================================================== */
router.patch("/:id/restore", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const updated = await Announcement.findByIdAndUpdate(
      req.params.id,
      { 
        isExpired: false, 
        "visibility.showInFeed": true 
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    res.status(200).json({ message: "Announcement restored to feed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
