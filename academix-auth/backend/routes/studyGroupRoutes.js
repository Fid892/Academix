const router = require("express").Router();
const StudyGroup = require("../models/StudyGroup");
const GroupPost = require("../models/GroupPost");
const Notification = require("../models/Notification");
const GroupMembership = require("../models/GroupMembership");
const User = require("../models/User");
const { isAuthenticated } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

/* ============================
   Multer for file uploads
============================ */

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

/* ============================
   GET All Study Groups
============================ */

router.get("/", async (req, res) => {
  try {
    const groups = await StudyGroup.find()
      .populate("createdBy", "name role")
      .sort({ createdAt: -1 });

    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/* ============================
   CHECK for Duplicate Group
============================ */

router.get("/check-duplicate", async (req, res) => {
  try {
    const { universityType, scheme, department, semester, subject } = req.query;
    
    const existing = await StudyGroup.findOne({
      groupType: "Study Group",
      universityType,
      scheme,
      department,
      semester,
      subject
    });

    if (existing) {
      return res.json({ exists: true });
    }
    res.json({ exists: false });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ============================
   GET Single Study Group
============================ */

router.get("/:id", async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id)
      .populate("createdBy", "name role department")
      .populate("members", "name role");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/* ============================
   CREATE Study Group
============================ */

router.post("/", isAuthenticated, async (req, res) => {
  try {
    const { 
      groupType, 
      universityType, 
      scheme, 
      department, 
      semester, 
      subject,
      name,
      description 
    } = req.body;

    if (!groupType || !department || !name) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Duplicate check for Study Groups
    if (groupType === "Study Group") {
      const existing = await StudyGroup.findOne({
        groupType,
        universityType,
        scheme,
        department,
        semester,
        subject
      });

      if (existing) {
        return res.status(400).json({ message: "A group for this subject already exists." });
      }
    }

    const group = new StudyGroup({
      name,
      groupType,
      universityType,
      scheme,
      department,
      semester,
      subject,
      description: description || `Collaborative learning space for ${subject}`,
      createdBy: req.user._id,
      creatorRole: req.user.role,
      members: [req.user._id]
    });

    await group.save();

    res.status(201).json({ message: "Study group created", group });
  } catch (error) {
    console.error("Create group error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ============================
   GET Posts for a Group
============================ */

router.get("/:id/posts", async (req, res) => {
  try {
    const posts = await GroupPost.find({ groupId: req.params.id })
      .populate("postedBy", "name role department")
      .populate("mentionedFaculty", "name department designation")
      .populate("comments.postedBy", "name role")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/* ============================
   CREATE Post or Note in Group
============================ */

router.post(
  "/:id/posts",
  isAuthenticated,
  upload.single("file"),
  async (req, res) => {
    try {
      const { content, type, noteCategory, mentionedFaculty } = req.body;

      /* Faculty can only upload to faculty noteCategory */
      const resolvedCategory =
        req.user.role === "faculty" ? "faculty" : (noteCategory || "student");

      /* Prevent students from uploading to faculty section */
      if (req.user.role === "student" && noteCategory === "faculty") {
        return res.status(403).json({
          message: "Students cannot upload to Faculty Official Notes"
        });
      }

      /* Check if type is doubt and handle mentionedFaculty specifically */
      const post = new GroupPost({
        groupId: req.params.id,
        content: content || "",
        postedBy: req.user._id,
        type: type || "post",
        noteCategory: type === "note" ? resolvedCategory : "student",
        mentionedFaculty: (type === "doubt" && mentionedFaculty) ? mentionedFaculty : null,
        fileUrl: req.file ? req.file.filename : null,
        fileName: req.file ? req.file.originalname : null,
        comments: []
      });

      await post.save();

      // Notify mentioned faculty
      if (type === "doubt" && mentionedFaculty) {
        try {
          const group = await StudyGroup.findById(req.params.id);
          const newNotif = new Notification({
            recipient: mentionedFaculty,
            sender: req.user._id,
            type: "doubt_reply", // Reuse or add group_doubt type
            title: "You were mentioned in a Doubt",
            message: `${req.user.name} mentioned you in a doubt in group: ${group.name}`,
            link: `/study-groups/${req.params.id}`
          });
          await newNotif.save();
        } catch (err) {
          console.error("Mention notification error:", err);
        }
      }

      const populated = await GroupPost.findById(post._id)
        .populate("postedBy", "name role department");

      res.status(201).json({ message: "Posted successfully", post: populated });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
);

/* ============================
   ADD Comment to a Post
============================ */

router.post("/:id/posts/:postId/comments", isAuthenticated, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await GroupPost.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({
      text,
      postedBy: req.user._id
    });

    await post.save();

    // Notify the post author
    if (post.postedBy.toString() !== req.user._id.toString()) {
      try {
        const newNotif = new Notification({
          recipient: post.postedBy,
          sender: req.user._id,
          type: "system",
          title: "New Comment on Your Post",
          message: `${req.user.name} commented on your post`,
          link: `/study-groups/${req.params.id}`
        });
        await newNotif.save();
      } catch (err) {
        console.error("Comment notification error:", err);
      }
    }

    const updated = await GroupPost.findById(post._id)
      .populate("postedBy", "name role department")
      .populate("comments.postedBy", "name role");

    res.status(201).json({ message: "Comment added", post: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/* ============================
   DELETE Post or Note
============================ */

router.delete("/:id/posts/:postId", isAuthenticated, async (req, res) => {
  try {
    const post = await GroupPost.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Only creator can delete
    if (post.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }

    await GroupPost.findByIdAndDelete(req.params.postId);
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/* ============================
   GET Faculty List (for Mentions)
============================ */
router.get("/faculties/list", isAuthenticated, async (req, res) => {
  try {
    const User = require("../models/User");
    const faculties = await User.find({ role: "faculty" }).select("name department designation");
    res.json(faculties);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/* ============================
   JOIN Study Group
 ============================ */
router.post("/join", isAuthenticated, async (req, res) => {
  try {
    const { groupId } = req.body;
    const userId = req.user._id;

    if (!groupId) {
      return res.status(400).json({ message: "Group ID is required" });
    }

    // Check if membership exists
    const existing = await GroupMembership.findOne({ userId, groupId });
    if (existing) {
      return res.status(400).json({ message: "Already a member" });
    }

    // Insert into GroupMemberships
    const membership = new GroupMembership({ userId, groupId });
    await membership.save();

    // Update User: add to joinedGroups
    await User.findByIdAndUpdate(userId, {
      $addToSet: { joinedGroups: groupId }
    });

    // Update StudyGroup: increment membersCount and add to members array
    await StudyGroup.findByIdAndUpdate(groupId, {
      $addToSet: { members: userId },
      $inc: { membersCount: 1 }
    });

    res.status(200).json({ message: "Joined successfully" });
  } catch (error) {
    console.error("Join group error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ============================
   CHECK Membership Status
 ============================ */
router.get("/:id/is-member", isAuthenticated, async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user._id;

    const membership = await GroupMembership.findOne({ userId, groupId });
    res.json({ isMember: !!membership });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
