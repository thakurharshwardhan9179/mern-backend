const mongoose = require("mongoose");

const renewalHistorySchema = new mongoose.Schema(
  {
    plan: {
      type: String,
      enum: ["1 Month", "3 Month", "6 Month"],
      required: true,
    },
    fees: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    renewedAt: {
      type: Date,
      default: Date.now,
    },
    paymentId: {
      type: String,
      default: "",
    },
    orderId: {
      type: String,
      default: "",
    },
    approvedByAdmin: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const memberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    goalWeight: {
      type: Number,
      default: 0,
    },

    phone: {
      type: String,
      required: true,
    },

    plan: {
      type: String,
      enum: ["1 Month", "3 Month", "6 Month"],
      required: true,
    },

    joiningDate: {
      type: Date,
      default: Date.now,
    },

    expiryDate: {
      type: Date,
      required: true,
    },

    fees: {
      type: Number,
      required: true,
    },

    // FITNESS DATA
    age: {
      type: Number,
    },

    height: {
      type: Number,
    },

    weight: {
      type: Number,
    },

    goal: {
      type: String,
      enum: ["Weight Loss", "Muscle Gain", "Fitness"],
    },

    // AI RESULT
    bmi: {
      type: Number,
    },

    fitnessLevel: {
      type: String,
    },

    workoutSuggestion: {
      type: String,
    },

    dietSuggestion: {
      type: String,
    },

    // RENEWAL SYSTEM
    renewalStatus: {
      type: String,
      enum: ["active", "expiring_soon", "expired", "pending"],
      default: "active",
    },

    renewalHistory: {
      type: [renewalHistorySchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Member", memberSchema);