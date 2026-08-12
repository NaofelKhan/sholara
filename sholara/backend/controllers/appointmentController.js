const Availability = require('../models/Availability');
const Appointment = require('../models/Appointment');

// @desc    Get available time slots for a specific faculty on a given date
// @route   GET /api/appointments/slots/:facultyId?date=YYYY-MM-DD
// @access  Private (Student)
exports.getFacultySlots = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Date query parameter is required.' });
    }

    const slots = await Availability.find({
      faculty: facultyId,
      date,
      isBooked: false,
    }).sort({ startTime: 1 });

    res.status(200).json(slots);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching slots', error: error.message });
  }
};

// @desc    Book an appointment with a faculty member
// @route   POST /api/appointments/book
// @access  Private (Student)
exports.bookAppointment = async (req, res) => {
  try {
    const { facultyId, slotId, reason } = req.body;
    const studentId = req.user.id; // Extracted from auth middleware

    if (!facultyId || !slotId || !reason) {
      return res.status(400).json({ message: 'Faculty, Slot ID, and Reason are required.' });
    }

    // Atomic update to ensure no race conditions double-booking the slot
    const slot = await Availability.findOneAndUpdate(
      { _id: slotId, faculty: facultyId, isBooked: false },
      { isBooked: true },
      { new: true }
    );

    if (!slot) {
      return res.status(400).json({ message: 'Selected time slot is no longer available.' });
    }

    // Create the appointment record
    const appointment = await Appointment.create({
      student: studentId,
      faculty: facultyId,
      slot: slot._id,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      reason,
    });

    res.status(201).json({
      message: 'Appointment scheduled successfully',
      appointment,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error scheduling appointment', error: error.message });
  }
};

// @desc    Get appointments for the logged-in student
// @route   GET /api/appointments/student
// @access  Private (Student)
exports.getStudentAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ student: req.user.id })
      .populate('faculty', 'name email department')
      .sort({ date: 1, startTime: 1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving appointments', error: error.message });
  }
};