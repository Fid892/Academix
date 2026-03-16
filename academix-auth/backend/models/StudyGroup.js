const mongoose = require("mongoose");

const studyGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    groupType: {
      type: String,
      enum: ["Study Group", "Processor Discussion Group"],
      default: "Study Group"
    },

    universityType: {
      type: String,
      trim: true
    },

    scheme: {
      type: String,
      trim: true
    },

    subject: {
      type: String,
      required: true,
      trim: true
    },

    department: {
      type: String,
      trim: true
    },

    semester: {
      type: String,
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    creatorRole: {
      type: String,
      required: true
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("StudyGroup", studyGroupSchema);
