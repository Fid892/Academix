const mongoose = require("mongoose");

const pageSchema = new mongoose.Schema({
  pageName: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  bio: {
    type: String,
    default: "",
    trim: true,
  },
  profileImage: {
    type: String,
    default: "",
  },
  category: {
    type: String,
    enum: ["IEEE", "Club", "Department", "Event", "Other"],
    default: "Other",
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  followersCount: {
    type: Number,
    default: 0,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Page", pageSchema);
