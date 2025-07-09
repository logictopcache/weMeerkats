const { Notification } = require("../models/notification");

const NotificationTypes = {
  COURSE_UPDATE: "COURSE_UPDATE",
  NEW_MESSAGE: "NEW_MESSAGE",
  ASSIGNMENT: "ASSIGNMENT",
  MENTOR_FEEDBACK: "MENTOR_FEEDBACK",
  PROGRESS_UPDATE: "PROGRESS_UPDATE",
  SESSION_REMINDER: "SESSION_REMINDER",
  APPOINTMENT_BOOKED: "APPOINTMENT_BOOKED",
  APPOINTMENT_ACCEPTED: "APPOINTMENT_ACCEPTED",
};

class NotificationService {
  static notificationSocket;

  static initialize(notificationSocket) {
    this.notificationSocket = notificationSocket;
  }

  static async createNotification(userId, message, type, userModel) {
    try {
      const notification = await Notification.create({
        userId,
        message,
        type,
        userModel,
        isRead: false,
      });

      // Emit real-time notification if socket is initialized
      if (this.notificationSocket) {
        this.notificationSocket.sendNotification(userId, notification);
      }

      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  // When a mentor sends a message
  static async notifyNewMessage(userId, senderName, userModel) {
    return this.createNotification(
      userId,
      `You have a new message from ${senderName}`,
      NotificationTypes.NEW_MESSAGE,
      userModel
    );
  }

  // When mentor provides feedback
  static async notifyMentorFeedback(userId, courseName) {
    return this.createNotification(
      userId,
      `Your mentor has provided feedback on ${courseName}`,
      NotificationTypes.MENTOR_FEEDBACK,
      "Learner"
    );
  }

  // When there's a new course update
  static async notifyCourseUpdate(userId, courseName, updateType) {
    return this.createNotification(
      userId,
      `${courseName} has been updated with new ${updateType}`,
      NotificationTypes.COURSE_UPDATE,
      "Learner"
    );
  }

  // When there's a new assignment
  static async notifyNewAssignment(userId, courseName) {
    return this.createNotification(
      userId,
      `New assignment available in ${courseName}`,
      NotificationTypes.ASSIGNMENT,
      "Learner"
    );
  }

  // When learner makes progress
  static async notifyProgressUpdate(userId, courseName, progress) {
    return this.createNotification(
      userId,
      `You've completed ${progress}% of ${courseName}`,
      NotificationTypes.PROGRESS_UPDATE,
      "Learner"
    );
  }

  // For upcoming session reminders
  static async notifySessionReminder(userId, mentorName, dateTime, userModel) {
    return this.createNotification(
      userId,
      `Reminder: You have an upcoming session with ${mentorName} at ${dateTime}`,
      NotificationTypes.SESSION_REMINDER,
      userModel
    );
  }

  // When a learner books an appointment
  static async notifyAppointmentBooked(mentorId, learnerName, dateTime, skill) {
    return this.createNotification(
      mentorId,
      `New appointment request from ${learnerName} for ${skill} on ${new Date(
        dateTime
      ).toLocaleString()}`,
      NotificationTypes.APPOINTMENT_BOOKED,
      "Mentor"
    );
  }

  // When a mentor accepts an appointment
  static async notifyAppointmentAccepted(
    learnerId,
    mentorName,
    dateTime,
    skill
  ) {
    return this.createNotification(
      learnerId,
      `Your appointment with ${mentorName} for ${skill} on ${new Date(
        dateTime
      ).toLocaleString()} has been accepted`,
      NotificationTypes.APPOINTMENT_ACCEPTED,
      "Learner"
    );
  }

  // When an appointment is cancelled or rejected
  static async notifyAppointmentCancelled(
    userId,
    otherPartyName,
    skill,
    date,
    userModel
  ) {
    return this.createNotification(
      userId,
      `Your appointment with ${otherPartyName} for ${skill} on ${date} has been cancelled or rejected.`,
      "APPOINTMENT_CANCELLED",
      userModel
    );
  }
}

module.exports = { NotificationService, NotificationTypes };
