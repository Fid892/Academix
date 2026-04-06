const Page = require("../models/Page");
const PagePost = require("../models/PagePost");
const PageFollower = require("../models/PageFollower");
const User = require("../models/User");

// Create Page
exports.createPage = async (req, res) => {
  try {
    const { pageName, username, bio, category } = req.body;
    const profileImage = req.file ? req.file.filename : null;
    
    // Check if username unique
    const existingPage = await Page.findOne({ username: username.toLowerCase() });
    if (existingPage) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const newPage = new Page({
      pageName,
      username: username.toLowerCase(),
      bio,
      profileImage,
      category,
      ownerId: req.user._id,
    });

    await newPage.save();
    res.status(201).json(newPage);
  } catch (error) {
    console.error("Create Page Error:", error);
    res.status(500).json({ message: "Error creating page", error });
  }
};

// Search Pages
exports.searchPages = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.json([]);

    const pages = await Page.find({
      $or: [
        { pageName: { $regex: query, $options: "i" } },
        { username: { $regex: query, $options: "i" } },
      ],
    }).limit(10);

    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: "Search error", error });
  }
};

// Get Page by Username
exports.getPageByUsername = async (req, res) => {
  try {
    const page = await Page.findOne({ username: req.params.username }).populate("ownerId", "name email profileImage");
    if (!page) return res.status(404).json({ message: "Page not found" });

    // Check if current user is follows
    const isFollowing = await PageFollower.exists({ userId: req.user._id, pageId: page._id });

    res.json({ ...page._doc, isFollowing: !!isFollowing });
  } catch (error) {
    res.status(500).json({ message: "Error fetching page", error });
  }
};

// Get Page by ID
exports.getPageById = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id).populate("ownerId", "name email profileImage");
    if (!page) return res.status(404).json({ message: "Page not found" });

    // Check if current user is follows
    const isFollowing = await PageFollower.exists({ userId: req.user._id, pageId: page._id });

    res.json({ ...page._doc, isFollowing: !!isFollowing });
  } catch (error) {
    res.status(500).json({ message: "Error fetching page", error });
  }
};

// Follow Page
exports.followPage = async (req, res) => {
  try {
    const { pageId } = req.body;
    const userId = req.user._id;

    const existingFollow = await PageFollower.findOne({ userId, pageId });
    if (existingFollow) return res.status(400).json({ message: "Already following" });

    const follow = new PageFollower({ userId, pageId });
    await follow.save();

    await Page.findByIdAndUpdate(pageId, { $inc: { followersCount: 1 } });

    res.json({ message: "Followed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Follow error", error });
  }
};

// Unfollow Page
exports.unfollowPage = async (req, res) => {
  try {
    const { pageId } = req.body;
    const userId = req.user._id;

    const deletedFollow = await PageFollower.findOneAndDelete({ userId, pageId });
    if (!deletedFollow) return res.status(400).json({ message: "Not following" });

    await Page.findByIdAndUpdate(pageId, { $inc: { followersCount: -1 } });

    res.json({ message: "Unfollowed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Unfollow error", error });
  }
};

// Create Page Post
exports.createPagePost = async (req, res) => {
  try {
    const { pageId, imageUrl, caption, tags } = req.body;

    // Check if requester is owner
    const page = await Page.findById(pageId);
    if (!page) return res.status(404).json({ message: "Page not found" });

    if (page.ownerId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized to post on this page" });
    }

    const post = new PagePost({
      pageId,
      imageUrl,
      caption,
      tags,
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: "Post creation error", error });
  }
};

// Get Page Posts
exports.getPagePosts = async (req, res) => {
  try {
    const { pageId } = req.params;
    const posts = await PagePost.find({ pageId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts", error });
  }
};

// Get User's Pages (pages they own)
exports.getMyPages = async (req, res) => {
  try {
    const pages = await Page.find({ ownerId: req.user._id });
    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching your pages", error });
  }
};
