const express = require("express");
const router = express.Router();
const Conversation = require("../models/Conversation");
const User = require("../models/User");

// New Conversation
router.post("/create", async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    
    // Check if conversation exists
    const existingConversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    if (existingConversation) {
      return res.status(200).json(existingConversation);
    }

    // ENFORCE MUTUAL FOLLOW REQUIREMENT
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    const senderFollowsReceiver = sender.following.includes(receiverId);
    const receiverFollowsSender = receiver.following.includes(senderId);

    if (!senderFollowsReceiver || !receiverFollowsSender) {
      return res.status(403).json({ message: "Mutually following each other is required to start a conversation" });
    }

    const newConversation = new Conversation({
      participants: [senderId, receiverId],
    });

    const savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get conversations of a user
router.get("/:userId", async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: { $in: [req.params.userId] },
    }).populate("participants", "_id name profileImage department");
    res.status(200).json(conversations);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Find conversation includes two userId
router.get("/find/:firstUserId/:secondUserId", async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      participants: { $all: [req.params.firstUserId, req.params.secondUserId] },
    });
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
