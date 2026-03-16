const router = require("express").Router();
const AllowedUser = require("../models/AllowedUser");
const User = require("../models/User");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

// ==========================================
// ADMIN → Get All Allowed Users
// ==========================================
router.get("/users", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const users = await AllowedUser.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ==========================================
// ADMIN → Add New User to Allowed List
// ==========================================
router.post("/add-user", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { name, email, role, department, semester, designation } = req.body;

    if (!email || !role || !name) {
      return res.status(400).json({ message: "Name, Email and Role are required" });
    }

    const trimmedEmail = email.toLowerCase().trim();

    // Check if already allowed
    const existing = await AllowedUser.findOne({ email: trimmedEmail });
    if (existing) {
      return res.status(400).json({ message: "User already exists in allowed list" });
    }

    const newUser = new AllowedUser({
      name,
      email: trimmedEmail,
      role,
      department,
      semester,
      designation,
      createdByAdmin: req.user._id
    });

    await newUser.save();

    res.status(201).json({ message: "User added successfully", user: newUser });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ==========================================
// ADMIN → Edit User
// ==========================================
router.put("/user/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { name, role, department, semester, designation } = req.body;

    const updated = await AllowedUser.findByIdAndUpdate(
      req.params.id,
      { name, role, department, semester, designation },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    // Also update the actual User collection if they already logged in once
    await User.findOneAndUpdate(
      { email: updated.email },
      { name, role, department, semester, designation }
    );

    res.status(200).json({ message: "User updated successfully", user: updated });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ==========================================
// ADMIN → Delete User
// ==========================================
router.delete("/user/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const allowedUser = await AllowedUser.findById(req.params.id);
    if (!allowedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove from allowed list
    await AllowedUser.findByIdAndDelete(req.params.id);

    // Optionally remove from actual Users collection to force re-auth or similar
    // For now just keep them, they won't be able to log in again after logout anyway
    // as passport checks AllowedUser

    res.status(200).json({ message: "User removed from allowed list" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
