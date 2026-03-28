const mongoose = require('mongoose');

const scheduleItemSchema = new mongoose.Schema({
  start: String,
  end: String,
  type: { type: String },
  topic: String,
});

const dayScheduleSchema = new mongoose.Schema({
  day: Number,
  date: Date,
  schedule: [scheduleItemSchema],
});

const taskItemSchema = new mongoose.Schema({
  topic: String,
  completed: { type: Boolean, default: false },
});

const TimetableSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  planName: { type: String, required: true },
  description: { type: String },
  
  // Storing fields required by the existing planner logic
  type: { type: String, default: 'manual' },
  modules: [{ module_name: String, topics: [String] }],
  settings: {
    days: Number,
    hoursPerDay: Number,
    timeRangeStart: String,
    timeRangeEnd: String,
    includeBreaks: Boolean,
  },
  
  tasks: [taskItemSchema], // Requested by user
  schedule: [dayScheduleSchema],
  
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Timetable', TimetableSchema);
