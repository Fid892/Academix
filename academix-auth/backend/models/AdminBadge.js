const mongoose = require("mongoose");

const adminBadgeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, required: true }, // student or faculty
  badgeName: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AdminBadge", adminBadgeSchema);
