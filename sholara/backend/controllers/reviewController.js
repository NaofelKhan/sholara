const Review = require("../models/Review");
const Booking = require("../models/Booking");
const MarketplaceSkill = require("../models/MarketplaceSkill");
const { notifyUser } = require("../utils/notificationService");

// POST /api/reviews - Submit rating and review for a completed session
exports.createReview = async (req, res) => {
  try {
    const { bookingId, rating, feedback, tags } = req.body;
    const userId = req.user._id;

    if (!bookingId || !rating || !feedback) {
      return res.status(400).json({
        message: "Booking ID, rating (1-5), and feedback comments are required.",
      });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: "Rating must be a number between 1 and 5." });
    }

    const booking = await Booking.findById(bookingId)
      .populate("student", "fullName email profilePicture")
      .populate("mentor", "fullName email profilePicture")
      .populate("skill", "title");

    if (!booking) {
      return res.status(404).json({ message: "Booking session not found." });
    }

    if (booking.status !== "completed") {
      return res.status(400).json({
        message: "You can only rate and review completed skill exchange sessions.",
      });
    }

    const isStudent = booking.student._id.toString() === userId.toString();
    const isMentor = booking.mentor._id.toString() === userId.toString();

    if (!isStudent && !isMentor) {
      return res.status(403).json({
        message: "You are not an authorized participant of this skill session.",
      });
    }

    const reviewerRole = isStudent ? "student" : "mentor";
    const revieweeId = isStudent ? booking.mentor._id : booking.student._id;

    // Check if already reviewed
    const existingReview = await Review.findOne({
      booking: bookingId,
      reviewer: userId,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You have already submitted a review for this skill exchange session.",
      });
    }

    const review = await Review.create({
      booking: bookingId,
      skill: booking.skill?._id || null,
      reviewer: userId,
      reviewee: revieweeId,
      reviewerRole,
      rating: numRating,
      feedback: feedback.trim(),
      tags: Array.isArray(tags) ? tags : [],
    });

    // If student rated mentor's marketplace skill, update skill average rating & reviews count
    if (isStudent && booking.skill) {
      const skillReviews = await Review.find({
        skill: booking.skill._id,
        reviewerRole: "student",
      });

      const totalReviews = skillReviews.length;
      const avgRating =
        skillReviews.reduce((sum, r) => sum + r.rating, 0) / (totalReviews || 1);

      await MarketplaceSkill.findByIdAndUpdate(booking.skill._id, {
        rating: Number(avgRating.toFixed(1)),
        totalReviews,
      });
    }

    // Send notification to reviewee
    await notifyUser({
      recipient: revieweeId,
      sender: userId,
      type: "review",
      title: "New Partner Review Received",
      message: `${req.user.fullName} left you a ${numRating}★ review for "${
        booking.skill?.title || "Skill Session"
      }".`,
      link: "/my-sessions",
      metadata: { bookingId, reviewId: review._id },
    });

    const populatedReview = await Review.findById(review._id)
      .populate("reviewer", "fullName email profilePicture department")
      .populate("reviewee", "fullName email profilePicture department");

    res.status(201).json({
      success: true,
      message: "Review submitted successfully!",
      review: populatedReview,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "You have already submitted a review for this session.",
      });
    }
    res.status(500).json({
      message: "Failed to submit review",
      error: error.message,
    });
  }
};

// GET /api/reviews/booking/:bookingId - Get review for a specific booking
exports.getBookingReview = async (req, res) => {
  try {
    const reviews = await Review.find({ booking: req.params.bookingId })
      .populate("reviewer", "fullName email profilePicture department role")
      .populate("reviewee", "fullName email profilePicture department role");

    res.json(reviews);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch session review",
      error: error.message,
    });
  }
};

// GET /api/reviews/user/:userId - Get all reviews received by a user
exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate("reviewer", "fullName email profilePicture department")
      .populate("skill", "title category")
      .sort({ createdAt: -1 });

    const total = reviews.length;
    const averageRating =
      total > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1)
        : 5.0;

    res.json({
      reviews,
      total,
      averageRating: Number(averageRating),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch user reviews",
      error: error.message,
    });
  }
};

// GET /api/reviews/skill/:skillId - Get all reviews for a marketplace skill
exports.getSkillReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ skill: req.params.skillId })
      .populate("reviewer", "fullName email profilePicture department")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch skill reviews",
      error: error.message,
    });
  }
};
