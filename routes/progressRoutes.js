const express = require("express");
const router = express.Router();

const {
  addProgress,
  getMyProgress,
  saveGoalWeight,
  getAllMembersProgress,
} = require("../Controller/progressController");

const { protect } = require("../middleware/authMiddleware");

router.post("/add", protect, addProgress);
router.get("/my", protect, getMyProgress);
router.put("/goal", protect, saveGoalWeight);
router.get("/all", protect, getAllMembersProgress);

module.exports = router;