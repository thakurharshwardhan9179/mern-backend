const express = require("express");
const router = express.Router();

const Member = require("../Model/member");
const {
  addMember,
  renewMember,
  getDashboardStats,
  getMyMembership
} = require("../Controller/memberController");

const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");

// Admin add member
router.post("/add", protect, isAdmin, addMember);

// Admin renew
router.put("/renew/:id", protect, isAdmin, renewMember);

// Admin stats
router.get("/stats", protect, isAdmin, getDashboardStats);

// Logged-in member dashboard
router.get("/my", protect, getMyMembership);

// Admin get all members
router.get("/", protect, isAdmin, async (req, res) => {
  try {
    const members = await Member.find().populate("userId", "name email");
    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin delete
router.delete("/:id", protect, isAdmin, async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    await member.deleteOne();

    res.status(200).json({ message: "Member deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
