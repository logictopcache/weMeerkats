const express = require("express");
const router = express.Router();
const MentorProfile = require("../models/mentorProfile");
const jwt = require("jsonwebtoken");
const Mentor = require("../models/mentorSchema");
const Learner = require("../models/learnerSchema");
const Conversation = require("../models/conversationSchema");
const Appointment = require("../models/appointmentSchema");
const multer = require("multer");
const { NotificationService } = require("../util/notificationService");
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization token required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const mentor = await Mentor.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!mentor) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    req.token = token;
    req.mentor = mentor;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

const upload = multer({ dest: "uploads/" });

router.post(
  "/mentor-profile",
  authMiddleware,
  upload.none(),
  async (req, res) => {
    try {
      const parseField = (field) => {
        try {
          return field ? JSON.parse(field) : undefined;
        } catch (error) {
          console.error(`Failed to parse field: ${field}`, error);
          return undefined;
        }
      };

      const {
        phone,
        bio,
        profilePictureUrl,
        education,
        designation,
        workExperiences,
        certification,
        expertise,
        skills,
        availability,
      } = req.body;

      const parsedBody = {
        mentorId: req.mentor._id,
        fullName: `${req.mentor.firstName} ${req.mentor.lastName}`,
        email: req.mentor.email,
        phone,
        bio,
        profilePictureUrl,
        education: parseField(education) || [],
        designation,
        workExperiences: parseField(workExperiences) || [],
        certification: Array.isArray(parseField(certification))
          ? parseField(certification).join(", ")
          : parseField(certification) || "",
        expertise: Array.isArray(parseField(expertise))
          ? parseField(expertise).join(", ")
          : parseField(expertise) || "",
        skills: parseField(skills) || [],
        availability: parseField(availability) || {
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
          saturday: [],
          sunday: [],
        },
      };

      Object.keys(parsedBody).forEach(
        (key) => parsedBody[key] === undefined && delete parsedBody[key]
      );

      const existingProfile = await MentorProfile.findOne({
        mentorId: req.mentor._id,
      });

      let profile;
      if (existingProfile) {
        profile = await MentorProfile.findOneAndUpdate(
          { mentorId: req.mentor._id },
          { ...parsedBody, isVerified: req.mentor.verified || false },
          { new: true, runValidators: true }
        );
        return res.status(200).json({
          message: "Profile updated successfully",
          profile,
        });
      } else {
        profile = new MentorProfile(parsedBody);
        await profile.save();
        return res.status(201).json({
          message: "Profile created successfully",
          profile,
        });
      }
    } catch (error) {
      console.error("Operation error:", error);
      return res.status(400).json({
        error: "Error processing profile",
        details: error.message,
      });
    }
  }
);

router.post("/mentor-availability/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { availability } = req.body;

    if (!availability || typeof availability !== "object") {
      return res.status(400).json({
        error: "Invalid availability data format",
      });
    }

    const validDays = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const validTimes = [
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
      "19:00",
      "20:00",
    ];

    // Get mentor profile to validate skills
    const mentorProfile = await MentorProfile.findOne({ mentorId: id });
    if (!mentorProfile) {
      return res.status(404).json({
        error: "Mentor profile not found",
      });
    }

    // Validate each day's time slots
    for (const day in availability) {
      if (!validDays.includes(day)) {
        return res.status(400).json({
          error: `Invalid day: ${day}`,
        });
      }

      if (!Array.isArray(availability[day])) {
        return res.status(400).json({
          error: `Invalid time slots format for ${day}`,
        });
      }

      for (const slot of availability[day]) {
        // Validate time slot
        if (!slot.startTime || !validTimes.includes(slot.startTime)) {
          return res.status(400).json({
            error: `Invalid time slot: ${slot.startTime} for ${day}`,
          });
        }

        // Validate skills array
        if (!Array.isArray(slot.skills) || slot.skills.length === 0) {
          return res.status(400).json({
            error: `Skills array is required for time slot ${slot.startTime} on ${day}`,
          });
        }

        // Validate that all skills exist in mentor's profile
        const invalidSkills = slot.skills.filter(skill => !mentorProfile.skills.includes(skill));
        if (invalidSkills.length > 0) {
          return res.status(400).json({
            error: `Invalid skills for time slot ${slot.startTime} on ${day}: ${invalidSkills.join(', ')}. Skills must be from your profile.`,
          });
        }

        // Ensure duration is set
        if (!slot.duration || typeof slot.duration !== 'number' || slot.duration <= 0) {
          slot.duration = 60; // Set default duration if not provided or invalid
        }
      }
    }

    const updatedProfile = await MentorProfile.findOneAndUpdate(
      { mentorId: id },
      { $set: { availability } },
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({
        error: "Profile not found or unauthorized",
      });
    }

    return res.status(200).json({
      message: "Availability updated successfully",
      availability: updatedProfile.availability,
    });
  } catch (error) {
    console.error("Availability update error:", error);
    return res.status(500).json({
      error: "Error updating availability",
      details: error.message,
    });
  }
});

router.get("/mentor-availability/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await MentorProfile.find({ mentorId: id });

    if (!profile) {
      return res.status(404).json({
        error: "Mentor profile not found",
      });
    }

    return res.status(200).json(profile);
  } catch (error) {
    console.error("Fetch availability error:", error);
    return res.status(500).json({
      error: "Error fetching availability",
      details: error.message,
    });
  }
});

router.get("/mentor-profile/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await MentorProfile.findOne({ mentorId: id });

    if (!profile) {
      return res.status(404).send({ message: "Profile not found" });
    }

    // Get the mentor's verified status
    const mentor = await Mentor.findById(id);
    if (mentor) {
      // Update the profile's verification status if it doesn't match
      if (profile.isVerified !== mentor.verified) {
        await MentorProfile.findOneAndUpdate(
          { mentorId: id },
          { isVerified: mentor.verified },
          { new: true }
        );
      }
      profile.isVerified = mentor.verified;
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error("Fetching error:", error);
    res.status(500).send({ error: error.message });
  }
});

router.get("/mentors", async (req, res) => {
  try {
    const mentorProfiles = await MentorProfile.find();
    
    // Get all mentor IDs from profiles
    const mentorIds = mentorProfiles.map(profile => profile.mentorId);
    
    // Fetch all mentors' verification status
    const mentors = await Mentor.find({ _id: { $in: mentorIds } }, { _id: 1, verified: 1 });
    
    // Create a map of mentor ID to verified status
    const verificationMap = {};
    mentors.forEach(mentor => {
      verificationMap[mentor._id.toString()] = mentor.verified;
    });
    
    // Update verification status in profiles
    const updatedProfiles = await Promise.all(mentorProfiles.map(async profile => {
      const mentorId = profile.mentorId.toString();
      const verified = verificationMap[mentorId];
      
      if (verified !== undefined && profile.isVerified !== verified) {
        await MentorProfile.findOneAndUpdate(
          { mentorId },
          { isVerified: verified },
          { new: true }
        );
        profile.isVerified = verified;
      }
      return profile;
    }));

    res.status(200).json(updatedProfiles);
  } catch (error) {
    console.error("Error fetching mentors:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get(
  "/mentor/conversations/:mentorId",
  authMiddleware,
  async (req, res) => {
    try {
      const mentorId = req.params["mentorId"];
      const conversations = await Conversation.find({ mentorId: mentorId })
        .populate("learnerId", "firstName lastName email")
        .sort({ updatedAt: -1 });

      if (!conversations) {
        return res.status(404).json({ message: "No conversations found" });
      }

      res.status(200).json({
        message: "Conversations retrieved successfully",
        conversations,
      });
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({
        error: "Failed to fetch conversations",
        details: error.message,
      });
    }
  }
);

router.get("/mentors/search", async (req, res) => {
  try {
    const searchKey = req.query.key;

    if (!searchKey) {
      return res.status(400).json({ error: "Search key is required" });
    }

    const searchRegex = new RegExp(searchKey, "i");

    const mentors = await MentorProfile.find({
      $or: [
        { fullName: searchRegex },
        { skills: { $in: [searchRegex] } },
        { expertise: searchRegex },
        { designation: searchRegex },
        { "education.degree": searchRegex },
        { "education.universityName": searchRegex },
        { "workExperiences.title": searchRegex },
        { "workExperiences.companyName": searchRegex },
        { certification: searchRegex },
      ],
    });

    if (mentors.length === 0) {
      return res.status(200).json({
        message: "No mentors found matching your search criteria",
        mentors: [],
      });
    }

    res.status(200).json({
      message: "Mentors found successfully",
      count: mentors.length,
      mentors,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      error: "Error searching mentors",
      details: error.message,
    });
  }
});

router.post("/mentor/conversation", authMiddleware, async (req, res) => {
  try {
    const mentorId = req.mentor._id;
    const learnerId = req.body.learnerId;

    // Check if learner exists
    const learnerCheck = await Learner.findById(learnerId);
    if (!learnerCheck) {
      return res.status(400).json({ error: "Learner id invalid" });
    }

    // Check if conversation already exists
    const conversationCheck = await Conversation.findOne({
      learnerId: learnerId,
      mentorId: mentorId,
    });

    if (conversationCheck) {
      return res.status(400).json({ error: "Conversation already exists" });
    }

    // Create new conversation
    const newConversation = new Conversation({
      mentorId: mentorId,
      learnerId: learnerId,
      messages: [], // Initialize empty messages array
    });

    const savedConversation = await newConversation.save();

    return res.status(201).json({
      message: "Conversation created successfully",
      conversation: savedConversation,
    });
  } catch (error) {
    console.error("Conversation creation error:", error);
    return res.status(500).json({
      error: "Failed to create conversation",
      details: error.message,
    });
  }
});

// Get all pending meeting requests for a mentor
router.get("/mentor-requests", authMiddleware, async (req, res) => {
  try {
    const requests = await Appointment.find({
      mentorId: req.mentor._id,
      status: "pending",
    })
      .populate("learnerId", "firstName lastName email")
      .sort({ appointmentDateTime: 1 });

    res.status(200).json({
      status: "success",
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching meeting requests:", error);
    res.status(500).json({ error: "Failed to fetch meeting requests" });
  }
});

// Accept a meeting request
router.patch(
  "/mentor-requests/:appointmentId/accept",
  authMiddleware,
  async (req, res) => {
    try {
      const appointment = await Appointment.findOneAndUpdate(
        {
          _id: req.params.appointmentId,
          mentorId: req.mentor._id,
          status: "pending",
        },
        {
          $set: { status: "accepted" },
          $push: {
            statusHistory: {
              status: "accepted",
              updatedBy: req.mentor._id,
              note: "Appointment accepted by mentor",
            },
          },
        },
        { new: true }
      ).populate('learnerId');

      if (!appointment) {
        return res
          .status(404)
          .json({ error: "Appointment not found or already processed" });
      }

      // Send notification to learner about the accepted appointment
      await NotificationService.notifyAppointmentAccepted(
        appointment.learnerId._id,
        `${req.mentor.firstName} ${req.mentor.lastName}`,
        appointment.appointmentDateTime,
        appointment.skill
      );

      res.status(200).json({
        status: "success",
        data: appointment,
      });
    } catch (error) {
      console.error("Error accepting meeting request:", error);
      res.status(500).json({ error: "Failed to accept meeting request" });
    }
  }
);

// Reject a meeting request
router.patch(
  "/mentor-requests/:appointmentId/reject",
  authMiddleware,
  async (req, res) => {
    try {
      const { reason } = req.body;

      const appointment = await Appointment.findOneAndUpdate(
        {
          _id: req.params.appointmentId,
          mentorId: req.mentor._id,
          status: "pending",
        },
        {
          $set: { status: "rejected" },
          $push: {
            statusHistory: {
              status: "rejected",
              updatedBy: req.mentor._id,
              note: reason || "Appointment rejected by mentor",
            },
          },
        },
        { new: true }
      );

      if (!appointment) {
        return res
          .status(404)
          .json({ error: "Appointment not found or already processed" });
      }

      res.status(200).json({
        status: "success",
        data: appointment,
      });
    } catch (error) {
      console.error("Error rejecting meeting request:", error);
      res.status(500).json({ error: "Failed to reject meeting request" });
    }
  }
);

// Propose reschedule
router.patch(
  "/mentor-requests/:appointmentId/reschedule",
  authMiddleware,
  async (req, res) => {
    try {
      const { proposedDateTime, reason } = req.body;

      if (!proposedDateTime) {
        return res.status(400).json({ error: "Proposed datetime is required" });
      }

      const appointment = await Appointment.findOneAndUpdate(
        {
          _id: req.params.appointmentId,
          mentorId: req.mentor._id,
          status: { $in: ["pending", "accepted"] },
        },
        {
          $set: {
            status: "rescheduled",
            proposedDateTime: new Date(proposedDateTime),
          },
          $push: {
            statusHistory: {
              status: "rescheduled",
              updatedBy: req.mentor._id,
              note: reason || `Proposed new time: ${proposedDateTime}`,
            },
          },
        },
        { new: true }
      );

      if (!appointment) {
        return res
          .status(404)
          .json({ error: "Appointment not found or cannot be rescheduled" });
      }

      res.status(200).json({
        status: "success",
        data: appointment,
      });
    } catch (error) {
      console.error("Error rescheduling meeting:", error);
      res.status(500).json({ error: "Failed to reschedule meeting" });
    }
  }
);

// Admin endpoint to update mentor verification status
router.patch("/mentor-verify/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    if (typeof isVerified !== 'boolean') {
      return res.status(400).json({
        error: "isVerified must be a boolean value"
      });
    }

    const profile = await MentorProfile.findOneAndUpdate(
      { mentorId: id },
      { isVerified },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({
        error: "Mentor profile not found"
      });
    }

    return res.status(200).json({
      message: "Verification status updated successfully",
      profile
    });
  } catch (error) {
    console.error("Verification update error:", error);
    return res.status(500).json({
      error: "Error updating verification status",
      details: error.message
    });
  }
});

// Get available time slots for a specific skill
router.get("/mentor/:mentorId/available-slots/:skill", async (req, res) => {
  try {
    const { mentorId, skill } = req.params;
    const { date } = req.query;

    // Get mentor profile
    const mentorProfile = await MentorProfile.findOne({ mentorId });
    if (!mentorProfile) {
      return res.status(404).json({ error: "Mentor profile not found" });
    }

    // Verify mentor teaches this skill
    if (!mentorProfile.skills.includes(skill)) {
      return res.status(400).json({ error: "Mentor does not teach this skill" });
    }

    // Get the day of week for the requested date
    const requestedDate = date ? new Date(date) : new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = days[requestedDate.getDay()];

    console.log('Debug info:', {
      requestedDate,
      dayOfWeek,
      availableSlots: mentorProfile.availability[dayOfWeek],
      requestedSkill: skill
    });

    // Get all time slots for that day that are available and include the requested skill
    const availableSlots = mentorProfile.availability[dayOfWeek]?.filter(slot => 
      slot.isAvailable && slot.skills.includes(skill)
    ) || [];

    console.log('Filtered slots:', availableSlots);

    // Get existing appointments for the requested date
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await Appointment.find({
      mentorId,
      appointmentDateTime: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $nin: ["cancelled", "rejected"] }
    });

    console.log('Existing appointments:', existingAppointments);

    // Filter out slots that already have appointments
    const availableSlotsWithoutBookings = availableSlots.filter(slot => {
      const [hours, minutes] = slot.startTime.split(":").map(Number);
      const slotDate = new Date(requestedDate);
      slotDate.setHours(hours, minutes, 0, 0);

      return !existingAppointments.some(appointment => {
        const appointmentTime = new Date(appointment.appointmentDateTime);
        return appointmentTime.getHours() === hours && 
               appointmentTime.getMinutes() === minutes;
      });
    });

    res.status(200).json({
      date: requestedDate,
      skill,
      availableSlots: availableSlotsWithoutBookings.map(slot => ({
        startTime: slot.startTime,
        duration: slot.duration,
        skills: slot.skills
      }))
    });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    res.status(500).json({ error: "Failed to fetch available slots", details: error.message });
  }
});

// Toggle availability for a specific time slot
router.patch('/mentor/availability/toggle', authMiddleware, async (req, res) => {
  try {
    const { day, startTime, skill } = req.body;
    const mentorId = req.mentor._id;

    // Get mentor profile
    const mentorProfile = await MentorProfile.findOne({ mentorId });
    if (!mentorProfile) {
      return res.status(404).json({ error: "Mentor profile not found" });
    }

    // Find the specific time slot
    const dayAvailability = mentorProfile.availability[day.toLowerCase()];
    if (!dayAvailability) {
      return res.status(400).json({ error: "Invalid day specified" });
    }

    // Find the specific slot
    const slotIndex = dayAvailability.findIndex(slot => 
      slot.startTime === startTime && slot.skills.includes(skill)
    );

    if (slotIndex === -1) {
      return res.status(404).json({ error: "Time slot not found" });
    }

    // Toggle the availability
    dayAvailability[slotIndex].isAvailable = !dayAvailability[slotIndex].isAvailable;

    // Save the updated profile
    await mentorProfile.save();

    res.status(200).json({
      message: "Availability toggled successfully",
      updatedSlot: dayAvailability[slotIndex]
    });

  } catch (error) {
    console.error("Error toggling availability:", error);
    res.status(500).json({ error: "Failed to toggle availability" });
  }
});

// Add a new time slot
router.post("/mentor-availability/:id/time-slot", async (req, res) => {
  try {
    const { id } = req.params;
    const { day, startTime, skills, duration = 60 } = req.body;

    // Validate day
    const validDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    if (!validDays.includes(day)) {
      return res.status(400).json({
        error: `Invalid day: ${day}`,
      });
    }

    // Validate time
    const validTimes = [
      "09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
      "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
    ];
    if (!validTimes.includes(startTime)) {
      return res.status(400).json({
        error: `Invalid time: ${startTime}`,
      });
    }

    // Get mentor profile
    const mentorProfile = await MentorProfile.findOne({ mentorId: id });
    if (!mentorProfile) {
      return res.status(404).json({
        error: "Mentor profile not found",
      });
    }

    // Validate skills
    const invalidSkills = skills.filter(skill => !mentorProfile.skills.includes(skill));
    if (invalidSkills.length > 0) {
      return res.status(400).json({
        error: `Invalid skills: ${invalidSkills.join(', ')}. Skills must be from your profile.`,
      });
    }

    // Check if time slot already exists
    if (mentorProfile.availability[day]?.some(slot => slot.startTime === startTime)) {
      return res.status(400).json({
        error: `Time slot ${startTime} already exists for ${day}`,
      });
    }

    // Add the new time slot
    const updateQuery = {
      $push: {
        [`availability.${day}`]: {
          startTime,
          skills,
          duration,
          isAvailable: true
        }
      }
    };

    const updatedProfile = await MentorProfile.findOneAndUpdate(
      { mentorId: id },
      updateQuery,
      { new: true }
    );

    return res.status(200).json({
      message: "Time slot added successfully",
      timeSlot: updatedProfile.availability[day].find(slot => slot.startTime === startTime)
    });
  } catch (error) {
    console.error("Add time slot error:", error);
    return res.status(500).json({
      error: "Error adding time slot",
      details: error.message
    });
  }
});

// Mark appointment as completed
router.patch("/mentor-requests/:appointmentId/complete", authMiddleware, async (req, res) => {
  try {
    const { feedback } = req.body;

    const appointment = await Appointment.findOneAndUpdate(
      {
        _id: req.params.appointmentId,
        mentorId: req.mentor._id,
        status: "accepted",
        appointmentDateTime: { $lt: new Date() } // Can only complete past appointments
      },
      {
        $set: { 
          status: "completed",
          mentorFeedback: feedback 
        },
        $push: {
          statusHistory: {
            status: "completed",
            updatedBy: req.mentor._id,
            note: feedback || "Session completed by mentor"
          }
        }
      },
      { new: true }
    ).populate('learnerId');

    if (!appointment) {
      return res.status(404).json({ 
        error: "Appointment not found or cannot be marked as completed. Make sure the appointment is accepted and the session time has passed." 
      });
    }

    // Format the date
    const sessionDate = new Date(appointment.appointmentDateTime).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });

    // Notify learner that session is marked as completed with proper skill name and formatted date
    await NotificationService.createNotification(
      appointment.learnerId._id,
      `Your session for ${appointment.skill || 'the skill'} on ${sessionDate} with ${req.mentor.firstName} ${req.mentor.lastName} has been marked as completed`,
      'SESSION_COMPLETED',
      'Learner'
    );

    res.status(200).json({
      status: "success",
      message: "Appointment marked as completed",
      data: appointment
    });

  } catch (error) {
    console.error("Error completing appointment:", error);
    res.status(500).json({ error: "Failed to mark appointment as completed" });
  }
});

module.exports = router;
