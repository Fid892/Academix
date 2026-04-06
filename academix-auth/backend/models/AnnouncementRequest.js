const mongoose = require("mongoose");

const announcementRequestSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  venue: { type: String, trim: true },
  eventType: { type: String, default: "General" },
  registrationRequired: { type: Boolean, default: false },
  image: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  date: { type: Date },
  registrationDeadline: { type: Date },
  referenceLink: { type: String },
  imageUrl: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  creatorName: { type: String },
  creatorRole: { type: String, required: true },
  department: { type: String },
  targetBadge: { type: String, required: true },
  status: { type: String, default: "pending_badge_approval" },
  approvedBy: { type: String, default: null },
  target: { type: String, default: "student" },
  isSharedWithStudents: { type: Boolean, default: false },
  targetDepartment: { type: String, required: false },
  pdf: { type: String, required: false },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("AnnouncementRequest", announcementRequestSchema);
