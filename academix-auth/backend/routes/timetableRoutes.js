const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const Timetable = require('../models/Timetable');

// Save new timetable
router.post('/create', isAuthenticated, async (req, res) => {
  try {
    const { planName, description, type, modules, settings, schedule } = req.body;

    if (!planName) {
      return res.status(400).json({ error: 'Plan name is required' });
    }

    // Build checklist flat structure (saving as tasks, as per user requirement)
    // Wait, the schema uses tasks instead of checklist
    const tasks = [];
    if (modules && Array.isArray(modules)) {
      modules.forEach(m => {
        if (m.topics && Array.isArray(m.topics)) {
          m.topics.forEach(t => {
            tasks.push({ topic: `${m.module_name}: ${t}`, completed: false });
          });
        }
      });
    }

    // Create new plan
    const newTimetable = new Timetable({
      userId: req.user._id,
      planName,
      description,
      type: type || 'manual',
      modules,
      settings,
      schedule,
      tasks, // Mapping to tasks
    });

    await newTimetable.save();
    res.status(201).json({ message: 'Timetable saved successfully', timetable: newTimetable });
  } catch (error) {
    console.error('Error saving timetable:', error);
    res.status(500).json({ error: 'Failed to save timetable' });
  }
});

// Fetch all timetables for user
router.get('/my', isAuthenticated, async (req, res) => {
  try {
    const timetables = await Timetable.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(timetables);
  } catch (error) {
    console.error('Error fetching timetables:', error);
    res.status(500).json({ error: 'Failed to fetch timetables' });
  }
});

// Fetch one timetable
router.get('/single/:id', isAuthenticated, async (req, res) => {
  try {
    const timetable = await Timetable.findOne({ _id: req.params.id, userId: req.user._id });
    if (!timetable) return res.status(404).json({ message: 'Timetable not found' });
    res.json(timetable);
  } catch (error) {
    console.error('Error fetching single timetable:', error);
    res.status(500).json({ error: 'Failed to fetch timetable' });
  }
});

// Delete timetable
router.delete('/delete/:id', isAuthenticated, async (req, res) => {
  try {
    const timetable = await Timetable.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!timetable) return res.status(404).json({ error: 'Timetable not found' });
    
    res.json({ message: 'Timetable deleted successfully' });
  } catch (err) {
    console.error('error deleting timetable', err);
    res.status(500).json({ error: 'Failed to delete timetable' });
  }
});

// Update a task (checklist item)
router.patch('/task/:planId', isAuthenticated, async (req, res) => {
  try {
    const { planId } = req.params;
    const { itemId, completed } = req.body;

    const plan = await Timetable.findOne({ _id: planId, userId: req.user._id });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    const item = plan.tasks.id(itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    item.completed = completed;
    await plan.save();

    res.json({ message: 'Task updated', item });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

module.exports = router;
