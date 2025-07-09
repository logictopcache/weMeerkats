const { google } = require("googleapis");
const calendar = google.calendar("v3");

class GoogleCalendarService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Set default scopes
    this.scopes = process.env.GOOGLE_CALENDAR_SCOPES.split(" ");
  }

  // Generate authorization URL for OAuth2
  getAuthUrl(userId, userType) {
    const state = JSON.stringify({ userId, userType });
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: this.scopes,
      prompt: "consent",
      state: state,
    });
    return authUrl;
  }

  // Set OAuth2 credentials
  setCredentials(tokens) {
    this.oauth2Client.setCredentials(tokens);
    google.options({ auth: this.oauth2Client });
  }

  // Exchange authorization code for tokens
  async getTokens(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      return tokens;
    } catch (error) {
      console.error("Error getting tokens:", error);
      throw new Error("Failed to get OAuth tokens");
    }
  }

  // Create a calendar event for an appointment
  async createAppointmentEvent(appointmentData) {
    try {
      const {
        mentorEmail,
        menteeEmail,
        mentorName,
        menteeName,
        skill,
        appointmentDateTime,
        duration,
        appointmentId,
      } = appointmentData;

      const startTime = new Date(appointmentDateTime);
      const endTime = new Date(startTime.getTime() + duration * 60000); // duration in minutes

      const event = {
        summary: `Mentorship Session: ${skill}`,
        description: `Mentorship session between ${mentorName} (Mentor) and ${menteeName} (Mentee) focusing on ${skill}.\n\nAppointment ID: ${appointmentId}`,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: "UTC",
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: "UTC",
        },
        location: "Virtual Meeting", // Added to prevent Directions button
        attendees: [
          {
            email: mentorEmail,
            displayName: mentorName,
            responseStatus: "accepted",
          },
          {
            email: menteeEmail,
            displayName: menteeName,
            responseStatus: "needsAction",
          },
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 24 * 60 }, // 24 hours before
            { method: "popup", minutes: 30 }, // 30 minutes before
          ],
        },
        guestsCanModify: false,
        guestsCanSeeOtherGuests: true,
        sendUpdates: "all",
        conferenceData: {
          createRequest: {
            requestId: `mentorship-${appointmentId}`,
            conferenceSolutionKey: {
              type: "hangoutsMeet",
            },
          },
        },
      };

      const response = await calendar.events.insert({
        calendarId: "primary",
        resource: event,
        conferenceDataVersion: 1,
        sendUpdates: "all",
      });

      return {
        eventId: response.data.id,
        eventLink: response.data.htmlLink,
        meetingLink:
          response.data.conferenceData?.entryPoints?.[0]?.uri || null,
        event: response.data,
      };
    } catch (error) {
      console.error("Error creating calendar event:", error);
      throw new Error(`Failed to create calendar event: ${error.message}`);
    }
  }

  // Update an existing calendar event
  async updateAppointmentEvent(eventId, updateData) {
    try {
      const {
        appointmentDateTime,
        duration,
        status,
        skill,
        mentorName,
        menteeName,
      } = updateData;

      // Get existing event first
      const existingEvent = await calendar.events.get({
        calendarId: "primary",
        eventId: eventId,
      });

      const startTime = new Date(appointmentDateTime);
      const endTime = new Date(startTime.getTime() + duration * 60000);

      const updatedEvent = {
        ...existingEvent.data,
        summary: `Mentorship Session: ${skill}${
          status === "cancelled" ? " (CANCELLED)" : ""
        }`,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: "UTC",
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: "UTC",
        },
        status: status === "cancelled" ? "cancelled" : "confirmed",
      };

      if (status === "cancelled") {
        updatedEvent.summary = `[CANCELLED] ${updatedEvent.summary}`;
        updatedEvent.description = `${updatedEvent.description}\n\nSTATUS: CANCELLED`;
      }

      const response = await calendar.events.update({
        calendarId: "primary",
        eventId: eventId,
        resource: updatedEvent,
        sendUpdates: "all",
      });

      return {
        eventId: response.data.id,
        eventLink: response.data.htmlLink,
        event: response.data,
      };
    } catch (error) {
      console.error("Error updating calendar event:", error);
      throw new Error(`Failed to update calendar event: ${error.message}`);
    }
  }

  // Delete/Cancel a calendar event
  async deleteAppointmentEvent(eventId) {
    try {
      await calendar.events.delete({
        calendarId: "primary",
        eventId: eventId,
        sendUpdates: "all",
      });

      return { success: true, message: "Event deleted successfully" };
    } catch (error) {
      console.error("Error deleting calendar event:", error);
      throw new Error(`Failed to delete calendar event: ${error.message}`);
    }
  }

  /**
   * Get calendar event details
   */
  async getEvent(eventId) {
    try {
      const response = await calendar.events.get({
        calendarId: "primary",
        eventId: eventId,
      });

      return response.data;
    } catch (error) {
      console.error("Error getting calendar event:", error);
      throw new Error(`Failed to get calendar event: ${error.message}`);
    }
  }

  /**
   * Check for calendar conflicts
   */
  async checkTimeSlotAvailability(startTime, endTime, userEmail) {
    try {
      const response = await calendar.freebusy.query({
        resource: {
          timeMin: startTime,
          timeMax: endTime,
          items: [{ id: userEmail }],
        },
      });

      const busyTimes = response.data.calendars[userEmail]?.busy || [];
      return busyTimes.length === 0; // true if available, false if busy
    } catch (error) {
      console.error("Error checking availability:", error);
      return true; // Default to available if check fails
    }
  }

  /**
   * Generate .ics file content for email attachments
   */
  generateICSContent(appointmentData) {
    const {
      mentorName,
      menteeName,
      skill,
      appointmentDateTime,
      duration,
      appointmentId,
      meetingLink,
    } = appointmentData;

    const startTime = new Date(appointmentDateTime);
    const endTime = new Date(startTime.getTime() + duration * 60000);

    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//WeMeerkats//Mentorship Platform//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:appointment-${appointmentId}@wemeerkats.com
DTSTART:${formatDate(startTime)}
DTEND:${formatDate(endTime)}
SUMMARY:Mentorship Session: ${skill}
DESCRIPTION:Mentorship session between ${mentorName} (Mentor) and ${menteeName} (Mentee)${
      meetingLink ? `\\n\\nJoin Meeting: ${meetingLink}` : ""
    }
LOCATION:${meetingLink || "Virtual Meeting"}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT30M
ACTION:DISPLAY
DESCRIPTION:Mentorship session reminder
END:VALARM
END:VEVENT
END:VCALENDAR`;

    return icsContent;
  }
}

module.exports = new GoogleCalendarService();
