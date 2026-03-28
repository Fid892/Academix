const Favorite = require("../models/Favorite");

exports.addFavorite = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { title, link, platform, icon } = req.body;

    // Check for duplicates
    const existing = await Favorite.findOne({ userId, link });
    if (existing) {
      return res.status(400).json({ error: "Already saved to favorites" });
    }

    const newFavorite = new Favorite({
      userId,
      title,
      link,
      platform,
      icon
    });

    await newFavorite.save();
    res.status(201).json(newFavorite);
  } catch (error) {
    console.error("Error adding favorite:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    if (!userId) {
       // if not logged in just return empty array for now
      return res.status(200).json([]);
    }

    const favorites = await Favorite.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(favorites);
  } catch (error) {
    console.error("Error getting favorites:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const favoriteId = req.params.id;
    const deleted = await Favorite.findOneAndDelete({ _id: favoriteId, userId });

    if (!deleted) {
      return res.status(404).json({ error: "Favorite not found or not owned by user" });
    }

    res.status(200).json({ message: "Removed successfully", id: favoriteId });
  } catch (error) {
    console.error("Error removing favorite:", error);
    res.status(500).json({ error: "Server Error" });
  }
};
