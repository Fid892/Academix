const router = require("express").Router();
const User = require("../models/User");
const Doubt = require("../models/Doubt");
const DoubtReply = require("../models/DoubtReply");
const StudyGroup = require("../models/StudyGroup");
const Announcement = require("../models/Announcement");
const GroupPost = require("../models/GroupPost");
const { isAuthenticated } = require("../middleware/auth");
const multer = require("multer");

/* ==========================
   Multer Config for Profile Images
========================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, "profile-" + Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

/* =====================================================
   GET Profile Data
===================================================== */
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/* =====================================================
   UPDATE Profile Data
===================================================== */
router.put("/update", isAuthenticated, upload.single("profileImage"), async (req, res) => {
  try {
    const { name, bio, university, scheme, registerNumber, interests, department, semester, designation } = req.body;
    
    let updateFields = {
      name,
      bio,
      department,
      semester,
      designation,
      university,
      scheme,
      registerNumber,
      interests: Array.isArray(interests) ? interests : (interests ? interests.split(",").map(i => i.trim()).filter(i => i !== "") : [])
    };

    if (req.file) {
      updateFields.profileImage = req.file.filename;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true }
    );

    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/* =====================================================
   UPDATE Settings
===================================================== */
router.put("/settings/update", isAuthenticated, async (req, res) => {
  try {
    const { settings } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { settings } },
      { new: true }
    );
    res.status(200).json({ message: "Settings updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/* =====================================================
   GET Activity Summary Counts
===================================================== */
router.get("/activity-summary", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const isFaculty = req.user.role === "faculty";

    const doubtsPosted = await Doubt.countDocuments({ postedBy: userId });
    
    let doubtsSolved;
    if (isFaculty) {
      // For faculty, "Solved" means doubts they replied to (which marks them resolved)
      const repliedDoubtIds = await DoubtReply.distinct("doubtId", { postedBy: userId });
      doubtsSolved = repliedDoubtIds.length;
    } else {
      // For students, "Solved" means their doubts that were resolved
      doubtsSolved = await Doubt.countDocuments({ postedBy: userId, status: "resolved" });
    }

    const groupsJoined = await StudyGroup.countDocuments({ members: userId });
    const announcementsPosted = await Announcement.countDocuments({ postedBy: userId });
    const postsCreated = await GroupPost.countDocuments({ postedBy: userId });

    res.status(200).json({
      doubtsPosted,
      doubtsSolved,
      groupsJoined,
      announcementsPosted,
      postsCreated
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/* =====================================================
   GET User's Study Groups
===================================================== */
router.get("/groups", isAuthenticated, async (req, res) => {
  try {
    const groups = await StudyGroup.find({ members: req.user._id })
      .populate("createdBy", "name");
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/* =====================================================
   GET User's Doubts
===================================================== */
router.get("/doubts", isAuthenticated, async (req, res) => {
  try {
    const doubtsAsked = await Doubt.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    
    // Doubts where user has replied
    const repliedDoubtIds = await DoubtReply.distinct("doubtId", { postedBy: req.user._id });
    const doubtsAnswered = await Doubt.find({ _id: { $in: repliedDoubtIds } }).sort({ createdAt: -1 });

    res.status(200).json({ doubtsAsked, doubtsAnswered });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/* =====================================================
   GET User's Announcements (Posts)
===================================================== */
router.get("/posts", isAuthenticated, async (req, res) => {
  try {
    const announcements = await Announcement.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(announcements);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/* =====================================================
   GET Recent Activity Timeline
===================================================== */
router.get("/timeline", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const doubts = await Doubt.find({ postedBy: userId }).limit(5).sort({ createdAt: -1 });
    const replies = await DoubtReply.find({ postedBy: userId }).populate("doubtId", "title").limit(5).sort({ createdAt: -1 });
    const groups = await StudyGroup.find({ members: userId }).limit(5).sort({ createdAt: -1 });
    const announcements = await Announcement.find({ postedBy: userId }).limit(5).sort({ createdAt: -1 });
    const groupPosts = await GroupPost.find({ postedBy: userId }).populate("groupId", "name").limit(5).sort({ createdAt: -1 });

    let timeline = [
      ...doubts.map(d => ({ type: "doubt", title: d.title, date: d.createdAt, text: `Posted doubt: ${d.title}` })),
      ...replies.filter(r => r.doubtId).map(r => ({ type: "reply", title: r.doubtId.title, date: r.createdAt, text: `Replied to doubt: ${r.doubtId.title}` })),
      ...groups.map(g => ({ type: "group", title: g.name, date: g.createdAt, text: `Joined group: ${g.name}` })),
      ...announcements.map(a => ({ type: "announcement", title: a.title, date: a.createdAt, text: `Posted announcement: ${a.title}` })),
      ...groupPosts.filter(p => p.groupId).map(p => ({ type: "groupPost", title: p.groupId.name, date: p.createdAt, text: `Posted in ${p.groupId.name}: ${p.content?.substring(0, 30)}...` }))
    ];

    timeline.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.status(200).json(timeline.slice(0, 10));

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/* =====================================================
   GET Specific User's Joined Groups
 ===================================================== */
router.get("/user/:userId/groups", isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch groups using the joinedGroups array
    const groups = await StudyGroup.find({ _id: { $in: user.joinedGroups } })
      .populate("createdBy", "name department");

    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
