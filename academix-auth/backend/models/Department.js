const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  type: { type: String, default: "Study Group" },
  university: { type: String },
  scheme: { type: String },
  name: { type: String, required: true }, // department name
  semester: { type: Number },
  subjects: [{ name: { type: String } }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Department", departmentSchema);