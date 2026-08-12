const express = require('express');
const router = express.Router();
const {
  getFacultySlots,
  bookAppointment,
  getStudentAppointments,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware'); // Authentication middleware

router.get('/slots/:facultyId', protect, getFacultySlots);
router.post('/book', protect, bookAppointment);
router.get('/student', protect, getStudentAppointments);

module.exports = router;