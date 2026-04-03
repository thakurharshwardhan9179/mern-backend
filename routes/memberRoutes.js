const express = require("express");
const router = express.Router();

const Member = require("../Model/member");
const {
  addMember,
  renewMember,
  getDashboardStats,
  getMyMembership,
  getMyRenewalHistory,
  getPendingRenewals,
} = require("../Controller/memberController");

const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");

// ================= ADMIN ADD MEMBER =================
router.post("/add", protect, isAdmin, addMember);

// ================= ADMIN RENEW =================
router.put("/renew/:id", protect, isAdmin, renewMember);

// ================= ADMIN STATS =================
router.get("/stats", protect, isAdmin, getDashboardStats);

// ================= ADMIN PENDING RENEWALS =================
router.get("/pending-renewals", protect, isAdmin, getPendingRenewals);

// ================= MEMBER DASHBOARD =================
router.get("/my", protect, getMyMembership);

// ================= MEMBER RENEWAL HISTORY =================
router.get("/my-renewal-history", protect, getMyRenewalHistory);

// ================= ADMIN GET ALL MEMBERS =================
router.get("/", protect, isAdmin, async (req, res) => {
  try {
    const members = await Member.find().populate("userId", "name email");

    const now = new Date();

    const formattedMembers = members.map((member) => {
      const expiry = new Date(member.expiryDate);
      const daysLeft = Math.ceil((expiry - now) / 86400000);

      let renewalStatus = "active";
      if (daysLeft <= 0) renewalStatus = "expired";
      else if (daysLeft <= 7) renewalStatus = "expiring_soon";

      return {
        ...member.toObject(),
        renewalStatus,
      };
    });

    res.status(200).json(formattedMembers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= ADMIN GET SINGLE MEMBER =================
router.get("/:id", protect, isAdmin, async (req, res) => {
  try {
    const member = await Member.findById(req.params.id).populate(
      "userId",
      "name email"
    );

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.status(200).json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= ADMIN DELETE =================
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