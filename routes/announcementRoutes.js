const express = require("express");
const router = express.Router();

const {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement
} = require("../Controller/announcementController");

const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");

// ADMIN
router.post("/create", protect, isAdmin, createAnnouncement);
router.delete("/:id", protect, isAdmin, deleteAnnouncement);

// MEMBER + ADMIN
router.get("/", protect, getAnnouncements);

module.exports = router;
