const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  googleId: String,
  role: String,
  department: String,
  semester: String,
  designation: String,
  bio: {
    type: String,
    default: ""
  },
  profileImage: {
    type: String,
    default: ""
  },
  university: {
    type: String,
    default: ""
  },
  scheme: {
    type: String,
    default: ""
  },
  registerNumber: {
    type: String,
    default: ""
  },
  interests: [String],
  settings: {
    notifications: {
      email: { type: Boolean, default: true },
      announcements: { type: Boolean, default: true },
      doubts: { type: Boolean, default: true }
    },
    privacy: {
      showProfile: { type: Boolean, default: true },
      showActivity: { type: Boolean, default: true }
    }
  },
  joinedGroups: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudyGroup"
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);
