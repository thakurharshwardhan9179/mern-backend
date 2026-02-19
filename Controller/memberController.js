const Member = require("../Model/member");

// ADD MEMBER
const addMember = async (req, res) => {
  try {
    const { userId, phone, plan, fees } = req.body;

    if (!userId || !phone || !plan || !fees) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const planMap = {
      "1 Month": 1,
      "3 Month": 3,
      "6 Month": 6
    };

    const months = planMap[plan];
    if (!months) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    const joiningDate = new Date();
    const expiryDate = new Date(joiningDate);
    expiryDate.setMonth(expiryDate.getMonth() + months);

    const member = await Member.create({
      userId,
      phone,
      plan,
      fees: Number(fees),
      joiningDate,
      expiryDate
    });

    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// RENEW MEMBER
const renewMember = async (req, res) => {
  try {
    const { plan, fees } = req.body;
    const { id } = req.params;

    const planMap = {
      "1 Month": 1,
      "3 Month": 3,
      "6 Month": 6
    };

    const months = planMap[plan];
    if (!months) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    const member = await Member.findById(id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    const baseDate =
      member.expiryDate > new Date()
        ? member.expiryDate
        : new Date();

    const newExpiry = new Date(baseDate);
    newExpiry.setMonth(newExpiry.getMonth() + months);

    member.plan = plan;
    member.fees = Number(fees);
    member.expiryDate = newExpiry;

    await member.save();

    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADMIN DASHBOARD STATS
const getDashboardStats = async (req, res) => {
  try {
    const total = await Member.countDocuments();
    const active = await Member.countDocuments({
      expiryDate: { $gte: new Date() }
    });
    res.json({ total, active, expired: total - active });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// MEMBER DASHBOARD
const getMyMembership = async (req, res) => {
  try {
    const member = await Member.findOne({ userId: req.user.id })
      .populate("userId", "name email");

    if (!member) {
      return res.status(404).json({ message: "No membership found" });
    }

    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  addMember,
  renewMember,
  getDashboardStats,
  getMyMembership
};
