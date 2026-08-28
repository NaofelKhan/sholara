const crypto = require("crypto");
const Certificate = require("../models/Certificate");
const Booking = require("../models/Booking");
const { notifyUser } = require("../utils/notificationService");

// Helper to generate formatted certificate ID
const generateCertificateId = () => {
  const year = new Date().getFullYear();
  const randomStr = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `SCH-CERT-${year}-${randomStr}`;
};

// Helper to generate verification hash code
const generateVerificationCode = (certId, userId) => {
  return crypto
    .createHash("sha256")
    .update(`${certId}-${userId}-${Date.now()}`)
    .digest("hex")
    .substring(0, 16)
    .toUpperCase();
};

// POST /api/certificates/generate - Issue certificate for completed booking
exports.generateCertificate = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user._id;

    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required." });
    }

    const booking = await Booking.findById(bookingId)
      .populate("student", "fullName email studentId department university")
      .populate("mentor", "fullName email studentId department university")
      .populate("skill", "title category estimatedDuration");

    if (!booking) {
      return res.status(404).json({ message: "Session booking not found." });
    }

    if (booking.status !== "completed") {
      return res.status(400).json({
        message: "Certificates are only issued for successfully completed skill exchange sessions.",
      });
    }

    // Both student and mentor can claim/view their completion certificate
    const isStudent = booking.student._id.toString() === userId.toString();
    const isMentor = booking.mentor._id.toString() === userId.toString();

    if (!isStudent && !isMentor) {
      return res.status(403).json({
        message: "You are not authorized to access this certificate.",
      });
    }

    const recipientId = isStudent ? booking.student._id : booking.mentor._id;
    const issuerId = isStudent ? booking.mentor._id : booking.student._id;

    // Check if certificate already exists
    let certificate = await Certificate.findOne({
      booking: bookingId,
      recipient: recipientId,
    })
      .populate("recipient", "fullName email studentId department university profilePicture")
      .populate("issuer", "fullName email department university profilePicture")
      .populate("skill", "title category");

    if (certificate) {
      return res.json({
        success: true,
        message: "Certificate retrieved successfully.",
        certificate,
      });
    }

    const certId = generateCertificateId();
    const verificationCode = generateVerificationCode(certId, recipientId);
    const hours = (booking.duration || 60) / 60;

    certificate = await Certificate.create({
      certificateId: certId,
      recipient: recipientId,
      issuer: issuerId,
      booking: booking._id,
      skill: booking.skill?._id || null,
      skillTitle: booking.skill?.title || "Skill Exchange Program",
      category: booking.skill?.category || "Skill Exchange",
      hoursCompleted: Number(hours.toFixed(1)),
      issueDate: new Date(),
      status: "issued",
      verificationCode,
      metadata: {
        mentorName: booking.mentor.fullName,
        studentName: booking.student.fullName,
        sessionType: booking.sessionType,
      },
    });

    const populated = await Certificate.findById(certificate._id)
      .populate("recipient", "fullName email studentId department university profilePicture")
      .populate("issuer", "fullName email department university profilePicture")
      .populate("skill", "title category");

    // Send notification
    await notifyUser({
      recipient: recipientId,
      sender: issuerId,
      type: "certificate",
      title: "Skill Completion Certificate Issued!",
      message: `Congratulations! You received a Completion Certificate for "${
        booking.skill?.title || "Skill Exchange"
      }".`,
      link: "/certificates",
      metadata: { certificateId: populated._id },
    });

    res.status(201).json({
      success: true,
      message: "Certificate generated successfully!",
      certificate: populated,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate completion certificate",
      error: error.message,
    });
  }
};

// GET /api/certificates/my-certificates - Get all certificates earned by logged in user
exports.getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ recipient: req.user._id })
      .populate("recipient", "fullName email studentId department university profilePicture")
      .populate("issuer", "fullName email department university profilePicture")
      .populate("skill", "title category")
      .sort({ issueDate: -1 });

    res.json(certificates);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch your certificates",
      error: error.message,
    });
  }
};

// GET /api/certificates/booking/:bookingId - Get certificate for a specific booking
exports.getCertificateByBooking = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      booking: req.params.bookingId,
      recipient: req.user._id,
    })
      .populate("recipient", "fullName email studentId department university profilePicture")
      .populate("issuer", "fullName email department university profilePicture")
      .populate("skill", "title category");

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found for this session." });
    }

    res.json(certificate);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch certificate",
      error: error.message,
    });
  }
};

// GET /api/certificates/:id - Get certificate details by ID
exports.getCertificateById = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate("recipient", "fullName email studentId department university profilePicture")
      .populate("issuer", "fullName email department university profilePicture")
      .populate("skill", "title category");

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found." });
    }

    res.json(certificate);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch certificate details",
      error: error.message,
    });
  }
};

// GET /api/certificates/verify/:code - Public verification endpoint
exports.verifyCertificate = async (req, res) => {
  try {
    const { code } = req.params;
    const certificate = await Certificate.findOne({
      $or: [{ verificationCode: code.toUpperCase() }, { certificateId: code.toUpperCase() }],
      status: "issued",
    })
      .populate("recipient", "fullName department university")
      .populate("issuer", "fullName department university")
      .populate("skill", "title category");

    if (!certificate) {
      return res.status(404).json({
        verified: false,
        message: "Invalid or unverified certificate code.",
      });
    }

    res.json({
      verified: true,
      certificate,
    });
  } catch (error) {
    res.status(500).json({
      message: "Verification failed",
      error: error.message,
    });
  }
};
