const Razorpay = require("razorpay");
const crypto = require("crypto");
const Member = require("../Model/member");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ================= CREATE ORDER =================
exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ message: "Amount required" });
    }

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "gym_receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.json(order);
  } catch (error) {
    console.log("Order Error:", error);
    res.status(500).json({ message: "Order creation failed" });
  }
};

// ================= VERIFY PAYMENT =================
exports.verifyPayment = async (req, res) => {
  try {
    const {
      userId,
      phone,
      plan,
      fees,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    const today = new Date();
    let expiryDate = new Date(today);

    if (plan === "1 Month") expiryDate.setMonth(expiryDate.getMonth() + 1);
    if (plan === "3 Month") expiryDate.setMonth(expiryDate.getMonth() + 3);
    if (plan === "6 Month") expiryDate.setMonth(expiryDate.getMonth() + 6);
    if (plan === "12 Month") expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    await Member.findOneAndUpdate(
      { userId },
      {
        phone,
        plan,
        fees,
        joiningDate: today,
        expiryDate,
      },
      { returnDocument: "after" }
    );

    res.json({
      success: true,
      message: "Payment verified and membership renewed",
    });
  } catch (error) {
    console.log("Verify Error:", error);
    res.status(500).json({ message: "Payment verification failed" });
  }
};