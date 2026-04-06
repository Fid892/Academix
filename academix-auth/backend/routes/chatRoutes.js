const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const { isAuthenticated } = require("../middleware/auth");

router.get("/conversation/:userId", isAuthenticated, chatController.checkConversation);
router.post("/conversation", isAuthenticated, chatController.createConversation);

module.exports = router;
