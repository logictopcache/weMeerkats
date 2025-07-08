const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Mentor = require("../models/mentorSchema");
const Learner = require("../models/learnerSchema");
const appointmentService = require("../services/appointmentService");

// Auth middleware
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization token required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Try to find either a learner or mentor
    const learner = await Learner.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    const mentor = await Mentor.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!learner && !mentor) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    req.token = token;
    if (learner) {
      req.user = learner;
      req.userType = "Learner";
    } else {
      req.user = mentor;
      req.userType = "Mentor";
    }
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Book a new appointment
router.post("/book", authMiddleware, async (req, res) => {
  try {
    const { mentorId, appointmentDateTime, duration, skill } = req.body;

    // Validate required fields
    if (!mentorId || !appointmentDateTime || !skill) {
      return res.status(400).json({
        error: "Missing required fields: mentorId, appointmentDateTime, skill",
      });
    }

    // Only learners can book appointments
    if (req.userType !== "Learner") {
      return res.status(403).json({
        error: "Only learners can book appointments",
      });
    }

    // Validate appointment time (must be in the future)
    const appointmentTime = new Date(appointmentDateTime);
    const now = new Date();
    if (appointmentTime <= now) {
      return res.status(400).json({
        error: "Appointment time must be in the future",
      });
    }

    // Book the appointment
    const result = await appointmentService.bookAppointment({
      mentorId,
      learnerId: req.user._id,
      appointmentDateTime,
      duration: duration || 60,
      skill,
      bookedBy: "mentee",
    });

    res.json({
      success: true,
      message: "Appointment booked successfully",
      appointment: result.appointment,
      calendar: result.calendar,
      calendarIntegrated: !!result.calendar,
    });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({
      error: "Failed to book appointment",
      details: error.message,
    });
  }
});

// Accept an appointment (mentors only)
router.post("/:appointmentId/accept", authMiddleware, async (req, res) => {
  try {
    const { appointmentId } = req.params;

    // Only mentors can accept appointments
    if (req.userType !== "Mentor") {
      return res.status(403).json({
        error: "Only mentors can accept appointments",
      });
    }

    const result = await appointmentService.acceptAppointment(
      appointmentId,
      req.user._id
    );

    res.json({
      success: true,
      message: "Appointment accepted successfully",
      appointment: result.appointment,
    });
  } catch (error) {
    console.error("Error accepting appointment:", error);
    res.status(500).json({
      error: "Failed to accept appointment",
      details: error.message,
    });
  }
});

/**
 * Cancel an appointment
 */
router.post("/:appointmentId/cancel", authMiddleware, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { reason } = req.body;

    const result = await appointmentService.cancelAppointment(
      appointmentId,
      req.user._id,
      reason
    );

    res.json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment: result.appointment,
    });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({
      error: "Failed to cancel appointment",
      details: error.message,
    });
  }
});

// Get user's appointments
router.get("/my-appointments", authMiddleware, async (req, res) => {
  try {
    const { status, dateFrom, dateTo, limit = 50 } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;

    const appointments = await appointmentService.getUserAppointments(
      req.user._id,
      req.userType,
      filters
    );

    // Limit results
    const limitedAppointments = appointments.slice(0, parseInt(limit));

    res.json({
      success: true,
      appointments: limitedAppointments,
      total: appointments.length,
      userType: req.userType,
    });
  } catch (error) {
    console.error("Error getting appointments:", error);
    res.status(500).json({
      error: "Failed to get appointments",
      details: error.message,
    });
  }
});

// Get specific appointment details
router.get("/:appointmentId", authMiddleware, async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await appointmentService.getUserAppointments(
      req.user._id,
      req.userType,
      {}
    );

    const specificAppointment = appointment.find(
      (app) => app._id.toString() === appointmentId
    );

    if (!specificAppointment) {
      return res.status(404).json({
        error: "Appointment not found or not accessible",
      });
    }

    res.json({
      success: true,
      appointment: specificAppointment,
    });
  } catch (error) {
    console.error("Error getting appointment:", error);
    res.status(500).json({
      error: "Failed to get appointment",
      details: error.message,
    });
  }
});

// Sync appointment with calendar (manual sync)
router.post(
  "/:appointmentId/sync-calendar",
  authMiddleware,
  async (req, res) => {
    try {
      const { appointmentId } = req.params;

      // Only mentors can sync calendar (since calendar is created on mentor's account)
      if (req.userType !== "Mentor") {
        return res.status(403).json({
          error: "Only mentors can sync calendar",
        });
      }

      const result = await appointmentService.syncAppointmentWithCalendar(
        appointmentId
      );

      res.json({
        success: true,
        message: "Appointment synced with calendar",
        appointment: result.appointment,
      });
    } catch (error) {
      console.error("Error syncing appointment:", error);
      res.status(500).json({
        error: "Failed to sync appointment with calendar",
        details: error.message,
      });
    }
  }
);

// Get upcoming appointments (next 7 days)
router.get("/upcoming/week", authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    const appointments = await appointmentService.getUserAppointments(
      req.user._id,
      req.userType,
      {
        dateFrom: now,
        dateTo: nextWeek,
        status: "accepted",
      }
    );

    res.json({
      success: true,
      appointments: appointments,
      period: "next-7-days",
    });
  } catch (error) {
    console.error("Error getting upcoming appointments:", error);
    res.status(500).json({
      error: "Failed to get upcoming appointments",
      details: error.message,
    });
  }
});

// Get appointment statistics
router.get("/stats/summary", authMiddleware, async (req, res) => {
  try {
    const allAppointments = await appointmentService.getUserAppointments(
      req.user._id,
      req.userType,
      {}
    );

    const stats = {
      total: allAppointments.length,
      pending: allAppointments.filter((app) => app.status === "pending").length,
      accepted: allAppointments.filter((app) => app.status === "accepted")
        .length,
      completed: allAppointments.filter((app) => app.status === "completed")
        .length,
      cancelled: allAppointments.filter((app) => app.status === "cancelled")
        .length,
      withCalendar: allAppointments.filter(
        (app) => app.googleCalendar?.calendarSynced
      ).length,
      thisMonth: allAppointments.filter((app) => {
        const appDate = new Date(app.appointmentDateTime);
        const now = new Date();
        return (
          appDate.getMonth() === now.getMonth() &&
          appDate.getFullYear() === now.getFullYear()
        );
      }).length,
    };

    res.json({
      success: true,
      stats: stats,
      userType: req.userType,
    });
  } catch (error) {
    console.error("Error getting appointment stats:", error);
    res.status(500).json({
      error: "Failed to get appointment statistics",
      details: error.message,
    });
  }
});

// Check time slot availability
router.post("/check-availability", authMiddleware, async (req, res) => {
  try {
    const { mentorId, appointmentDateTime, duration = 60 } = req.body;

    if (!mentorId || !appointmentDateTime) {
      return res.status(400).json({
        error: "Missing required fields: mentorId, appointmentDateTime",
      });
    }

    const conflict = await appointmentService.checkAppointmentConflict(
      mentorId,
      req.user._id,
      appointmentDateTime,
      duration
    );

    res.json({
      success: true,
      available: !conflict,
      conflict: conflict
        ? {
            id: conflict._id,
            time: conflict.appointmentDateTime,
            duration: conflict.duration,
            status: conflict.status,
          }
        : null,
    });
  } catch (error) {
    console.error("Error checking availability:", error);
    res.status(500).json({
      error: "Failed to check availability",
      details: error.message,
    });
  }
});

module.exports = router;
