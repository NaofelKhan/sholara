const User = require("../models/User");
const MarketplaceSkill = require("../models/MarketplaceSkill");
const SkillRequest = require("../models/SkillRequest");

const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.json({
        users: [],
        skills: [],
        requests: [],
      });
    }

    const searchRegex = new RegExp(q, "i");

    // Search Users
    const users = await User.find({
      $or: [
        { fullName: searchRegex },
        { email: searchRegex },
        { university: searchRegex },
        { department: searchRegex },
      ],
    })
      .select("-password")
      .limit(5);

    // Search Skills
    const skills = await MarketplaceSkill.find({
      $or: [
        { title: searchRegex },
        { category: searchRegex },
        { "tutor.name": searchRegex },
        { "tutor.role": searchRegex },
      ],
    }).limit(5);

    // Search Requests
const requests = await SkillRequest.find({
  $or: [
    { skillTitle: searchRegex },
    { learningObjectives: searchRegex },
    { skillCategory: searchRegex },
  ],
}).limit(5);

    res.json({
      users,
      skills,
      requests,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Search failed",
    });
  }
};

module.exports = {
  globalSearch,
};