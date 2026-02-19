const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    plan: {
      type: String,
      enum: ["1 Month", "3 Month", "6 Month"],
      required: true
    },
    joiningDate: {
      type: Date,
      default: Date.now
    },
    expiryDate: {
      type: Date,
      required: true
    },
    fees: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Member", memberSchema);
