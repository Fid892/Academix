const mongoose = require("mongoose");

const pageFollowerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  pageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Page",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("PageFollower", pageFollowerSchema);
