const mongoose = require("mongoose");

const allowedUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ["student", "faculty", "admin"],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("AllowedUser", allowedUserSchema);
