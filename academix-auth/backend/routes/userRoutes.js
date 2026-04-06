const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Announcement = require("../models/Announcement");
const { isAuthenticated } = require("../middleware/auth");

// GET Search Users
router.get("/search", isAuthenticated, async (req, res) => {
  try {
    const searchTerm = req.query.q;
    if (!searchTerm) return res.status(200).json([]);

    const regex = new RegExp(searchTerm, "i");
    const users = await User.find({
      $or: [{ name: regex }, { email: regex }]
    })
    .select("_id name email role department profileImage followers following")
    .limit(10);

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// GET Specific User Profile
router.get("/:userId", isAuthenticated, async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const postsCount = await Announcement.countDocuments({ postedBy: userId });

    res.json({
      _id: user._id,
      name: user.name,
      department: user.department,
      bio: user.bio,
      followersCount: user.followers ? user.followers.length : 0,
      followingCount: user.following ? user.following.length : 0,
      postsCount: postsCount,
      profileImage: user.profileImage,
      role: user.role
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// GET User Posts (Only Announcements)
router.get("/:userId/posts", isAuthenticated, async (req, res) => {
  try {
    const userId = req.params.userId;
    const announcements = await Announcement.find({ postedBy: userId }).sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// UPDATE User Profile (With validation)
router.put("/update-profile", isAuthenticated, async (req, res) => {
  try {
    const { department, bio } = req.body;
    const userId = req.user._id;

    // Check if department is valid
    if (department) {
       const Department = require("../models/Department");
       const deptExists = await Department.findOne({ name: department });
       if (!deptExists) {
         return res.status(400).json({ message: "Invalid department selected." });
       }
    }

    const updateFields = {};
    if (department) updateFields.department = department;
    if (bio !== undefined) updateFields.bio = bio;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    );

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

module.exports = router;
