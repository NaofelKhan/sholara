const Booking = require("../models/Booking");
const MarketplaceSkill = require("../models/MarketplaceSkill");

// POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const {
      skillId,
      scheduledAt,
      duration,
      sessionType,
      meetingLink,
      location,
      notes,
    } = req.body;

    if (!skillId || !scheduledAt || !sessionType) {
      return res.status(400).json({
        success: false,
        message: "Skill, scheduled date/time, and session type are required.",
      });
    }

    const skill = await MarketplaceSkill.findById(skillId).populate(
      "mentor",
      "fullName email"
    );

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found.",
      });
    }

    if (skill.mentor._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot book your own skill session.",
      });
    }

    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid future date and time.",
      });
    }

    const sessionDuration = Number(duration) || skill.estimatedDuration || 60;
    const sessionEnd = new Date(
      scheduledDate.getTime() + sessionDuration * 60 * 1000
    );

    const conflict = await Booking.findOne({
      $or: [{ student: req.user._id }, { mentor: skill.mentor._id }],
      status: { $in: ["pending", "confirmed", "rescheduled"] },
      scheduledAt: {
        $lt: sessionEnd,
        $gte: new Date(scheduledDate.getTime() - sessionDuration * 60 * 1000),
      },
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message:
          "There is a scheduling conflict. Please choose a different time.",
      });
    }

    const booking = await Booking.create({
      student: req.user._id,
      mentor: skill.mentor._id,
      skill: skill._id,
      scheduledAt: scheduledDate,
      duration: sessionDuration,
      sessionType,
      meetingLink: sessionType === "Online" ? meetingLink || "" : "",
      location: sessionType === "In-Person" ? location || "" : "",
      notes: notes || "",
      status: "pending",
    });

    await MarketplaceSkill.findByIdAndUpdate(skill._id, {
      $inc: { bookings: 1 },
    });

    const populated = await Booking.findById(booking._id)
      .populate("student", "fullName profilePicture department university email")
      .populate("mentor", "fullName profilePicture department university email")
      .populate(
        "skill",
        "title coverImage category estimatedDuration pricingModel price"
      );

    res.status(201).json({
      success: true,
      message: "Session booked successfully. Waiting for mentor confirmation.",
      booking: populated,
    });
  } catch (error) {
    console.error("Create Booking Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create booking.",
    });
  }
};

// GET /api/bookings
const getMyBookings = async (req, res) => {
  try {
    const { role, status } = req.query;

    const filter = {};

    if (role === "student") {
      filter.student = req.user._id;
    } else if (role === "mentor") {
      filter.mentor = req.user._id;
    } else {
      filter.$or = [{ student: req.user._id }, { mentor: req.user._id }];
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate("student", "fullName profilePicture department university email")
      .populate("mentor", "fullName profilePicture department university email")
      .populate(
        "skill",
        "title coverImage category estimatedDuration pricingModel price deliveryMethod"
      )
      .sort({ scheduledAt: 1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get Bookings Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/bookings/:id
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("student", "fullName profilePicture department university email")
      .populate("mentor", "fullName profilePicture department university email")
      .populate(
        "skill",
        "title coverImage category estimatedDuration pricingModel price deliveryMethod availabilityDays"
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    const userId = req.user._id.toString();
    if (
      booking.student._id.toString() !== userId &&
      booking.mentor._id.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this booking.",
      });
    }

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Get Booking Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PUT /api/bookings/:id/confirm
const confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (booking.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the mentor can confirm this booking.",
      });
    }

    if (booking.status !== "pending" && booking.status !== "rescheduled") {
      return res.status(400).json({
        success: false,
        message: `Cannot confirm a booking with status "${booking.status}".`,
      });
    }

    if (req.body.meetingLink) {
      booking.meetingLink = req.body.meetingLink;
    }
    if (req.body.location) {
      booking.location = req.body.location;
    }

    booking.status = "confirmed";
    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate("student", "fullName profilePicture department university email")
      .populate("mentor", "fullName profilePicture department university email")
      .populate(
        "skill",
        "title coverImage category estimatedDuration pricingModel price"
      );

    res.json({
      success: true,
      message: "Booking confirmed successfully.",
      booking: populated,
    });
  } catch (error) {
    console.error("Confirm Booking Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PUT /api/bookings/:id/reschedule
const rescheduleBooking = async (req, res) => {
  try {
    const { scheduledAt, reason } = req.body;

    if (!scheduledAt) {
      return res.status(400).json({
        success: false,
        message: "New date and time are required.",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    const userId = req.user._id.toString();
    if (
      booking.student.toString() !== userId &&
      booking.mentor.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to reschedule this booking.",
      });
    }

    if (["cancelled", "completed"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot reschedule a ${booking.status} booking.`,
      });
    }

    const newDate = new Date(scheduledAt);
    if (isNaN(newDate.getTime()) || newDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid future date and time.",
      });
    }

    booking.rescheduleHistory.push({
      previousDate: booking.scheduledAt,
      newDate,
      reason: reason || "",
      changedBy: req.user._id,
    });

    booking.scheduledAt = newDate;
    booking.status = "rescheduled";
    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate("student", "fullName profilePicture department university email")
      .populate("mentor", "fullName profilePicture department university email")
      .populate(
        "skill",
        "title coverImage category estimatedDuration pricingModel price"
      );

    res.json({
      success: true,
      message: "Session rescheduled successfully.",
      booking: populated,
    });
  } catch (error) {
    console.error("Reschedule Booking Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PUT /api/bookings/:id/cancel
const cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    const userId = req.user._id.toString();
    if (
      booking.student.toString() !== userId &&
      booking.mentor.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this booking.",
      });
    }

    if (["cancelled", "completed"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Booking is already ${booking.status}.`,
      });
    }

    booking.status = "cancelled";
    booking.cancellationReason = reason || "";
    booking.cancelledBy = req.user._id;
    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate("student", "fullName profilePicture department university email")
      .populate("mentor", "fullName profilePicture department university email")
      .populate(
        "skill",
        "title coverImage category estimatedDuration pricingModel price"
      );

    res.json({
      success: true,
      message: "Booking cancelled successfully.",
      booking: populated,
    });
  } catch (error) {
    console.error("Cancel Booking Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PUT /api/bookings/:id/complete
const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (booking.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the mentor can mark this session as completed.",
      });
    }

    if (!["confirmed", "rescheduled"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot complete a booking with status "${booking.status}".`,
      });
    }

    booking.status = "completed";
    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate("student", "fullName profilePicture department university email")
      .populate("mentor", "fullName profilePicture department university email")
      .populate(
        "skill",
        "title coverImage category estimatedDuration pricingModel price"
      );

    res.json({
      success: true,
      message: "Session marked as completed.",
      booking: populated,
    });
  } catch (error) {
    console.error("Complete Booking Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  confirmBooking,
  rescheduleBooking,
  cancelBooking,
  completeBooking,
};