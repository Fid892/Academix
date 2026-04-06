const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Authentication Middleware (Check if authenticated)
const ensureAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Follow User
router.post("/:userId", ensureAuth, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add target to following
    if (!currentUser.following.some(id => id.toString() === targetUserId)) {
      currentUser.following.push(targetUserId);
      await currentUser.save();
    }

    // Add current to target's followers
    if (!targetUser.followers.some(id => id.toString() === currentUserId.toString())) {
      targetUser.followers.push(currentUserId);
      await targetUser.save();
    }

    res.json({ message: "Successfully followed user", isFollowing: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Unfollow User
router.post("/unfollow/:userId", ensureAuth, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user._id;

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove from following
    currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
    await currentUser.save();

    // Remove from target's followers
    targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId.toString());
    await targetUser.save();

    res.json({ message: "Successfully unfollowed user", isFollowing: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get Follow Status
router.get("/status/:userId", ensureAuth, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId);
    const isFollowing = currentUser.following.some(id => id.toString() === targetUserId);
    const isFollower = currentUser.followers.some(id => id.toString() === targetUserId);

    res.json({ isFollowing, isFollower });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Check Mutual Follow
router.get("/check-mutual/:userId", ensureAuth, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.userId;

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
       return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = currentUser.following.some(id => id.toString() === targetUserId);
    const isFollower = currentUser.followers.some(id => id.toString() === targetUserId);

    const canMessage = isFollowing && isFollower;

    res.json({ canMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
