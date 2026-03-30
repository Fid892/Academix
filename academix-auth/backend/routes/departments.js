const express = require("express");
const router = express.Router();
const Department = require("../models/Department");
const Subject = require("../models/Subject");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

// Admin: Add Department
router.post("/add-department", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    let existing = await Department.findOne({ name });
    if (existing) return res.status(400).json({ message: "Department already exists" });

    const department = new Department({ name });
    await department.save();
    res.status(201).json(department);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin & Student: Get all Departments
router.get("/list", isAuthenticated, async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Add Subject
router.post("/add-subject", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { departmentId, subjectName, subjectCode, semester } = req.body;
    
    // Prevent duplicates based on department + subjectName + semester
    const existing = await Subject.findOne({ departmentId, subjectName, semester: Number(semester) });
    if (existing) {
      return res.status(400).json({ message: "Subject already exists for this department and semester" });
    }

    const subject = new Subject({ departmentId, subjectName, subjectCode, semester: Number(semester) });
    await subject.save();
    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin & Student: Get Subjects by Department
router.get("/:departmentId/subjects", isAuthenticated, async (req, res) => {
  try {
    const subjects = await Subject.find({ departmentId: req.params.departmentId }).sort({ semester: 1 });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Get specific department details
router.get("/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: "Not found" });
    res.json(dept);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Backward compatibility or other routes can be added here
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const departments = await Department.find().sort({ createdAt: -1 });
    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;