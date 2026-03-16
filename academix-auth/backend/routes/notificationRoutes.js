const router = require("express").Router();
const Notification = require("../models/Notification");
const { isAuthenticated } = require("../middleware/auth");

// GET all notifications for the current user
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// GET unread count
router.get("/unread-count", isAuthenticated, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// POST mark as read
router.post("/mark-as-read", isAuthenticated, async (req, res) => {
  try {
    const { notificationId } = req.body;
    if (notificationId) {
      await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    } else {
      await Notification.updateMany({ recipient: req.user._id }, { isRead: true });
    }
    res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
