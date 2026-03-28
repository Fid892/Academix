const mongoose = require("mongoose");

const announcementLikeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    announcementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Announcement",
      required: true
    }
  },
  { timestamps: true }
);

// Prevent duplicate likes
announcementLikeSchema.index({ userId: 1, announcementId: 1 }, { unique: true });

module.exports = mongoose.model("AnnouncementLike", announcementLikeSchema);
