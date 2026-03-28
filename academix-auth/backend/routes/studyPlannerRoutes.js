const express = require('express');
const router = express.Router();
const multer = require('multer');
const { isAuthenticated } = require('../middleware/auth');
const studyPlannerController = require('../controllers/studyPlannerController');

const upload = multer({ dest: 'uploads/' });

// Parse a syllabus PDF to extract modules and topics
router.post('/parse-pdf', isAuthenticated, upload.single('syllabus'), studyPlannerController.parsePdf);

// Generate a study schedule from modules and settings
router.post('/generate', isAuthenticated, studyPlannerController.generateSchedule);

// Save or finalize the plan
router.post('/save', isAuthenticated, studyPlannerController.savePlan);

// Get the user's current plan
router.get('/me', isAuthenticated, studyPlannerController.getMyPlan);

// Update a checklist item
router.patch('/checklist/:planId', isAuthenticated, studyPlannerController.updateChecklistItem);

// Delete user's plan
router.delete('/me', isAuthenticated, studyPlannerController.deleteMyPlan);

module.exports = router;
