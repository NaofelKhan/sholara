const Availability = require('../models/Availability');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { notifyUser } = require('../utils/notificationService');

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

    // Notify the faculty member
    try {
      await notifyUser({
        recipient: facultyId,
        sender: studentId,
        type: 'appointment',
        title: 'New Appointment Scheduled',
        message: `${req.user.fullName || 'A student'} booked an appointment on ${slot.date} (${slot.startTime} - ${slot.endTime}) for "${reason}".`,
        link: '/calendar',
        metadata: { appointmentId: appointment._id, date: slot.date },
      });
    } catch (notifErr) {
      console.error('Failed to notify faculty for appointment:', notifErr);
    }

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
      .populate('faculty', 'fullName email department')
      .sort({ date: 1, startTime: 1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving appointments', error: error.message });
  }
};

// @desc    Appointments where the user is student or faculty
// @route   GET /api/appointments/mine
// @access  Private
exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      $or: [{ student: req.user.id }, { faculty: req.user.id }],
    })
      .populate('faculty', 'fullName email department')
      .populate('student', 'fullName email department')
      .sort({ date: 1, startTime: 1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving appointments', error: error.message });
  }
};

// @desc    Faculty/teacher list for booking appointments
// @route   GET /api/appointments/faculty
// @access  Private
exports.listFaculty = async (req, res) => {
  try {
    const faculty = await User.find({
      role: { $in: ['faculty', 'teacher'] },
    }).select('fullName department role');

    res.status(200).json(faculty);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving faculty', error: error.message });
  }
};