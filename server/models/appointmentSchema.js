const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    learnerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    appointmentDateTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      default: 60, // Duration in minutes
    },
    skill: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rejected",
        "rescheduled",
        "cancelled",
        "completed",
        "no-show",
      ],
      default: "pending",
    },
    learnerName: {
      type: String,
    },
    mentorName: {
      type: String,
    },
    proposedDateTime: {
      type: Date,
    },
    statusHistory: [
      {
        status: String,
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
        note: String,
      },
    ],
    // Google Calendar Integration Fields
    googleCalendar: {
      eventId: {
        type: String,
        default: null,
      },
      eventLink: {
        type: String,
        default: null,
      },
      meetingLink: {
        type: String,
        default: null,
      },
      calendarSynced: {
        type: Boolean,
        default: false,
      },
      lastSyncedAt: {
        type: Date,
        default: null,
      },
      syncError: {
        type: String,
        default: null,
      },
    },
    // Email notification tracking
    emailNotifications: {
      inviteSent: {
        type: Boolean,
        default: false,
      },
      reminderSent: {
        type: Boolean,
        default: false,
      },
      cancellationSent: {
        type: Boolean,
        default: false,
      },
      lastEmailSentAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

appointmentSchema.index({ mentorId: 1, appointmentDateTime: 1 });
appointmentSchema.index({ learnerId: 1, appointmentDateTime: 1 });
appointmentSchema.index({ "googleCalendar.eventId": 1 });
appointmentSchema.index({ status: 1, appointmentDateTime: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
