const router = require("express").Router();
const Doubt = require("../models/Doubt");
const DoubtReply = require("../models/DoubtReply");
const Notification = require("../models/Notification");
const { isAuthenticated } = require("../middleware/auth");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

/* ============================
   GET Doubts by User ID (Private to owner)
============================ */
router.get("/user/:userId", isAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;

    // Security: only owner can see their own private list
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized. Private section." });
    }

    const doubts = await Doubt.find({ postedBy: userId })
      .populate("postedBy", "name role department")
      .sort({ createdAt: -1 });

    // Fetch reply counts for each doubt
    const processedDoubtPromises = doubts.map(async (d) => {
      const replyCount = await DoubtReply.countDocuments({ doubtId: d._id });
      return { ...d.toObject(), replyCount };
    });

    const processedDoubts = await Promise.all(processedDoubtPromises);

    res.status(200).json(processedDoubts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/* ============================
   GET All Doubts
============================ */
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const doubts = await Doubt.find()
      .populate("postedBy", "name role department")
      .sort({ createdAt: -1 });

    const processed = doubts.map(d => {
        const obj = d.toObject();
        if (obj.isAnonymous && (!req.user || (obj.postedBy?._id?.toString() !== req.user._id?.toString() && req.user.role !== 'faculty'))) {
            if (obj.postedBy) obj.postedBy.name = "Anonymous Student";
        }
        return obj;
    });

    res.status(200).json(processed);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/* ============================
   GET Single Doubt + Replies
============================ */

router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id)
      .populate("postedBy", "name role department");

    if (!doubt) {
      return res.status(404).json({ message: "Doubt not found" });
    }

    const replies = await DoubtReply.find({ doubtId: req.params.id })
      .populate("postedBy", "name role department")
      .sort({ createdAt: 1 });

    const obj = doubt.toObject();
    if (obj.isAnonymous && (!req.user || (obj.postedBy?._id?.toString() !== req.user._id?.toString() && req.user.role !== 'faculty'))) {
        if (obj.postedBy) obj.postedBy.name = "Anonymous Student";
    }

    res.status(200).json({ doubt: obj, replies });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/* ============================
   POST Create Doubt (Students Only)
============================ */

router.post("/", isAuthenticated, upload.single("file"), async (req, res) => {
  try {
    if (req.user.role === "faculty") {
      return res.status(403).json({
        message: "Faculty cannot post doubts. They can only reply to them."
      });
    }

    const { title, description, subject, isAnonymous, mentionedFaculty } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const doubt = new Doubt({
      title,
      description,
      subject,
      postedBy: req.user._id,
      status: "open",
      isAnonymous: isAnonymous === "true" || isAnonymous === true || false,
      mentionedFaculty: mentionedFaculty || null,
      fileUrl: req.file ? req.file.filename : null,
      fileName: req.file ? req.file.originalname : null
    });

    await doubt.save();

    // Notify mentioned faculty
    if (mentionedFaculty) {
      try {
        const newNotif = new Notification({
          recipient: mentionedFaculty,
          sender: req.user._id,
          type: "doubt_reply", // Reuse or add mention type
          title: "New Mention in Academic Doubt",
          message: `${req.user.name} requested your expertise on: "${title.substring(0, 30)}..."`,
          link: `/doubts/${doubt._id}`
        });
        await newNotif.save();
      } catch (err) {
        console.error("Mention notification error:", err);
      }
    }

    const populated = await Doubt.findById(doubt._id)
      .populate("postedBy", "name role department");

    res.status(201).json({ message: "Doubt posted successfully", doubt: populated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/* ============================
   POST Reply to Doubt
   Faculty replies → isVerified: true, doubt → resolved
============================ */

router.post("/:id/reply", isAuthenticated, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Reply content is required" });
    }

    const doubt = await Doubt.findById(req.params.id);

    if (!doubt) {
      return res.status(404).json({ message: "Doubt not found" });
    }

    const isFaculty = req.user.role === "faculty";

    const reply = new DoubtReply({
      doubtId: req.params.id,
      content,
      postedBy: req.user._id,
      isVerified: isFaculty
    });

    await reply.save();

    // Notify the doubt poster
    if (doubt.postedBy.toString() !== req.user._id.toString()) {
      try {
        const newNotif = new Notification({
          recipient: doubt.postedBy,
          sender: req.user._id,
          type: "doubt_reply",
          title: "New Reply to Your Doubt",
          message: `${req.user.name} replied to: "${doubt.title.substring(0, 20)}..."`,
          link: `/doubts/${doubt._id}`
        });
        await newNotif.save();
      } catch (err) {
        console.error("Notification error:", err);
      }
    }

    /* When faculty replies → mark doubt as resolved */
    if (isFaculty) {
      await Doubt.findByIdAndUpdate(req.params.id, { status: "resolved" });
    }

    const populated = await DoubtReply.findById(reply._id)
      .populate("postedBy", "name role department");

    res.status(201).json({
      message: isFaculty ? "Verified reply posted" : "Reply posted",
      reply: populated
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
