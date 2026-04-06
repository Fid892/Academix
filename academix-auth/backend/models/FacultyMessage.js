const mongoose = require("mongoose");

const facultyMessageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    sender: {
      type: String, // "admin" or "faculty"
      required: true
    },
    targetDepartmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: false
    },
    targetDepartmentName: {
      type: String, // Fallback for UI and legacy
      required: false
    },
    forwardToStudents: {
      type: Boolean,
      default: false
    },
    originalMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FacultyMessage",
      required: false
    },
    forwardedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false
    },
    target: {
      type: String, // "faculty" or "students"
      default: "faculty"
    },
    isSharedWithStudents: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("FacultyMessage", facultyMessageSchema);
