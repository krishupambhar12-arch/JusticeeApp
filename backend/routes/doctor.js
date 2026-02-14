// back-end/routes/doctor.js (attorney routes; mounted at /attorney)
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Attorney = require("../models/Attorney");
const User = require("../models/User");
const multer = require("multer");
const path = require("path");
const Consultation = require("../models/Consultation");
const ConsultationMessage = require("../models/ConsultationMessage");
let Appointment;
try { Appointment = require("../models/Appointment"); } catch {}

// ===== Multer setup for file upload =====
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // uploads/ folder root me hona chahiye
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ===== POST Attorney Details =====
router.post("/details", upload.single("profile_pic"), async (req, res) => {
  try {
    const { userId, specialization, qualification, experience, fees } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "❌ userId is required" });
    }

    const attorney = new Attorney({
      userId,
      specialization,
      qualification,
      experience,
      fees,
      profile_pic: req.file ? `/uploads/${req.file.filename}` : null,
    });

    await attorney.save();

    res.status(201).json({
      message: "✅ Attorney details saved successfully",
      attorney,
    });
  } catch (error) {
    console.error("❌ Attorney details error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== UPDATE Attorney Profile =====
// PUT /attorney/profile  (auth required)
// Accepts multipart/form-data for optional profile_pic
router.put("/profile", auth, upload.single("profile_pic"), async (req, res) => {
  try {
    // Update attorney fields
    const { specialization, qualification, experience, fees } = req.body;

    const attorney = await Attorney.findOne({ userId: req.userId });
    if (!attorney) return res.status(404).json({ message: "Attorney profile not found" });

    if (specialization !== undefined) attorney.specialization = specialization;
    if (qualification !== undefined) attorney.qualification = qualification;
    if (experience !== undefined) attorney.experience = Number(experience);
    if (fees !== undefined) attorney.fees = Number(fees);
    if (req.file) attorney.profile_pic = `/uploads/${req.file.filename}`;

    await attorney.save();

    // Optionally update user fields if provided
    const { name, email, phone, address } = req.body;
    let user;
    if (name !== undefined || email !== undefined || phone !== undefined || address !== undefined) {
      user = await User.findById(req.userId);
      if (user) {
        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;
        if (phone !== undefined) user.phone = phone;
        if (address !== undefined) user.address = address;
        await user.save();
      }
    }

    return res.json({
      message: "✅ Profile updated successfully",
      attorney: {
        id: attorney._id,
        specialization: attorney.specialization,
        qualification: attorney.qualification,
        experience: attorney.experience,
        fees: attorney.fees,
        profile_pic: attorney.profile_pic,
      },
      user: user
        ? { id: user._id, name: user.name, email: user.email, phone: user.phone, address: user.address }
        : undefined,
    });
  } catch (e) {
    console.error("Update profile error:", e);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /attorney/dashboard  -> Attorney + today's appointments count
router.get("/dashboard", auth, async (req, res) => {
  try {
    // Attorney profile (linked by userId)
    const attorney = await Attorney.findOne({ userId: req.userId }).lean();
    if (!attorney) return res.status(404).json({ message: "Attorney profile not found" });

    // linked user for name/email
    const user = await User.findById(req.userId).lean();

    // Stats (0 if Appointment model not present)
    let todayCount = 0;
    let totalClients = 0;
    let upcomingAppointments = 0;
    let earnings = 0;

    if (Appointment) {
      const start = new Date(); start.setHours(0,0,0,0);
      const end = new Date();   end.setHours(23,59,59,999);

      // today count
      todayCount = await Appointment.countDocuments({
        doctor_id: attorney._id,
        date: { $gte: start, $lte: end },
        status: { $ne: "Cancelled" }
      });
      


      // total unique clients seen by this attorney
      const uniqueClients = await Appointment.distinct("user_id", { doctor_id: attorney._id });
      totalClients = uniqueClients.length;
      


      // upcoming appointments from now (status pending/confirmed)
      upcomingAppointments = await Appointment.countDocuments({
        doctor_id: attorney._id,
        date: { $gte: new Date() },
        status: { $in: ["Pending", "Confirmed"] }
      });

      // simple earnings estimate = total completed appointments * fees
      const completedCount = await Appointment.countDocuments({
        doctor_id: attorney._id,
        status: { $in: ["Completed", "Done", "Approved"] }
      });
      earnings = completedCount * (attorney.fees || 0);
    }

    res.json({
      doctor: {
        id: attorney._id,
        name: user?.name || "Attorney",
        email: user?.email || "",
        phone: user?.phone || "",
        address: user?.address || "",
        specialization: attorney.specialization,
        qualification: attorney.qualification,
        experience: attorney.experience,
        fees: attorney.fees,
        profile_pic: attorney.profile_pic // e.g. "/uploads/xyz.png"
      },
      stats: {
        todayAppointments: todayCount,
        totalClients,
        upcomingAppointments,
        earnings
      }
    });
  } catch (e) {
    console.error("Dashboard error:", e);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== GET Attorney Appointments =====
// GET /attorney/appointments  -> All appointments for this attorney
router.get("/appointments", auth, async (req, res) => {
  try {
    // Find attorney profile
    const attorney = await Attorney.findOne({ userId: req.userId }).lean();
    if (!attorney) return res.status(404).json({ message: "Attorney profile not found" });

    // Get all appointments for this attorney
    let appointments = [];
    if (Appointment) {
      appointments = await Appointment.find({ doctor_id: attorney._id })
        .populate('user_id', 'name email phone')
        .sort({ date: 1, time: 1 })
        .lean();
    }

    // Format appointments for frontend
    const formattedAppointments = appointments.map(appt => ({
      id: appt._id,
      client: appt.user_id?.name || "Unknown Client",
      clientEmail: appt.user_id?.email || "",
      clientPhone: appt.user_id?.phone || "",
      date: new Date(appt.date).toISOString().split('T')[0],
      time: appt.time,
      status: appt.status,
      createdAt: appt.createdAt
    }));

    res.json({
      appointments: formattedAppointments,
      total: formattedAppointments.length
    });
  } catch (e) {
    console.error("Appointments error:", e);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== GET All Attorneys (Public) =====
// GET /attorney/all  -> Get all attorneys for public listing
router.get("/all", async (req, res) => {
  try {
    const { specialization, search } = req.query;
    
    // Build query
    let query = {};
    
    // Filter by specialization if provided
    if (specialization && specialization !== 'all') {
      query.specialization = { $regex: specialization, $options: 'i' };
    }
    
    // Get all attorneys with populated user data
    let attorneys = await Attorney.find(query)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();
    
    // Apply search filter if provided
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      attorneys = attorneys.filter(attorney => 
        attorney.userId?.name?.match(searchRegex) ||
        attorney.specialization?.match(searchRegex) ||
        attorney.qualification?.match(searchRegex)
      );
    }
    
    // Format for frontend
    const formattedAttorneys = attorneys.map(attorney => ({
      id: attorney._id,
      name: attorney.userId?.name || "Attorney Unknown",
      email: attorney.userId?.email || "",
      phone: attorney.userId?.phone || "",
      specialization: attorney.specialization,
      qualification: attorney.qualification,
      experience: attorney.experience,
      fees: attorney.fees,
      profile_pic: attorney.profile_pic,
      rating: 4.5, // You can add rating system later
      available: true
    }));
    
    res.json({
      attorneys: formattedAttorneys,
      total: formattedAttorneys.length
    });
  } catch (e) {
    console.error("Get all doctors error:", e);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== POST Book Appointment =====
router.post("/book-appointment", auth, async (req, res) => {
  try {
    // Check if user is a client
    if (req.userRole !== "Client") {
      return res.status(403).json({ message: "Only clients can book appointments" });
    }

    const { doctor_id, date, time, symptoms, notes } = req.body;

    if (!doctor_id || !date || !time) {
      return res.status(400).json({ message: "Attorney ID, date, and time are required" });
    }

    // Check if attorney exists
    const attorney = await Attorney.findById(doctor_id);
    if (!attorney) {
      return res.status(404).json({ message: "Attorney not found" });
    }

    // Check if user is trying to book appointment with themselves (if they are an attorney)
    if (req.userRole === "Attorney") {
      const userAttorney = await Attorney.findOne({ userId: req.userId });
      if (userAttorney && userAttorney._id.toString() === doctor_id) {
        return res.status(400).json({ message: "Attorneys cannot book appointments with themselves" });
      }
    }

    // Check if appointment already exists for this time slot
    const existingAppointment = await Appointment.findOne({
      doctor_id,
      date,
      time,
      status: { $in: ["Pending", "Upcoming"] }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: "This time slot is already booked" });
    }

    // Create new appointment
    const appointment = new Appointment({
      user_id: req.userId,
      doctor_id,
      date,
      time,
      symptoms: symptoms || "",
      notes: notes || "",
      status: "Pending"
    });

    await appointment.save();
    


    res.status(201).json({
      message: "Appointment booked successfully",
      appointment: {
        id: appointment._id,
        doctor_id: appointment.doctor_id,
        date: appointment.date,
        time: appointment.time,
        status: appointment.status
      }
    });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({ message: "Failed to book appointment" });
  }
});

// ===== GET Attorney Consultations =====
router.get("/consultations", auth, async (req, res) => {
  try {
    // Check if user is an attorney
    if (req.userRole !== "Attorney") {
      return res.status(403).json({ message: "Only attorneys can access this endpoint" });
    }

    // Find attorney by userId
    const attorney = await Attorney.findOne({ userId: req.userId });
    if (!attorney) {
      return res.status(404).json({ message: "Attorney profile not found" });
    }

    const consultations = await Consultation.find({ doctor_id: attorney._id })
      .populate('patient_id', 'name email')
      .sort({ updatedAt: -1 })
      .lean();

    const formattedConsultations = consultations.map(consultation => ({
      id: consultation._id,
      patient_name: consultation.patient_id?.name || "Unknown",
      patient_email: consultation.patient_id?.email || "",
      status: consultation.status,
      subject: consultation.subject || "",
      createdAt: consultation.createdAt,
      updatedAt: consultation.updatedAt
    }));

    res.json({
      consultations: formattedConsultations,
      total: formattedConsultations.length
    });
  } catch (error) {
    console.error("Get doctor consultations error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== SEND Message in Consultation (Attorney) =====
router.post("/consultation/:consultationId/message", auth, async (req, res) => {
  try {
    // Check if user is an attorney
    if (req.userRole !== "Attorney") {
      return res.status(403).json({ message: "Only attorneys can send messages" });
    }

    const { consultationId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Find attorney by userId
    const attorney = await Attorney.findOne({ userId: req.userId });
    if (!attorney) {
      return res.status(404).json({ message: "Attorney profile not found" });
    }

    // Check if consultation exists and belongs to this attorney
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    if (consultation.doctor_id.toString() !== attorney._id.toString()) {
      return res.status(403).json({ message: "Unauthorized access to this consultation" });
    }

    // Create message
    const consultationMessage = new ConsultationMessage({
      consultation_id: consultationId,
      sender_id: req.userId,
      sender_role: 'Attorney',
      message: message.trim()
    });

    await consultationMessage.save();

    // Update consultation updatedAt
    await Consultation.findByIdAndUpdate(consultationId, { updatedAt: new Date() });

    res.status(201).json({
      message: "Message sent successfully",
      messageData: {
        id: consultationMessage._id,
        message: consultationMessage.message,
        sender_role: consultationMessage.sender_role,
        createdAt: consultationMessage.createdAt
      }
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== GET Messages for Consultation (Attorney) =====
router.get("/consultation/:consultationId/messages", auth, async (req, res) => {
  try {
    // Check if user is an attorney
    if (req.userRole !== "Attorney") {
      return res.status(403).json({ message: "Only attorneys can access this endpoint" });
    }

    const { consultationId } = req.params;

    // Find attorney by userId
    const attorney = await Attorney.findOne({ userId: req.userId });
    if (!attorney) {
      return res.status(404).json({ message: "Attorney profile not found" });
    }

    // Check if consultation exists and belongs to this attorney
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    if (consultation.doctor_id.toString() !== attorney._id.toString()) {
      return res.status(403).json({ message: "Unauthorized access to this consultation" });
    }

    // Get all messages for this consultation
    const messages = await ConsultationMessage.find({ consultation_id: consultationId })
      .populate('sender_id', 'name')
      .sort({ createdAt: 1 })
      .lean();

    const formattedMessages = messages.map(msg => ({
      id: msg._id,
      message: msg.message,
      sender_role: msg.sender_role,
      sender_name: msg.sender_id?.name || "Unknown",
      createdAt: msg.createdAt,
      read: msg.read
    }));

    // Mark client messages as read
    await ConsultationMessage.updateMany(
      { consultation_id: consultationId, sender_role: 'Client', read: false },
      { read: true }
    );

    res.json({
      messages: formattedMessages,
      total: formattedMessages.length
    });
  } catch (error) {
    console.error("Get consultation messages error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;