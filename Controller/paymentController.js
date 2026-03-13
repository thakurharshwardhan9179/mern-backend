const Razorpay = require("razorpay");
const Member = require("../Model/member");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// CREATE ORDER
exports.createOrder = async (req, res) => {

try {

const { amount } = req.body;

if (!amount) {
  return res.status(400).json({ message: "Amount required" });
}

const options = {
  amount: Number(amount) * 100,   // paise
  currency: "INR",
  receipt: "gym_receipt_" + Date.now(),
};

console.log("Creating Razorpay Order:", options);

const order = await razorpay.orders.create(options);

res.json(order);


} catch (err) {


console.log("RAZORPAY ORDER ERROR:", err);

res.status(500).json({
  message: "Order creation failed",
  error: err.message,
});


}

};

// VERIFY PAYMENT
exports.verifyPayment = async (req, res) => {

try {

const { userId, phone, plan, fees } = req.body;

const planMap = {
  "1 Month": 1,
  "3 Month": 3,
  "6 Month": 6,
};

const months = planMap[plan];

const joiningDate = new Date();
const expiryDate = new Date();

expiryDate.setMonth(expiryDate.getMonth() + months);

const member = await Member.create({
  userId,
  phone,
  plan,
  fees,
  joiningDate,
  expiryDate,
});

res.json({
  message: "Payment Successful & Membership Activated",
  member,
});


} catch (err) {


console.log("VERIFY PAYMENT ERROR:", err);

res.status(500).json({
  message: err.message,
});


}

};
