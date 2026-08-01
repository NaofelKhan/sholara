
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// Register User
const registerUser = async (req, res) => {

    try {

        const {
            fullName,
            email,
            password,
            role,
            university,
            department,
        } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                message: "User already exists",
            });
        }

       

        const user = await User.create({
            fullName,
            email,
            password,
            role,
            university,
            department,
        });

        res.status(201).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }

};

// Login User
// Login User
const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            university: user.university,
            department: user.department,
            token: generateToken(user._id),
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};

// Profile
// Get Logged-in User Profile
const getProfile = async (req, res) => {
    try {

        const user = await User.findById(req.user._id).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.json(user);

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};

module.exports = {
    registerUser,
    loginUser,
    getProfile,
};