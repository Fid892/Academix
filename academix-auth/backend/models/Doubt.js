const mongoose = require("mongoose");

const doubtSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    subject: {
      type: String,
      trim: true
    },

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      enum: ["open", "resolved"],
      default: "open"
    },
    
    isAnonymous: {
      type: Boolean,
      default: false
    },

    fileUrl: {
      type: String
    },

    fileName: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Doubt", doubtSchema);
