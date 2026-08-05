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
const skillRequestRoutes = require("./routes/skillRequestRoutes");
const searchRoutes = require("./routes/searchRoutes");

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
app.use("/api/skill-requests", skillRequestRoutes);
app.use("/api/search", searchRoutes);

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