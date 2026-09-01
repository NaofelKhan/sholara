const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const dotenv = require("dotenv");

// Load .env FIRST
dotenv.config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const cloudinary = require("./config/cloudinary");

const authRoutes = require("./routes/authRoutes");
const skillRoutes = require("./routes/skillRoutes");
const requestRoutes = require("./routes/requestRoutes");
const marketplaceSkillRoutes = require("./routes/marketplaceSkillRoutes");
// 1. Import the route at the top
const appointmentRoutes = require("./routes/appointmentRoutes");
const courseRoutes = require("./routes/courseRoutes");
const studyGroupRoutes = require("./routes/studyGroupRoutes");
const departmentChannelRoutes = require("./routes/departmentChannelRoutes");
const adminRoutes = require("./routes/adminRoutes");
const skillRequestRoutes = require("./routes/skillRequestRoutes");
const searchRoutes = require("./routes/searchRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const directMessageRoutes = require("./routes/directMessageRoutes");

console.log("Cloudinary SDK Config:");
console.log(cloudinary.config());

(async () => {
    try {
        const result = await cloudinary.api.ping();
        console.log("✅ Cloudinary Connected");
        console.log(result);
    } catch (err) {
        console.log("❌ Cloudinary Connection Failed");
        console.log(err);
    }
})();

connectDB();

const app = express();

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/marketplace-skills", marketplaceSkillRoutes);
// 2. Mount the route under app.use()
app.use("/api/appointments", appointmentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/study-groups", studyGroupRoutes);
app.use("/api/department-channels", departmentChannelRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/skill-requests", skillRequestRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/messages", directMessageRoutes);


app.get("/", (req, res) => {
    res.send("Scholara Backend Running");
});

app.use((err, req, res, next) => {
    console.error("GLOBAL ERROR:");
    console.error(err);

    res.status(err.status || 500).json({
        message: err.message,
        stack: err.stack,
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


