const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String }, // store image filename
  startDate: { type: Date },
  endDate: { type: Date },
  status: { type: String, default: "official" }, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Announcement", announcementSchema);
