const nodemailer = require("nodemailer");
const googleCalendarService = require("./googleCalendarService");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "Gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.AUTHENTICATION_EMAIL,
        pass: process.env.AUTHENTICATION_PASSWORD,
      },
    });
  }

  // Send appointment confirmation email with calendar invite
  async sendAppointmentConfirmation(appointmentData) {
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
        meetingLink,
        eventLink,
      } = appointmentData;

      // Generate .ics file content
      const icsContent =
        googleCalendarService.generateICSContent(appointmentData);

      // Format date and time
      const appointmentDate = new Date(appointmentDateTime);
      const formattedDate = appointmentDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const formattedTime = appointmentDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      // Email templates for mentor and mentee
      const mentorEmailHtml = this.generateMentorConfirmationEmail({
        mentorName,
        menteeName,
        skill,
        formattedDate,
        formattedTime,
        duration,
        meetingLink,
        eventLink,
        appointmentId,
      });

      const menteeEmailHtml = this.generateMenteeConfirmationEmail({
        mentorName,
        menteeName,
        skill,
        formattedDate,
        formattedTime,
        duration,
        meetingLink,
        eventLink,
        appointmentId,
      });

      // Send email to mentor
      await this.transporter.sendMail({
        from: `"WeMeerkats Platform" <${process.env.AUTHENTICATION_EMAIL}>`,
        to: mentorEmail,
        subject: `Mentorship Session Confirmed - ${skill} with ${menteeName}`,
        html: mentorEmailHtml,
        attachments: [
          {
            filename: "appointment.ics",
            content: icsContent,
            contentType: "text/calendar",
          },
        ],
      });

      // Send email to mentee
      await this.transporter.sendMail({
        from: `"WeMeerkats Platform" <${process.env.AUTHENTICATION_EMAIL}>`,
        to: menteeEmail,
        subject: `Your Mentorship Session is Confirmed - ${skill} with ${mentorName}`,
        html: menteeEmailHtml,
        attachments: [
          {
            filename: "appointment.ics",
            content: icsContent,
            contentType: "text/calendar",
          },
        ],
      });

      return {
        success: true,
        message: "Appointment confirmation emails sent successfully",
      };
    } catch (error) {
      console.error("Error sending appointment confirmation emails:", error);
      throw new Error(`Failed to send confirmation emails: ${error.message}`);
    }
  }

  // Send appointment cancellation email
  async sendAppointmentCancellation(appointmentData) {
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
        cancellationReason,
        cancelledBy,
      } = appointmentData;

      const appointmentDate = new Date(appointmentDateTime);
      const formattedDate = appointmentDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const formattedTime = appointmentDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      // Generate cancellation .ics file
      const cancelIcsContent = this.generateCancellationICS(appointmentData);

      const emailHtml = this.generateCancellationEmail({
        mentorName,
        menteeName,
        skill,
        formattedDate,
        formattedTime,
        duration,
        appointmentId,
        cancellationReason,
        cancelledBy,
      });

      // Send to both mentor and mentee
      await Promise.all([
        this.transporter.sendMail({
          from: `"WeMeerkats Platform" <${process.env.AUTHENTICATION_EMAIL}>`,
          to: mentorEmail,
          subject: `Mentorship Session Cancelled - ${skill}`,
          html: emailHtml,
          attachments: [
            {
              filename: "appointment-cancelled.ics",
              content: cancelIcsContent,
              contentType: "text/calendar",
            },
          ],
        }),
        this.transporter.sendMail({
          from: `"WeMeerkats Platform" <${process.env.AUTHENTICATION_EMAIL}>`,
          to: menteeEmail,
          subject: `Mentorship Session Cancelled - ${skill}`,
          html: emailHtml,
          attachments: [
            {
              filename: "appointment-cancelled.ics",
              content: cancelIcsContent,
              contentType: "text/calendar",
            },
          ],
        }),
      ]);

      return {
        success: true,
        message: "Cancellation emails sent successfully",
      };
    } catch (error) {
      console.error("Error sending cancellation emails:", error);
      throw new Error(`Failed to send cancellation emails: ${error.message}`);
    }
  }

  // Send appointment reminder email
  async sendAppointmentReminder(appointmentData, reminderType = "24hours") {
    try {
      const {
        mentorEmail,
        menteeEmail,
        mentorName,
        menteeName,
        skill,
        appointmentDateTime,
        duration,
        meetingLink,
        eventLink,
      } = appointmentData;

      const appointmentDate = new Date(appointmentDateTime);
      const now = new Date();
      const timeDiff = appointmentDate - now;
      const hoursUntil = Math.round(timeDiff / (1000 * 60 * 60));

      const formattedDate = appointmentDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const formattedTime = appointmentDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const reminderEmailHtml = this.generateReminderEmail({
        mentorName,
        menteeName,
        skill,
        formattedDate,
        formattedTime,
        duration,
        meetingLink,
        eventLink,
        hoursUntil,
        reminderType,
      });

      const subject =
        reminderType === "24hours"
          ? `Reminder: Mentorship Session Tomorrow - ${skill}`
          : `Reminder: Mentorship Session in 1 Hour - ${skill}`;

      // Send reminder to both participants
      await Promise.all([
        this.transporter.sendMail({
          from: `"WeMeerkats Platform" <${process.env.AUTHENTICATION_EMAIL}>`,
          to: mentorEmail,
          subject: subject,
          html: reminderEmailHtml,
        }),
        this.transporter.sendMail({
          from: `"WeMeerkats Platform" <${process.env.AUTHENTICATION_EMAIL}>`,
          to: menteeEmail,
          subject: subject,
          html: reminderEmailHtml,
        }),
      ]);

      return { success: true, message: "Reminder emails sent successfully" };
    } catch (error) {
      console.error("Error sending reminder emails:", error);
      throw new Error(`Failed to send reminder emails: ${error.message}`);
    }
  }

  // Generate mentor confirmation email HTML
  generateMentorConfirmationEmail(data) {
    const {
      mentorName,
      menteeName,
      skill,
      formattedDate,
      formattedTime,
      duration,
      meetingLink,
      eventLink,
      appointmentId,
    } = data;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #59BBA9, #4A9B8E); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #59BBA9; }
          .button { display: inline-block; background: #59BBA9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          .button:hover { background: #4A9B8E; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 Mentorship Session Confirmed</h1>
          </div>
          <div class="content">
            <h2>Hello ${mentorName}!</h2>
            <p>Great news! Your mentorship session has been confirmed with <strong>${menteeName}</strong>.</p>
            
            <div class="appointment-details">
              <h3>📅 Session Details</h3>
              <p><strong>Skill Focus:</strong> ${skill}</p>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${formattedTime}</p>
              <p><strong>Duration:</strong> ${duration} minutes</p>
              <p><strong>Mentee:</strong> ${menteeName}</p>
              <p><strong>Session ID:</strong> #${appointmentId}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              ${
                meetingLink
                  ? `<a href="${meetingLink}" class="button">🎥 Join Meeting</a>`
                  : ""
              }
              ${
                eventLink
                  ? `<a href="${eventLink}" class="button">📅 View in Calendar</a>`
                  : ""
              }
            </div>

            <h3>📋 Preparation Tips</h3>
            <ul>
              <li>Review the session topic: <strong>${skill}</strong></li>
              <li>Prepare relevant materials and resources</li>
              <li>Test your audio/video setup before the session</li>
              <li>Have examples and practical exercises ready</li>
            </ul>

            <p><strong>Note:</strong> This appointment has been automatically added to your calendar. Check your email for the calendar invite attachment.</p>

            <div class="footer">
              <p>Best regards,<br>The WeMeerkats Team</p>
              <p><em>Empowering growth through mentorship</em></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate mentee confirmation email HTML
  generateMenteeConfirmationEmail(data) {
    const {
      mentorName,
      menteeName,
      skill,
      formattedDate,
      formattedTime,
      duration,
      meetingLink,
      eventLink,
      appointmentId,
    } = data;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #59BBA9, #4A9B8E); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #59BBA9; }
          .button { display: inline-block; background: #59BBA9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          .button:hover { background: #4A9B8E; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Your Mentorship Session is Confirmed!</h1>
          </div>
          <div class="content">
            <h2>Hello ${menteeName}!</h2>
            <p>Fantastic! Your mentorship session with <strong>${mentorName}</strong> has been confirmed. Get ready to accelerate your learning journey!</p>
            
            <div class="appointment-details">
              <h3>📅 Session Details</h3>
              <p><strong>Skill Focus:</strong> ${skill}</p>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${formattedTime}</p>
              <p><strong>Duration:</strong> ${duration} minutes</p>
              <p><strong>Mentor:</strong> ${mentorName}</p>
              <p><strong>Session ID:</strong> #${appointmentId}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              ${
                meetingLink
                  ? `<a href="${meetingLink}" class="button">🎥 Join Meeting</a>`
                  : ""
              }
              ${
                eventLink
                  ? `<a href="${eventLink}" class="button">📅 View in Calendar</a>`
                  : ""
              }
            </div>

            <h3>🚀 How to Prepare</h3>
            <ul>
              <li>Come with specific questions about <strong>${skill}</strong></li>
              <li>Prepare examples of challenges you're facing</li>
              <li>Set up a quiet, distraction-free environment</li>
              <li>Test your audio and video before the session</li>
              <li>Have a notebook ready for taking notes</li>
            </ul>

            <p><strong>Note:</strong> This appointment has been automatically added to your calendar. You'll receive reminder emails 24 hours and 1 hour before the session.</p>

            <div class="footer">
              <p>Best regards,<br>The WeMeerkats Team</p>
              <p><em>Empowering growth through mentorship</em></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate cancellation email HTML
  generateCancellationEmail(data) {
    const {
      mentorName,
      menteeName,
      skill,
      formattedDate,
      formattedTime,
      appointmentId,
      cancellationReason,
      cancelledBy,
    } = data;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b6b, #ee5a52); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b6b; }
          .button { display: inline-block; background: #59BBA9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Session Cancelled</h1>
          </div>
          <div class="content">
            <h2>Session Cancellation Notice</h2>
            <p>We're writing to inform you that the following mentorship session has been cancelled:</p>
            
            <div class="appointment-details">
              <h3>📅 Cancelled Session Details</h3>
              <p><strong>Skill Focus:</strong> ${skill}</p>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${formattedTime}</p>
              <p><strong>Mentor:</strong> ${mentorName}</p>
              <p><strong>Mentee:</strong> ${menteeName}</p>
              <p><strong>Session ID:</strong> #${appointmentId}</p>
              <p><strong>Cancelled by:</strong> ${cancelledBy}</p>
              ${
                cancellationReason
                  ? `<p><strong>Reason:</strong> ${cancellationReason}</p>`
                  : ""
              }
            </div>

            <p>This event has been automatically removed from your calendar. We apologize for any inconvenience this may cause.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="#" class="button">📅 Book New Session</a>
            </div>

            <div class="footer">
              <p>Best regards,<br>The WeMeerkats Team</p>
              <p><em>We're here to help you reschedule when you're ready</em></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate reminder email HTML
  generateReminderEmail(data) {
    const {
      mentorName,
      menteeName,
      skill,
      formattedDate,
      formattedTime,
      duration,
      meetingLink,
      eventLink,
      hoursUntil,
      reminderType,
    } = data;

    const reminderText =
      reminderType === "24hours"
        ? "Your mentorship session is tomorrow!"
        : "Your mentorship session starts in 1 hour!";

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ffa726, #ff9800); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffa726; }
          .button { display: inline-block; background: #59BBA9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          .urgent { background: #ff6b6b; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Session Reminder</h1>
          </div>
          <div class="content">
            <h2>${reminderText}</h2>
            <p>This is a friendly reminder about your upcoming mentorship session.</p>
            
            <div class="appointment-details">
              <h3>📅 Session Details</h3>
              <p><strong>Skill Focus:</strong> ${skill}</p>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${formattedTime}</p>
              <p><strong>Duration:</strong> ${duration} minutes</p>
              <p><strong>Mentor:</strong> ${mentorName}</p>
              <p><strong>Mentee:</strong> ${menteeName}</p>
              <p><strong>Time until session:</strong> ${hoursUntil} hours</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              ${
                meetingLink
                  ? `<a href="${meetingLink}" class="button ${
                      reminderType === "1hour" ? "urgent" : ""
                    }">🎥 Join Meeting</a>`
                  : ""
              }
              ${
                eventLink
                  ? `<a href="${eventLink}" class="button">📅 View in Calendar</a>`
                  : ""
              }
            </div>

            ${
              reminderType === "1hour"
                ? `
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <strong>⚡ Starting Soon!</strong> Your session begins in 1 hour. Please join the meeting room a few minutes early.
              </div>
            `
                : ""
            }

            <div class="footer">
              <p>Best regards,<br>The WeMeerkats Team</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate cancellation ICS content
  generateCancellationICS(appointmentData) {
    const { appointmentDateTime, duration, appointmentId } = appointmentData;

    const startTime = new Date(appointmentDateTime);
    const endTime = new Date(startTime.getTime() + duration * 60000);

    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//WeMeerkats//Mentorship Platform//EN
CALSCALE:GREGORIAN
METHOD:CANCEL
BEGIN:VEVENT
UID:appointment-${appointmentId}@wemeerkats.com
DTSTART:${formatDate(startTime)}
DTEND:${formatDate(endTime)}
SUMMARY:CANCELLED: Mentorship Session
STATUS:CANCELLED
SEQUENCE:1
END:VEVENT
END:VCALENDAR`;
  }
}

module.exports = new EmailService();
