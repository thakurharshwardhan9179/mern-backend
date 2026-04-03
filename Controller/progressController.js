const Progress = require("../Model/progress");
const Member = require("../Model/member");

// ADD PROGRESS
const addProgress = async (req, res) => {
  try {
    const { weight } = req.body;

    if (!weight) {
      return res.status(400).json({ message: "Weight is required" });
    }

    const member = await Member.findOne({ userId: req.user.id });

    if (!member) {
      return res.status(404).json({ message: "Membership not found" });
    }

    const today = new Date().toISOString().split("T")[0];

    const data = await Progress.create({
      member: member._id,
      weight: Number(weight),
      date: today,
    });

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET MY PROGRESS + GOAL
const getMyProgress = async (req, res) => {
  try {
    const member = await Member.findOne({ userId: req.user.id });

    if (!member) {
      return res.status(404).json({ message: "Membership not found" });
    }

    const progress = await Progress.find({ member: member._id }).sort({ date: 1 });

    res.json({
      goalWeight: member.goalWeight || 0,
      progress,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// SAVE / UPDATE GOAL WEIGHT
const saveGoalWeight = async (req, res) => {
  try {
    const { goalWeight } = req.body;

    if (goalWeight === undefined || goalWeight === null || goalWeight === "") {
      return res.status(400).json({ message: "Goal weight is required" });
    }

    const member = await Member.findOne({ userId: req.user.id });

    if (!member) {
      return res.status(404).json({ message: "Membership not found" });
    }

    member.goalWeight = Number(goalWeight);
    await member.save();

    res.json({
      message: "Goal weight saved successfully",
      goalWeight: member.goalWeight,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADMIN: GET ALL MEMBERS PROGRESS
const getAllMembersProgress = async (req, res) => {
  try {
    const members = await Member.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    const result = [];

    for (const member of members) {
      const progress = await Progress.find({ member: member._id }).sort({ date: 1 });

      const startingWeight = progress.length ? progress[0].weight : 0;
      const currentWeight = progress.length ? progress[progress.length - 1].weight : 0;
      const change = progress.length ? currentWeight - startingWeight : 0;

      result.push({
        memberId: member._id,
        name: member.userId?.name || "N/A",
        email: member.userId?.email || "N/A",
        goalWeight: member.goalWeight || 0,
        startingWeight,
        currentWeight,
        change,
        totalEntries: progress.length,
        progress,
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  addProgress,
  getMyProgress,
  saveGoalWeight,
  getAllMembersProgress,
};