const express = require("express");
const router = express.Router();
const pageController = require("../controllers/pageController");
const { isAuthenticated } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

// Multer Setup
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// /api/pages/...

// Create a page
router.post("/create", isAuthenticated, upload.single("profileImage"), pageController.createPage);

// Search pages
router.get("/search", isAuthenticated, pageController.searchPages);

// Get my pages (pages I own)
router.get("/my", isAuthenticated, pageController.getMyPages);

// Follow/Unfollow a page
router.post("/follow", isAuthenticated, pageController.followPage);
router.post("/unfollow", isAuthenticated, pageController.unfollowPage);

// Get page details by ID or username
router.get("/id/:id", isAuthenticated, pageController.getPageById);
router.get("/:username", isAuthenticated, pageController.getPageByUsername);

// Create a post for a page
router.post("/post/create", isAuthenticated, pageController.createPagePost);

// Get all posts for a page
router.get("/:pageId/posts", isAuthenticated, pageController.getPagePosts);

module.exports = router;
