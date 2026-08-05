const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  createBooking,
  getMyBookings,
  getBookingById,
  confirmBooking,
  rescheduleBooking,
  cancelBooking,
  completeBooking,
} = require("../controllers/bookingController");

router.use(protect);

router.route("/").post(createBooking).get(getMyBookings);

router.get("/:id", getBookingById);

router.put("/:id/confirm", confirmBooking);
router.put("/:id/reschedule", rescheduleBooking);
router.put("/:id/cancel", cancelBooking);
router.put("/:id/complete", completeBooking);

module.exports = router;