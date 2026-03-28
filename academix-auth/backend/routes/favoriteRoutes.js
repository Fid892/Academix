const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favoriteController");
const { isAuthenticated } = require("../middleware/auth");

router.post("/add", isAuthenticated, favoriteController.addFavorite);
router.get("/", isAuthenticated, favoriteController.getFavorites);
router.delete("/remove/:id", isAuthenticated, favoriteController.removeFavorite);

module.exports = router;
