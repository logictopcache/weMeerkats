const Appointment = require("../models/appointmentSchema");
const GoogleOAuth = require("../models/googleOAuthSchema");
const Mentor = require("../models/mentorSchema");
const Learner = require("../models/learnerSchema");
const googleCalendarService = require("./googleCalendarService");
const emailService = require("./emailService");
const { NotificationService } = require("../util/notificationService");

class AppointmentService {
  // Book a new appointment with Google Calendar integration
  async bookAppointment(appointmentData) {
    try {
      const {
        mentorId,
        learnerId,
        appointmentDateTime,
        duration = 60,
        skill,
        bookedBy = "mentee", // 'mentee' or 'mentor'
      } = appointmentData;

      // Validate required fields
      if (!mentorId || !learnerId || !appointmentDateTime || !skill) {
        throw new Error("Missing required appointment data");
      }

      // Get mentor and learner details
      const mentor = await Mentor.findById(mentorId);
      const learner = await Learner.findById(learnerId);

      if (!mentor || !learner) {
        throw new Error("Mentor or learner not found");
      }

      // Check for conflicts
      const existingAppointment = await this.checkAppointmentConflict(
        mentorId,
        learnerId,
        appointmentDateTime,
        duration
      );

      if (existingAppointment) {
        throw new Error("Time slot already booked");
      }

      // Create appointment record
      const appointment = new Appointment({
        mentorId,
        learnerId,
        appointmentDateTime: new Date(appointmentDateTime),
        duration,
        skill,
        status: "pending",
        mentorName: `${mentor.firstName} ${mentor.lastName}`,
        learnerName: `${learner.firstName} ${learner.lastName}`,
        statusHistory: [
          {
            status: "pending",
            updatedBy: bookedBy === "mentee" ? learnerId : mentorId,
            updatedAt: new Date(),
            note: `Appointment booked by ${bookedBy}`,
          },
        ],
      });

      await appointment.save();

      // Try to create Google Calendar event
      let calendarResult = null;
      try {
        calendarResult = await this.createCalendarEvent(appointment);

        if (calendarResult && calendarResult.success) {
          // Update appointment with calendar details
          appointment.googleCalendar = {
            eventId: calendarResult.eventId,
            eventLink: calendarResult.eventLink,
            meetingLink: calendarResult.meetingLink,
            calendarSynced: true,
            lastSyncedAt: new Date(),
          };
          await appointment.save();
        } else if (calendarResult && !calendarResult.success) {
          // Handle expected calendar connection issues gracefully
          if (calendarResult.reason === "mentor_calendar_not_connected") {
          } else {
            console.error("Calendar creation failed:", calendarResult.message);
          }
          // Continue without calendar - store the reason
          appointment.googleCalendar = {
            calendarSynced: false,
            syncError: calendarResult.message,
          };
          await appointment.save();
        }
      } catch (calendarError) {
        // Handle unexpected errors
        console.error("Unexpected calendar error:", calendarError);
        appointment.googleCalendar = {
          calendarSynced: false,
          syncError: calendarError.message,
        };
        await appointment.save();
      }

      // Send email notifications
      try {
        await this.sendAppointmentNotifications(appointment, "booking");
      } catch (emailError) {
        console.error("Email notification failed:", emailError);
        // Continue even if email fails
      }

      // Send in-app notifications
      await this.sendInAppNotifications(appointment, "booking");

      return {
        success: true,
        appointment,
        calendar: calendarResult,
        message: "Appointment booked successfully",
      };
    } catch (error) {
      console.error("Error booking appointment:", error);
      throw new Error(`Failed to book appointment: ${error.message}`);
    }
  }

  // Accept an appointment and sync with calendar
  async acceptAppointment(appointmentId, acceptedBy) {
    try {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        throw new Error("Appointment not found");
      }

      if (appointment.status !== "pending") {
        throw new Error("Appointment is not in pending status");
      }

      // Update appointment status
      appointment.status = "accepted";
      appointment.statusHistory.push({
        status: "accepted",
        updatedBy: acceptedBy,
        updatedAt: new Date(),
        note: "Appointment accepted",
      });

      await appointment.save();

      // Update calendar event if exists
      if (appointment.googleCalendar?.eventId) {
        try {
          await this.updateCalendarEvent(appointment);
        } catch (calendarError) {
          if (
            calendarError.message === "Mentor hasn't connected Google Calendar"
          ) {
            console.info(
              "📅 Calendar update skipped: Mentor hasn't connected Google Calendar"
            );
          } else {
            console.error("Calendar update failed:", calendarError);
          }
        }
      }

      // Send notifications
      await this.sendAppointmentNotifications(appointment, "acceptance");
      await this.sendInAppNotifications(appointment, "acceptance");

      return {
        success: true,
        appointment,
        message: "Appointment accepted successfully",
      };
    } catch (error) {
      console.error("Error accepting appointment:", error);
      throw new Error(`Failed to accept appointment: ${error.message}`);
    }
  }

  // Cancel an appointment and update calendar
  async cancelAppointment(
    appointmentId,
    cancelledBy,
    cancellationReason = null
  ) {
    try {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        throw new Error("Appointment not found");
      }

      if (appointment.status === "cancelled") {
        throw new Error("Appointment is already cancelled");
      }

      // Update appointment status
      appointment.status = "cancelled";
      appointment.statusHistory.push({
        status: "cancelled",
        updatedBy: cancelledBy,
        updatedAt: new Date(),
        note: cancellationReason || "Appointment cancelled",
      });

      await appointment.save();

      // Cancel calendar event if exists
      if (appointment.googleCalendar?.eventId) {
        try {
          await this.cancelCalendarEvent(appointment);
        } catch (calendarError) {
          if (
            calendarError.message === "Mentor hasn't connected Google Calendar"
          ) {
            console.info(
              "📅 Calendar cancellation skipped: Mentor hasn't connected Google Calendar"
            );
          } else {
            console.error("Calendar cancellation failed:", calendarError);
          }
        }
      }

      // Send notifications
      await this.sendAppointmentNotifications(appointment, "cancellation", {
        cancellationReason,
        cancelledBy,
      });
      await this.sendInAppNotifications(appointment, "cancellation");

      return {
        success: true,
        appointment,
        message: "Appointment cancelled successfully",
      };
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      throw new Error(`Failed to cancel appointment: ${error.message}`);
    }
  }

  // Create Google Calendar event for appointment
  async createCalendarEvent(appointment) {
    try {
      // Check if mentor has connected Google Calendar
      const mentorOAuth = await GoogleOAuth.findOne({
        userId: appointment.mentorId,
        userType: "Mentor",
        isActive: true,
      });

      if (!mentorOAuth) {
        return {
          success: false,
          reason: "mentor_calendar_not_connected",
          message: "Mentor hasn't connected Google Calendar",
        };
      }

      // Set up OAuth credentials
      googleCalendarService.setCredentials({
        access_token: mentorOAuth.accessToken,
        refresh_token: mentorOAuth.refreshToken,
        token_type: mentorOAuth.tokenType,
        expiry_date: mentorOAuth.expiryDate.getTime(),
      });

      // Get participant details
      const mentor = await Mentor.findById(appointment.mentorId);
      const learner = await Learner.findById(appointment.learnerId);

      const calendarData = {
        mentorEmail: mentor.email,
        menteeEmail: learner.email,
        mentorName: `${mentor.firstName} ${mentor.lastName}`,
        menteeName: `${learner.firstName} ${learner.lastName}`,
        skill: appointment.skill,
        appointmentDateTime: appointment.appointmentDateTime,
        duration: appointment.duration,
        appointmentId: appointment._id.toString(),
      };

      // Create the calendar event
      const result = await googleCalendarService.createAppointmentEvent(
        calendarData
      );

      // Update OAuth last used
      mentorOAuth.lastUsed = new Date();
      await mentorOAuth.save();

      return result;
    } catch (error) {
      console.error("Error creating calendar event:", error);
      throw error;
    }
  }

  // Update existing calendar event
  async updateCalendarEvent(appointment) {
    try {
      const mentorOAuth = await GoogleOAuth.findOne({
        userId: appointment.mentorId,
        userType: "Mentor",
        isActive: true,
      });

      if (!mentorOAuth || !appointment.googleCalendar?.eventId) {
        return null;
      }

      googleCalendarService.setCredentials({
        access_token: mentorOAuth.accessToken,
        refresh_token: mentorOAuth.refreshToken,
        token_type: mentorOAuth.tokenType,
        expiry_date: mentorOAuth.expiryDate.getTime(),
      });

      const updateData = {
        appointmentDateTime: appointment.appointmentDateTime,
        duration: appointment.duration,
        status: appointment.status,
        skill: appointment.skill,
        mentorName: appointment.mentorName,
        menteeName: appointment.learnerName,
      };

      const result = await googleCalendarService.updateAppointmentEvent(
        appointment.googleCalendar.eventId,
        updateData
      );

      // Update sync status
      appointment.googleCalendar.lastSyncedAt = new Date();
      appointment.googleCalendar.syncError = null;
      await appointment.save();

      return result;
    } catch (error) {
      console.error("Error updating calendar event:", error);
      throw error;
    }
  }

  // Cancel calendar event
  async cancelCalendarEvent(appointment) {
    try {
      const mentorOAuth = await GoogleOAuth.findOne({
        userId: appointment.mentorId,
        userType: "Mentor",
        isActive: true,
      });

      if (!mentorOAuth || !appointment.googleCalendar?.eventId) {
        return null;
      }

      googleCalendarService.setCredentials({
        access_token: mentorOAuth.accessToken,
        refresh_token: mentorOAuth.refreshToken,
        token_type: mentorOAuth.tokenType,
        expiry_date: mentorOAuth.expiryDate.getTime(),
      });

      const result = await googleCalendarService.deleteAppointmentEvent(
        appointment.googleCalendar.eventId
      );

      // Update sync status
      appointment.googleCalendar.lastSyncedAt = new Date();
      appointment.googleCalendar.syncError = null;
      await appointment.save();

      return result;
    } catch (error) {
      console.error("Error cancelling calendar event:", error);
      throw error;
    }
  }

  // Send email notifications for appointment events
  async sendAppointmentNotifications(appointment, type, extras = {}) {
    try {
      const mentor = await Mentor.findById(appointment.mentorId);
      const learner = await Learner.findById(appointment.learnerId);

      const emailData = {
        mentorEmail: mentor.email,
        menteeEmail: learner.email,
        mentorName: `${mentor.firstName} ${mentor.lastName}`,
        menteeName: `${learner.firstName} ${learner.lastName}`,
        skill: appointment.skill,
        appointmentDateTime: appointment.appointmentDateTime,
        duration: appointment.duration,
        appointmentId: appointment._id.toString(),
        meetingLink: appointment.googleCalendar?.meetingLink,
        eventLink: appointment.googleCalendar?.eventLink,
        ...extras,
      };

      switch (type) {
        case "booking":
        case "acceptance":
          await emailService.sendAppointmentConfirmation(emailData);
          break;
        case "cancellation":
          await emailService.sendAppointmentCancellation(emailData);
          break;
        default:
          console.warn(`Unknown notification type: ${type}`);
      }

      // Update email notification tracking
      appointment.emailNotifications = appointment.emailNotifications || {};
      appointment.emailNotifications.inviteSent = true;
      appointment.emailNotifications.lastEmailSentAt = new Date();
      await appointment.save();
    } catch (error) {
      console.error("Error sending email notifications:", error);
      throw error;
    }
  }

  // Send in-app notifications
  async sendInAppNotifications(appointment, type) {
    try {
      const mentor = await Mentor.findById(appointment.mentorId);
      const learner = await Learner.findById(appointment.learnerId);

      const appointmentDate = new Date(
        appointment.appointmentDateTime
      ).toLocaleDateString();

      switch (type) {
        case "booking":
          // Notify mentor of new booking
          await NotificationService.notifyAppointmentBooked(
            appointment.mentorId,
            `${learner.firstName} ${learner.lastName}`,
            appointment.skill,
            appointmentDate,
            "Mentor"
          );
          break;

        case "acceptance":
          // Notify learner of acceptance
          await NotificationService.notifyAppointmentAccepted(
            appointment.learnerId,
            `${mentor.firstName} ${mentor.lastName}`,
            appointment.skill,
            appointmentDate,
            "Learner"
          );
          break;

        case "cancellation":
          // Notify both parties of cancellation
          await NotificationService.notifyAppointmentCancelled(
            appointment.mentorId,
            `${learner.firstName} ${learner.lastName}`,
            appointment.skill,
            appointmentDate,
            "Mentor"
          );
          await NotificationService.notifyAppointmentCancelled(
            appointment.learnerId,
            `${mentor.firstName} ${mentor.lastName}`,
            appointment.skill,
            appointmentDate,
            "Learner"
          );
          break;
      }
    } catch (error) {
      console.error("Error sending in-app notifications:", error);
      // Don't throw here - in-app notifications are not critical
    }
  }

  // Check for appointment conflicts
  async checkAppointmentConflict(
    mentorId,
    learnerId,
    appointmentDateTime,
    duration
  ) {
    const startTime = new Date(appointmentDateTime);
    const endTime = new Date(startTime.getTime() + duration * 60000);

    // Check for mentor conflicts
    const mentorConflict = await Appointment.findOne({
      mentorId,
      status: { $in: ["pending", "accepted"] },
      $or: [
        {
          appointmentDateTime: {
            $gte: startTime,
            $lt: endTime,
          },
        },
        {
          $expr: {
            $and: [
              { $lte: ["$appointmentDateTime", startTime] },
              {
                $gte: [
                  {
                    $add: [
                      "$appointmentDateTime",
                      { $multiply: ["$duration", 60000] },
                    ],
                  },
                  startTime,
                ],
              },
            ],
          },
        },
      ],
    });

    // Check for learner conflicts
    const learnerConflict = await Appointment.findOne({
      learnerId,
      status: { $in: ["pending", "accepted"] },
      $or: [
        {
          appointmentDateTime: {
            $gte: startTime,
            $lt: endTime,
          },
        },
        {
          $expr: {
            $and: [
              { $lte: ["$appointmentDateTime", startTime] },
              {
                $gte: [
                  {
                    $add: [
                      "$appointmentDateTime",
                      { $multiply: ["$duration", 60000] },
                    ],
                  },
                  startTime,
                ],
              },
            ],
          },
        },
      ],
    });

    return mentorConflict || learnerConflict;
  }

  // Get appointments for a user
  async getUserAppointments(userId, userType, filters = {}) {
    try {
      const query = {};

      if (userType === "Mentor") {
        query.mentorId = userId;
      } else {
        query.learnerId = userId;
      }

      // Apply filters
      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.dateFrom) {
        query.appointmentDateTime = { $gte: new Date(filters.dateFrom) };
      }

      if (filters.dateTo) {
        query.appointmentDateTime = {
          ...query.appointmentDateTime,
          $lte: new Date(filters.dateTo),
        };
      }

      const appointments = await Appointment.find(query)
        .populate("mentorId", "firstName lastName email")
        .populate("learnerId", "firstName lastName email")
        .sort({ appointmentDateTime: 1 });

      return appointments;
    } catch (error) {
      console.error("Error getting user appointments:", error);
      throw new Error(`Failed to get appointments: ${error.message}`);
    }
  }

  // Sync appointment with calendar (for manual sync)
  async syncAppointmentWithCalendar(appointmentId) {
    try {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        throw new Error("Appointment not found");
      }

      if (appointment.googleCalendar?.eventId) {
        // Update existing event
        await this.updateCalendarEvent(appointment);
      } else {
        // Create new event
        const calendarResult = await this.createCalendarEvent(appointment);
        if (calendarResult) {
          appointment.googleCalendar = {
            eventId: calendarResult.eventId,
            eventLink: calendarResult.eventLink,
            meetingLink: calendarResult.meetingLink,
            calendarSynced: true,
            lastSyncedAt: new Date(),
          };
          await appointment.save();
        }
      }

      return {
        success: true,
        appointment,
        message: "Appointment synced with calendar",
      };
    } catch (error) {
      console.error("Error syncing appointment:", error);
      throw new Error(`Failed to sync appointment: ${error.message}`);
    }
  }
}

module.exports = new AppointmentService();
