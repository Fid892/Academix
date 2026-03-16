const express = require("express");
const router = express.Router();
const Department = require("../models/Department");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

// 1. Get all unique types
router.get("/types", async (req, res) => {
  try {
    const types = await Department.distinct("type");
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get unique university types (optionally filtered by group type)
router.get("/universities", async (req, res) => {
  try {
    const { type } = req.query;
    let query = {};
    if (type) query.type = type;
    const universities = await Department.distinct("university", query);
    res.json(universities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Get unique schemes (filtered by university and type)
router.get("/schemes", async (req, res) => {
  try {
    const { type, university } = req.query;
    let query = {};
    if (type) query.type = type;
    if (university) query.university = university;
    const schemes = await Department.distinct("scheme", query);
    res.json(schemes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Get unique departments (filtered by uni, scheme, type)
router.get("/list", async (req, res) => {
  try {
    const { type, university, scheme } = req.query;
    let query = {};
    if (type) query.type = type;
    if (university) query.university = university;
    if (scheme) query.scheme = scheme;
    const departments = await Department.distinct("name", query);
    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Get unique semesters (filtered by above)
router.get("/semesters", async (req, res) => {
  try {
    const { type, university, scheme, department } = req.query;
    let query = {};
    if (type) query.type = type;
    if (university) query.university = university;
    if (scheme) query.scheme = scheme;
    if (department) query.name = department;
    const semesters = await Department.distinct("semester", query);
    res.json(semesters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Get subjects based on full filter
router.get("/subjects-list", async (req, res) => {
  try {
    const { type, university, scheme, department, semester } = req.query;
    const doc = await Department.findOne({
      type,
      university,
      scheme,
      name: department,
      semester: parseInt(semester)
    });
    if (!doc) return res.json([]);
    res.json(doc.subjects.map(s => s.name));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all departments with optional search
router.get("/", async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    const departments = await Department.find(query).sort({ createdAt: -1 });
    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new Study Group Structure
router.post("/add-study-group", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { type, university, scheme, department, semester, subjects } = req.body;

    const newStructure = new Department({
      type,
      university,
      scheme,
      name: department,
      semester,
      subjects: subjects.map(s => ({ name: s }))
    });

    await newStructure.save();
    res.status(201).json(newStructure);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Inline Add Subject to existing structure
router.post("/add-subject", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { departmentId, subject } = req.body;
    const dept = await Department.findById(departmentId);
    if (!dept) return res.status(404).json({ message: "Structure not found" });

    dept.subjects.push({ name: subject });
    await dept.save();
    res.json(dept);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove subject from structure
router.post("/remove-subject", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { departmentId, subjectName } = req.body;
    const dept = await Department.findById(departmentId);
    if (!dept) return res.status(404).json({ message: "Structure not found" });

    dept.subjects = dept.subjects.filter(s => s.name !== subjectName);
    await dept.save();
    res.json(dept);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete structure
router.delete("/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;