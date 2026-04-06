const router = require("express").Router();
const AdminBadge = require("../models/AdminBadge");
const User = require("../models/User");

// POST /api/admin-badges
router.post("/", async (req, res) => {
  try {
    const { email, name, role, badgeName } = req.body;
    
    // Validate badge doesn't already exist for another user
    const existingBadge = await AdminBadge.findOne({ badgeName });
    if (existingBadge && existingBadge.email !== email) {
      return res.status(400).json({ message: "Badge name already exists" });
    }

    // One user one badge for now, so let's update or create
    let badge = await AdminBadge.findOne({ email });
    if (badge) {
      badge.badgeName = badgeName;
      badge.name = name;
      badge.role = role;
      await badge.save();
    } else {
      badge = new AdminBadge({
        email,
        name,
        role,
        badgeName
      });
      await badge.save();
    }

    res.status(200).json(badge);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET /api/admin-badges
router.get("/", async (req, res) => {
  try {
    const badges = await AdminBadge.find();
    res.status(200).json(badges);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// DELETE /api/admin-badges/:email
router.delete("/:email", async (req, res) => {
  try {
    await AdminBadge.findOneAndDelete({ email: req.params.email });
    res.status(200).json({ message: "Badge removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
