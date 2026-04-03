const Member = require("../Model/member");
const User = require("../Model/UserModel");

// ================= AI FITNESS ENGINE =================
const getFitnessAI = (height, weight, goal) => {
  const heightMeter = height / 100;
  const bmi = weight / (heightMeter * heightMeter);

  let fitnessLevel = "";
  let workout = "";
  let diet = "";

  if (bmi < 18.5) fitnessLevel = "Underweight";
  else if (bmi < 24.9) fitnessLevel = "Normal";
  else if (bmi < 29.9) fitnessLevel = "Overweight";
  else fitnessLevel = "Obese";

  if (goal === "Weight Loss") {
    workout = "Cardio, Running, Cycling, HIIT";
    diet = "Low calorie diet, more protein, avoid junk food";
  } else if (goal === "Muscle Gain") {
    workout = "Strength training, weight lifting, compound exercises";
    diet = "High protein diet, eggs, chicken, milk, peanut butter";
  } else {
    workout = "Mixed workout (Cardio + Strength)";
    diet = "Balanced diet with protein, carbs and vegetables";
  }

  return {
    bmi: Number(bmi.toFixed(2)),
    fitnessLevel,
    workout,
    diet,
  };
};

// ================= STATUS HELPER =================
const getRenewalStatus = (expiryDate) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysLeft = Math.ceil((expiry - today) / 86400000);

  if (daysLeft <= 0) return "expired";
  if (daysLeft <= 7) return "expiring_soon";
  return "active";
};

// ================= ADD MEMBER =================
const addMember = async (req, res) => {
  try {
    const { userId, phone, plan, fees, age, height, weight, goal } = req.body;

    if (!userId || !phone || !plan || !fees) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingMember = await Member.findOne({ userId });
    if (existingMember) {
      return res.status(400).json({ message: "Member already exists" });
    }

    const planMap = {
      "1 Month": 1,
      "3 Month": 3,
      "6 Month": 6,
    };

    const months = planMap[plan];
    if (!months) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    const joiningDate = new Date();
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + months);

    const h = Number(height);
    const w = Number(weight);

    let bmi = null;
    let fitnessLevel = null;
    let workoutSuggestion = null;
    let dietSuggestion = null;

    if (!isNaN(h) && !isNaN(w) && h > 0 && w > 0) {
      const result = getFitnessAI(h, w, goal);
      bmi = result.bmi;
      fitnessLevel = result.fitnessLevel;
      workoutSuggestion = result.workout;
      dietSuggestion = result.diet;
    }

    const member = await Member.create({
      userId,
      phone,
      plan,
      fees: Number(fees),
      joiningDate,
      expiryDate,
      age: age ? Number(age) : undefined,
      height: !isNaN(h) ? h : undefined,
      weight: !isNaN(w) ? w : undefined,
      goal,
      bmi,
      fitnessLevel,
      workoutSuggestion,
      dietSuggestion,
      renewalStatus: getRenewalStatus(expiryDate),
      renewalHistory: [
        {
          plan,
          fees: Number(fees),
          startDate: joiningDate,
          endDate: expiryDate,
          renewedAt: new Date(),
          approvedByAdmin: true,
        },
      ],
    });

    res.status(201).json({
      message: "Member added successfully",
      member,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= RENEW MEMBER =================
const renewMember = async (req, res) => {
  try {
    const { plan, fees, paymentId, orderId } = req.body;
    const { id } = req.params;

    const planMap = {
      "1 Month": 1,
      "3 Month": 3,
      "6 Month": 6,
    };

    const months = planMap[plan];
    if (!months) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    const member = await Member.findById(id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    const now = new Date();

    const baseDate =
      new Date(member.expiryDate) > now ? new Date(member.expiryDate) : now;

    const newExpiry = new Date(baseDate);
    newExpiry.setMonth(newExpiry.getMonth() + months);

    member.plan = plan;
    member.fees = Number(fees);
    member.expiryDate = newExpiry;
    member.renewalStatus = getRenewalStatus(newExpiry);

    member.renewalHistory.push({
      plan,
      fees: Number(fees),
      startDate: baseDate,
      endDate: newExpiry,
      renewedAt: new Date(),
      paymentId: paymentId || "",
      orderId: orderId || "",
      approvedByAdmin: true,
    });

    await member.save();

    res.json({
      message: "Membership renewed successfully",
      member,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ================= ADMIN STATS =================
const getDashboardStats = async (req, res) => {
  try {
    const total = await Member.countDocuments();

    const active = await Member.countDocuments({
      expiryDate: { $gte: new Date() },
    });

    const expired = total - active;

    const expiringSoonDate = new Date();
    expiringSoonDate.setDate(expiringSoonDate.getDate() + 7);

    const pendingRenewals = await Member.countDocuments({
      expiryDate: { $lte: expiringSoonDate },
    });

    res.json({
      total,
      active,
      expired,
      pendingRenewals,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= MEMBER DASHBOARD =================
const getMyMembership = async (req, res) => {
  try {
    const member = await Member.findOne({ userId: req.user.id }).populate(
      "userId",
      "name email"
    );

    if (!member) {
      return res.status(404).json({ message: "No membership found" });
    }

    const status = getRenewalStatus(member.expiryDate);

    if (member.renewalStatus !== status) {
      member.renewalStatus = status;
      await member.save();
    }

    res.json({
      ...member.toObject(),
      renewalStatus: status,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= MEMBER RENEWAL HISTORY =================
const getMyRenewalHistory = async (req, res) => {
  try {
    const member = await Member.findOne({ userId: req.user.id }).populate(
      "userId",
      "name email"
    );

    if (!member) {
      return res.status(404).json({ message: "No membership found" });
    }

    res.json({
      renewalHistory: member.renewalHistory || [],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= ADMIN PENDING RENEWALS =================
const getPendingRenewals = async (req, res) => {
  try {
    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);

    const members = await Member.find({
      expiryDate: { $lte: next7Days },
    }).populate("userId", "name email");

    const formatted = members.map((member) => {
      const status = getRenewalStatus(member.expiryDate);
      return {
        ...member.toObject(),
        renewalStatus: status,
      };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  addMember,
  renewMember,
  getDashboardStats,
  getMyMembership,
  getMyRenewalHistory,
  getPendingRenewals,
};