const express = require('express');
const router = express.Router();
const {
  getFacultySlots,
  bookAppointment,
  getStudentAppointments,
  getMyAppointments,
  listFaculty,
  createAvailability,
  getMyAvailability,
  deleteAvailability,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware'); // Authentication middleware

router.get('/slots/:facultyId', protect, getFacultySlots);
router.post('/book', protect, bookAppointment);
router.get('/student', protect, getStudentAppointments);
router.get('/mine', protect, getMyAppointments);
router.get('/faculty', protect, listFaculty);

router.post('/availability', protect, createAvailability);
router.get('/availability/mine', protect, getMyAvailability);
router.delete('/availability/:id', protect, deleteAvailability);

module.exports = router;