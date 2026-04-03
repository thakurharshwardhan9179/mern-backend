const Attendance = require("../Model/attendance");
const Member = require("../Model/member");

// MARK ATTENDANCE
const markAttendance = async (req, res) => {
  try {
    const member = await Member.findOne({ userId: req.user.id });

    if (!member) {
      return res.status(404).json({ message: "Membership not found" });
    }

    const today = new Date().toISOString().split("T")[0];

    const attendance = await Attendance.create({
      member: member._id,
      date: today,
    });

    res.status(201).json(attendance);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Attendance already marked" });
    }
    res.status(500).json({ message: error.message });
  }
};

// GET MY ATTENDANCE (MEMBER)
const getMyAttendance = async (req, res) => {
  try {
    const member = await Member.findOne({ userId: req.user.id });

    if (!member) {
      return res.status(404).json({ message: "Membership not found" });
    }

    const records = await Attendance.find({ member: member._id })
      .sort({ date: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔥 GET ALL ATTENDANCE (ADMIN)
const getAllAttendance = async (req, res) => {
  try {
    const data = await Attendance.find()
      .populate({
        path: "member",
        populate: {
          path: "userId",
          select: "name email"
        }
      })
      .sort({ date: -1 });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// 📅 GET ATTENDANCE BY DATE
const getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const data = await Attendance.find({ date })
      .populate({
        path: "member",
        populate: {
          path: "userId",
          select: "name email"
        }
      });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  markAttendance,
  getMyAttendance,
  getAllAttendance,
  getAttendanceByDate
};