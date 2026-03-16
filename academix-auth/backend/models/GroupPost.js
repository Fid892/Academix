const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

const groupPostSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudyGroup",
      required: true
    },

    content: {
      type: String,
      trim: true
    },

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    /* post | note | doubt */
    type: {
      type: String,
      enum: ["post", "note", "doubt"],
      default: "post"
    },

    /* For notes: who uploaded it */
    noteCategory: {
      type: String,
      enum: ["student", "faculty"],
      default: "student"
    },

    /* Uploaded file URL (notes) */
    fileUrl: {
      type: String
    },

    /* Original filename for display */
    fileName: {
      type: String
    },

    comments: [commentSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("GroupPost", groupPostSchema);
