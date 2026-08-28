const MarketplaceSkill = require("../models/MarketplaceSkill");
const SkillRequest = require("../models/SkillRequest");
const Booking = require("../models/Booking");

// Build a frequency map of a field across a list of docs
const buildFrequencyMap = (docs, field) => {
  const map = {};
  docs.forEach((doc) => {
    const value = doc[field];
    if (value) {
      map[value] = (map[value] || 0) + 1;
    }
  });
  return map;
};

// GET /api/recommendations/skills
// Recommends marketplace skills for the logged-in user to learn/book,
// based on the categories they've requested and previously booked.
exports.getRecommendedSkills = async (req, res) => {
  try {
    const userId = req.user._id;

    const [myRequests, myBookings, allSkills] = await Promise.all([
      SkillRequest.find({ userId }),
      Booking.find({ student: userId }).populate("skill", "category difficultyLevel"),
      MarketplaceSkill.find({ status: "published", mentor: { $ne: userId } }).populate(
        "mentor",
        "fullName profilePicture department university"
      ),
    ]);

    const categoryInterest = buildFrequencyMap(myRequests, "skillCategory");
    myBookings.forEach((b) => {
      if (b.skill?.category) {
        categoryInterest[b.skill.category] = (categoryInterest[b.skill.category] || 0) + 1;
      }
    });

    const difficultyInterest = buildFrequencyMap(myRequests, "difficultyLevel");

    const hasSignal = Object.keys(categoryInterest).length > 0;

    const scored = allSkills.map((skill) => {
      let score = 0;
      if (categoryInterest[skill.category]) {
        score += categoryInterest[skill.category] * 3;
      }
      if (difficultyInterest[skill.difficultyLevel]) {
        score += 1;
      }
      score += (skill.rating || 0) / 2;

      return { skill, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const recommendations = (hasSignal ? scored.filter((s) => s.score > 0) : scored)
      .slice(0, 6)
      .map((s) => s.skill);

    // Backfill with top-rated skills if fewer than 6 matched
    if (recommendations.length < 6) {
      const existingIds = new Set(recommendations.map((s) => s._id.toString()));
      const fallback = allSkills
        .filter((s) => !existingIds.has(s._id.toString()))
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 6 - recommendations.length);
      recommendations.push(...fallback);
    }

    res.json({
      success: true,
      basedOnActivity: hasSignal,
      count: recommendations.length,
      skills: recommendations,
    });
  } catch (error) {
    console.error("Get Recommended Skills Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch recommended skills.",
    });
  }
};

// GET /api/recommendations/requests
// Recommends skill requests the logged-in mentor could fulfill,
// based on the categories of skills they already offer.
exports.getRecommendedRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const [mySkills, openRequests] = await Promise.all([
      MarketplaceSkill.find({ mentor: userId }),
      SkillRequest.find({ status: "posted", userId: { $ne: userId } }).populate(
        "userId",
        "fullName profilePicture"
      ),
    ]);

    if (mySkills.length === 0) {
      return res.json({
        success: true,
        count: 0,
        requests: [],
        message: "Offer a skill to start seeing matching requests here.",
      });
    }

    const myCategories = new Set(mySkills.map((s) => s.category));
    const myDifficulties = new Set(mySkills.map((s) => s.difficultyLevel));

    const scored = openRequests.map((request) => {
      let score = 0;
      if (myCategories.has(request.skillCategory)) score += 3;
      if (myDifficulties.has(request.difficultyLevel)) score += 1;
      return { request, score };
    });

    const recommendations = scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((s) => s.request);

    res.json({
      success: true,
      count: recommendations.length,
      requests: recommendations,
    });
  } catch (error) {
    console.error("Get Recommended Requests Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch recommended requests.",
    });
  }
};