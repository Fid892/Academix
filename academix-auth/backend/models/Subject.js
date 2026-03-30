const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  subjectName: { type: String, required: true },
  subjectCode: { type: String, required: true },
  semester: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Subject", subjectSchema);
