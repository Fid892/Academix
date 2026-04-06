const mongoose = require("mongoose");

const allowedUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ["student", "faculty", "admin"],
    required: true
  },
  name: String,
  department: String,
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  semester: String,
  designation: String,
  createdByAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("AllowedUser", allowedUserSchema);
