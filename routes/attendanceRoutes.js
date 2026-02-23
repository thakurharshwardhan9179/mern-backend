const express = require("express");
const router = express.Router();

const {
  markAttendance,
  getMyAttendance,
} = require("../Controller/attendanceController");

const { protect } = require("../middleware/authMiddleware");

router.post("/mark", protect, markAttendance);
router.get("/my", protect, getMyAttendance);

module.exports = router;