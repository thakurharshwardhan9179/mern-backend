// routes/authRoutes.js
const express = require("express");
const router = express.Router();

const User = require("../Model/UserModel");

const { registerUser, loginUser } = require("../Controller/authController");
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");

// Public
router.post("/signup", registerUser);
router.post("/login", loginUser);

// Admin test
router.get("/admin-test", protect, isAdmin, (req, res) => {
  res.json({
    message: "Welcome Admin 👑",
    admin: req.user,
  });
});

// ✅ GET ALL USERS (ADMIN ONLY)
router.get("/all", protect, isAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: "member" }).select("name email");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;