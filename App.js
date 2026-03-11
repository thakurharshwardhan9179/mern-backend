require("dotenv").config(); // 👈 sabse pehle load

const express = require("express");
const cors = require("cors");

require("./Db/Connection");

const attendanceRoutes = require("./routes/attendanceRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/member", require("./routes/memberRoutes"));
app.use("/api/announcement", require("./routes/announcementRoutes"));
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payment", paymentRoutes);

app.get("/", (req, res) => {
res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
console.log(`Server running on http://localhost:${PORT}`);
});
