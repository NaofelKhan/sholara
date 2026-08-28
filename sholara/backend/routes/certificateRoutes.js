const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  generateCertificate,
  getMyCertificates,
  getCertificateByBooking,
  getCertificateById,
  verifyCertificate,
} = require("../controllers/certificateController");

// Public verification endpoint
router.get("/verify/:code", verifyCertificate);

// Protected endpoints
router.use(protect);
router.post("/generate", generateCertificate);
router.get("/my-certificates", getMyCertificates);
router.get("/booking/:bookingId", getCertificateByBooking);
router.get("/:id", getCertificateById);

module.exports = router;
