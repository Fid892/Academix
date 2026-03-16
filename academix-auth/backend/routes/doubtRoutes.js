const router = require("express").Router();
const Doubt = require("../models/Doubt");
const DoubtReply = require("../models/DoubtReply");
const { isAuthenticated } = require("../middleware/auth");

/* ============================
   GET All Doubts
============================ */

router.get("/", isAuthenticated, async (req, res) => {
  try {
    const doubts = await Doubt.find()
      .populate("postedBy", "name role department")
      .sort({ createdAt: -1 });

    res.status(200).json(doubts);
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

    res.status(200).json({ doubt, replies });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/* ============================
   POST Create Doubt (Students Only)
============================ */

router.post("/", isAuthenticated, async (req, res) => {
  try {
    if (req.user.role === "faculty") {
      return res.status(403).json({
        message: "Faculty cannot post doubts. They can only reply to them."
      });
    }

    const { title, description, subject } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const doubt = new Doubt({
      title,
      description,
      subject,
      postedBy: req.user._id,
      status: "open"
    });

    await doubt.save();

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
