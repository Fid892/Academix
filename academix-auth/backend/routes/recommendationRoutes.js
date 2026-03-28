const express = require("express");
const router = express.Router();
const recommendationController = require("../controllers/recommendationController");

// Recommendations API
router.get("/interests", recommendationController.getInterestsRecommendations);
router.get("/department", recommendationController.getDepartmentRecommendations);
router.get("/trending", recommendationController.getTrendingRecommendations);

module.exports = router;
