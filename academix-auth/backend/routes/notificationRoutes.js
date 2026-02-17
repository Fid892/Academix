const router = require("express").Router();
const Notification = require("../models/Notification");
const { isAuthenticated } = require("../middleware/auth");

router.get("/", isAuthenticated, async (req, res) => {
  const notifications = await Notification.find({
    userId: req.user._id
  }).sort({ createdAt: -1 });

  res.json(notifications);
});

module.exports = router;
