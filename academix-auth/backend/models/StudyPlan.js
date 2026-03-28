const mongoose = require('mongoose');

const scheduleItemSchema = new mongoose.Schema({
  start: String,
  end: String,
  type: { type: String }, // "study", "break", "meal", "revision"
  topic: String,
});

const dayScheduleSchema = new mongoose.Schema({
  day: Number,
  date: Date, // Optional, for tying to real dates if needed
  schedule: [scheduleItemSchema],
});

const checklistItemSchema = new mongoose.Schema({
  topic: String,
  completed: { type: Boolean, default: false },
});

const StudyPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['pdf', 'manual'],
    required: true,
  },
  modules: [
    {
      module_name: String,
      topics: [String],
    }
  ],
  settings: {
    days: Number,
    hoursPerDay: Number,
    timeRangeStart: String,
    timeRangeEnd: String,
    includeBreaks: { type: Boolean, default: true },
  },
  schedule: [dayScheduleSchema],
  checklist: [checklistItemSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('StudyPlan', StudyPlanSchema);
