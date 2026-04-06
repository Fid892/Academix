const router = require("express").Router();
const FacultyMessage = require("../models/FacultyMessage");
const User = require("../models/User");
const { isAuthenticated, isAdmin, isFaculty } = require("../middleware/auth");

/* =====================================================
   ADMIN → Send Message to Department
===================================================== */
router.post("/admin/send-message", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { title, content, targetDepartmentId, targetDepartmentName, forwardToStudents } = req.body;
    
    // Feature 7: Data Integrity Validation
    if (!title || !content || !targetDepartmentId) {
      return res.status(400).json({ message: "Title, Content and Department are required" });
    }

    const newMessage = new FacultyMessage({
      title,
      content,
      sender: "admin",
      targetDepartmentId,
      targetDepartmentName,
      forwardToStudents: !!forwardToStudents,
      target: "faculty"
    });

    await newMessage.save();
    res.status(201).json({ message: "Message sent!", data: newMessage });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/* =====================================================
   FACULTY → Get Official Messages for my Department
===================================================== */
router.get("/faculty/messages", isAuthenticated, isFaculty, async (req, res) => {
  try {
    const faculty = req.user;

    // Feature 5: Debug Safety (MANDATORY)
    console.log("Faculty Department ID:", faculty.departmentId);
    console.log("Faculty Department Name:", faculty.department);

    // Feature 3: Backend Filtering Fix (Using departmentId)
    // Feature 6: Fallback logic for legacy data
    const messages = await FacultyMessage.find({
      $or: [
        { targetDepartmentId: faculty.departmentId },
        { targetDepartmentName: faculty.department } // TEMP Fallback
      ],
      target: "faculty"
    }).sort({ createdAt: -1 });

    console.log(`Fetched ${messages.length} messages for ${faculty.name}`);

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/* =====================================================
   FACULTY → Forward Message to Students
===================================================== */
router.post("/faculty/forward-message", isAuthenticated, isFaculty, async (req, res) => {
  try {
    const { originalMessageId } = req.body;
    
    const original = await FacultyMessage.findById(originalMessageId);
    if (!original) return res.status(404).json({ message: "Original message not found" });
    if (!original.forwardToStudents) return res.status(403).json({ message: "Forwarding not allowed for this message" });

    // Create a NEW forwarded message for students
    const forwardedMsg = new FacultyMessage({
      title: original.title,
      content: original.content,
      sender: "faculty",
      originalMessageId,
      forwardedBy: req.user._id,
      targetDepartmentId: req.user.departmentId,
      targetDepartmentName: req.user.department,
      target: "students"
    });

    await forwardedMsg.save();

    // FEATURE 2: Update original message status to disable button on frontend
    original.isSharedWithStudents = true;
    await original.save();

    res.status(201).json({ message: "Message forwarded to students!", data: forwardedMsg });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/* =====================================================
   STUDENT → Get Messages for my Department
===================================================== */
router.get("/student/messages", isAuthenticated, async (req, res) => {
  try {
    // Feature 1: Filter by student departmentId with fallback
    const messages = await FacultyMessage.find({
      $or: [
        { targetDepartmentId: req.user.departmentId },
        { targetDepartmentName: req.user.department }
      ],
      target: "students"
    })
    .populate("forwardedBy", "name")
    .sort({ createdAt: -1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
