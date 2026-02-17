const router = require("express").Router();
const passport = require("passport");
const AllowedUser = require("../models/AllowedUser");

// ============================
// Check if email is allowed
// ============================
router.post("/check-email", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await AllowedUser.findOne({ email });

    if (!user) {
      return res.status(403).json({
        allowed: false,
        message: "Access denied. Email not authorized."
      });
    }

    return res.status(200).json({
      allowed: true,
      role: user.role
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// ============================
// Google Login
// ============================
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/// ============================
// Google Callback
// ============================
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/login"
  }),
  (req, res) => {

    if (!req.user) {
      return res.redirect("http://localhost:3000/login");
    }

    // 🔥 ROLE BASED REDIRECT
    if (req.user.role === "admin") {
      return res.redirect("http://localhost:3000/admin");
    }

    if (req.user.role === "faculty") {
      return res.redirect("http://localhost:3000/dashboard");
    }

    // Default = student
    return res.redirect("http://localhost:3000/dashboard");
  }
);


// ============================
// Get Current Logged In User
// ============================
router.get("/current-user", (req, res) => {

  if (!req.user) {
    return res.status(401).json({ message: "Not logged in" });
  }

  return res.status(200).json({
    name: req.user.name,
    email: req.user.email,
    role: req.user.role
  });
});

// ============================
// Logout
// ============================
router.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }

    req.session.destroy(() => {
      res.redirect("http://localhost:3000/login");
    });
  });
});

module.exports = router;
