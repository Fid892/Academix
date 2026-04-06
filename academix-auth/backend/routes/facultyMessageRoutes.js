const router = require("express").Router();
const FacultyMessage = require("../models/FacultyMessage");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

/* =====================================================
   GET Faculty Messages
===================================================== */
router.get("/", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const messages = await FacultyMessage.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/* =====================================================
   POST Faculty Message (New Message)
===================================================== */
router.post("/", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { title, content, sender } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: "Title and Content are required" });
    }

    const newMessage = new FacultyMessage({
      title,
      content,
      sender: sender || "Admin",
      targetRole: "faculty"
    });

    await newMessage.save();

    res.status(201).json({ message: "Message sent to faculty!", messageData: newMessage });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/* =====================================================
   DELETE Faculty Message
===================================================== */
router.delete("/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const deleted = await FacultyMessage.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Message not found" });
    }
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
