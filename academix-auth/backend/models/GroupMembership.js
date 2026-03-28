const mongoose = require("mongoose");

const groupMembershipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudyGroup",
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate memberships
groupMembershipSchema.index({ userId: 1, groupId: 1 }, { unique: true });

module.exports = mongoose.model("GroupMembership", groupMembershipSchema);
