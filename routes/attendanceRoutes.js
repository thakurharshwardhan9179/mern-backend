const express = require("express");
const router = express.Router();

const {
  markAttendance,
  getMyAttendance,
  getAllAttendance,
  getAttendanceByDate
} = require("../Controller/attendanceController");

const { protect } = require("../middleware/authMiddleware");

router.post("/mark", protect, markAttendance);
router.get("/my", protect, getMyAttendance);
router.get("/all", protect, getAllAttendance);
router.get("/by-date", protect, getAttendanceByDate);

module.exports = router;