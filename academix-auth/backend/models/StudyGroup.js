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
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject"
    },
    subjectName: {
      type: String
    },
    subjectCode: {
      type: String
    },
    semester: {
      type: Number
    },
    // Retained for frontend legacy support
    department: {
      type: String
    },
    subject: {
      type: String
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
    ],
    membersCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("StudyGroup", studyGroupSchema);
