const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
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

    venue: {
      type: String,
      trim: true
    },

    eventType: {
      type: String,
      enum: ["Workshop", "Seminar", "Hackathon", "Internship", "Exam", "General"],
      default: "General"
    },

    registrationRequired: {
      type: Boolean,
      default: false
    },

    image: {
      type: String
    },

    startDate: {
      type: Date
    },

    endDate: {
      type: Date
    },

    status: {
      type: String,
      enum: ["pending", "official", "rejected"],
      default: "pending"
    },

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

/* =========================
   Index for Duplicate Detection
========================= */

announcementSchema.index(
  { title: 1, startDate: 1, venue: 1 },
  { unique: false }
);

module.exports = mongoose.model("Announcement", announcementSchema);
