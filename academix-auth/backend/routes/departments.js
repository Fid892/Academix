const express = require("express");
const router = express.Router();
const Department = require("../models/Department");

// Get all departments
router.get("/", async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new department
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;

    const existing = await Department.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Department already exists" });
    }

    const dept = new Department({
      name,
      subjects: []
    });

    await dept.save();
    res.json(dept);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add subject to department
router.post("/add-subject", async (req, res) => {
  try {
    const { departmentId, subject } = req.body;

    const dept = await Department.findById(departmentId);
    if (!dept) return res.status(404).json({ message: "Department not found" });

    if (dept.subjects.includes(subject)) {
      return res.status(400).json({ message: "Subject already exists" });
    }

    dept.subjects.push(subject);
    await dept.save();

    res.json(dept);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;