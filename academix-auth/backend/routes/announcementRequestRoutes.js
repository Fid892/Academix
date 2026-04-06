const router = require("express").Router();
const AnnouncementRequest = require("../models/AnnouncementRequest");
const Announcement = require("../models/Announcement");
const { isAuthenticated } = require("../middleware/auth");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// POST /api/announcement-requests
router.post("/", isAuthenticated, upload.single("image"), async (req, res) => {
  try {
    const newRequest = new AnnouncementRequest({
      title: req.body.title,
      description: req.body.description,
      eventType: req.body.eventType,
      venue: req.body.venue,
      date: req.body.startDate || req.body.date,
      registrationDeadline: req.body.endDate || req.body.registrationDeadline,
      referenceLink: req.body.link || req.body.referenceLink,
      imageUrl: req.file ? `http://localhost:5000/uploads/${req.file.filename}` : null,
      createdBy: req.user._id,
      creatorName: req.user.name,
      creatorRole: req.user.role,
      department: req.user.department,
      targetBadge: req.body.targetBadge,
      status: "pending_badge_approval"
    });
    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET /api/announcement-requests/details/:id
router.get("/details/:id", isAuthenticated, async (req, res) => {
  try {
    const request = await AnnouncementRequest.findById(req.params.id)
      .populate("createdBy", "name profileImage email role department designation semester");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET /api/announcement-requests/:badgeName
router.get("/:badgeName", isAuthenticated, async (req, res) => {
  try {
    const requests = await AnnouncementRequest.find({
      targetBadge: req.params.badgeName,
      status: "pending_badge_approval"
    }).populate("createdBy", "name profileImage email role department designation semester"); 

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// PUT /api/announcement-requests/approve/:id
router.put("/approve/:id", isAuthenticated, async (req, res) => {
  try {
    const request = await AnnouncementRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = "approved";
    request.approvedBy = req.body.badgeName; // assume badgeName is passed
    await request.save();

    // Move to Announcement collection
    const newAnnouncement = new Announcement({
      title: request.title,
      description: request.description,
      eventType: request.eventType,
      venue: request.venue,
      date: request.date,
      registrationDeadline: request.registrationDeadline,
      referenceLink: request.referenceLink,
      imageUrl: request.imageUrl,       // FIX
      createdBy: request.createdBy,
      creatorName: request.creatorName,
      creatorRole: request.creatorRole,
      department: request.department,
      approvedByBadge: request.targetBadge,
      status: "official",
      // Keep legacy fields so old feeds don't break
      postedBy: request.createdBy,
      postedByRole: request.creatorRole,
      image: request.image,
      startDate: request.date,
      endDate: request.registrationDeadline,
      link: request.referenceLink
    });
    
    await newAnnouncement.save();

    res.status(200).json({ message: "Approved successfully", announcement: newAnnouncement });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// PUT /api/announcement-requests/reject/:id
router.put("/reject/:id", isAuthenticated, async (req, res) => {
  try {
    const request = await AnnouncementRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = "rejected";
    await request.save();

    res.status(200).json({ message: "Rejected successfully", request });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
