const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// Add Message
router.post("/send", async (req, res) => {
  try {
    const newMessage = new Message(req.body);
    let savedMessage = await newMessage.save();

    if (req.body.messageType === "announcement") {
       savedMessage = await savedMessage.populate("announcementId");
    }

    // Update last message in conversation
    await Conversation.findByIdAndUpdate(
      req.body.conversationId,
      {
        lastMessage: req.body.text,
        updatedAt: new Date()
      }
    );

    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get Messages
router.get("/:conversationId", async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    }).populate("announcementId");
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Mark as put
router.put("/seen/:messageId", async (req, res) => {
  try {
    const updatedMessage = await Message.findByIdAndUpdate(
        req.params.messageId,
        { isSeen: true },
        { new: true }
    );
    res.status(200).json(updatedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Mark conversation as seen
router.put("/seen-conversation/:conversationId", async (req, res) => {
  try {
    const updatedMessages = await Message.updateMany(
      { conversationId: req.params.conversationId, senderId: { $ne: req.body.userId }, status: { $ne: "seen" } },
      { $set: { status: "seen", isSeen: true } }
    );
    res.status(200).json(updatedMessages);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Mark messages as delivered
router.put("/delivered/:messageId", async (req, res) => {
  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      req.params.messageId,
      { status: "delivered" },
      { new: true }
    );
    res.status(200).json(updatedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Upload File
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    res.json({
      fileUrl: req.file.filename,
      fileName: req.file.originalname,
      size: req.file.size
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Edit Message
router.put("/edit/:messageId", async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    message.text = req.body.text;
    message.edited = true;
    await message.save();
    res.json(message);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete for me
router.put("/delete-for-me/:messageId", async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    message.deletedFor.push(req.body.userId);
    await message.save();
    res.json(message);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Unsend (Delete for everyone)
router.put("/unsend/:messageId", async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    message.text = "This message was deleted";
    message.isDeleted = true;
    await message.save();
    res.json(message);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
