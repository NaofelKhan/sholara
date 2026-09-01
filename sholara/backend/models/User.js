const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "student",
    },

    university: {
      type: String,
      default: "",
    },

    department: {
      type: String,
      default: "",
    },

    studentId: {
      type: String,
      default: "",
    },

    profilePicture: {
      type: String,
      default: "",
    },

    // Dashboard academic information
    semester: {
      type: String,
      default: "Fall 2024",
    },
    gpa: {
      type: Number,
      default: 3.8,
    },
    completion: {
      type: Number,
      default: 65,
    },
    creditsCompleted: {
      type: Number,
      default: 92,
    },
    totalCredits: {
      type: Number,
      default: 120,
    },
    mentoringHours: {
      type: Number,
      default: 24,
    },
    rank: {
      type: String,
      default: "Top 5%",
    },
    lecturesToday: {
      type: Number,
      default: 2,
    },
    mentoringSessions: {
      type: Number,
      default: 1,
    },
    focus: {
      type: String,
      default: "Coursework",
    },
  },
  {
    timestamps: true,
  }
);


// Password hashing
userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});


// Compare password
userSchema.methods.matchPassword = async function(password) {

  return await bcrypt.compare(
    password,
    this.password
  );

};


module.exports = mongoose.model("User", userSchema);