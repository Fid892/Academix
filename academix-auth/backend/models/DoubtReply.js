const mongoose = require("mongoose");

const doubtReplySchema = new mongoose.Schema(
  {
    doubtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doubt",
      required: true
    },

    content: {
      type: String,
      required: true,
      trim: true
    },

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    /* Automatically true when the replier is faculty */
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("DoubtReply", doubtReplySchema);
