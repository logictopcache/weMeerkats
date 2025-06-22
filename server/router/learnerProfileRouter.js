const express = require("express");
const router = express.Router();
const LearnerProfile = require("../models/learnerProfile");
const jwt = require("jsonwebtoken");
const Learner = require("../models/learnerSchema");
const mentor = require("../models/mentorSchema");
const conversation = require("../models/conversationSchema");
const mongoose = require("mongoose");
const Appointment = require("../models/appointmentSchema");
const upload = require("../util/multerConfig");
const MentorProfile = require("../models/mentorProfile");
const { NotificationService } = require("../util/notificationService");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization token required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const learner = await Learner.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!learner) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    req.token = token;
    req.learner = learner;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

router.post(
  "/learner-profile",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const { education, bio, skills } = req.body;

      const profileData = {
        learnerId: req.learner._id,
        fullName: `${req.learner.firstName} ${req.learner.lastName}`,
        email: req.learner.email,
        profilePictureUrl: req.file ? `${req.file.filename}` : null,
        education: education ? JSON.parse(education) : [],
        bio,
        skills: skills ? JSON.parse(skills) : [],
      };

      Object.keys(profileData).forEach(
        (key) => profileData[key] === undefined && delete profileData[key]
      );

      const existingProfile = await LearnerProfile.findOne({
        learnerId: req.learner._id,
      });

      let profile;
      if (existingProfile) {
        profile = await LearnerProfile.findOneAndUpdate(
          { learnerId: req.learner._id },
          { $set: profileData },
          { new: true }
        );
        res
          .status(200)
          .json({ message: "Profile updated successfully", profile });
      } else {
        profile = new LearnerProfile(profileData);
        await profile.save();
        res
          .status(201)
          .json({ message: "Profile created successfully", profile });
      }
    } catch (error) {
      console.error("Saving error:", error);
      res
        .status(400)
        .json({ error: "Error saving profile", error: error.message });
    }
  }
);

router.post("/learner/conversation", authMiddleware, async (req, res) => {
  try {
    const mentorId = req.body.mentorId;
    const learnerId = req.learner._id;

    const mentorCheck = await mentor.findById(mentorId);
    if (!mentorCheck) {
      return res.status(400).json({ error: "mentor id invalid" });
    }

    const conversationCheck = await conversation.findOne({
      learnerId: learnerId,
      mentorId: mentorId,
    });

    if (conversationCheck) {
      return res.status(400).json({ error: "conversation already exists" });
    }

    const conv = await conversation.create({
      mentorId: mentorId,
      learnerId: learnerId,
      messages: [],
    });

    return res.status(201).json({
      message: "Conversation created successfully",
      conversation: conv,
    });
  } catch (error) {
    console.error("Conversation creation error:", error);
    return res.status(500).json({
      error: "Failed to create conversation",
      details: error.message,
    });
  }
});

router.get("/learner-profile/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Searching for profile with ID:", id);

    const profile = await LearnerProfile.findOne({ learnerId: id });
    console.log("Found profile:", profile);

    if (!profile) {
      const allProfiles = await LearnerProfile.find({});
      return res.status(404).send({
        message: "Profile not found",
        searchedId: id,
        totalProfiles: allProfiles.length,
        availableIds: allProfiles.map((p) => p.learnerId),
      });
    }

    // Get the learner's email
    const learner = await Learner.findById(id);
    const profileWithEmail = {
      ...profile.toObject(),
      email: learner ? learner.email : null,
    };

    res.status(200).json(profileWithEmail);
  } catch (error) {
    console.error("Fetching error:", error);
    res.status(500).send({ error: error.message });
  }
});

router.get("/learners", async (req, res) => {
  try {
    const learners = await LearnerProfile.find();
    res.status(200).json(learners);
  } catch (error) {
    console.error("Error fetching learners:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get(
  "/learner/conversations/:learnerId",
  authMiddleware,
  async (req, res) => {
    try {
      const learnerId = req.params["learnerId"];
      const conversations = await conversation
        .find({ learnerId: learnerId })
        .populate("mentorId", "firstName lastName email")
        .sort({ updatedAt: -1 });

      // Get mentor profiles to include profile pictures
      const MentorProfile = require("../models/mentorProfile");
      const mentorIds = conversations.map((conv) => conv.mentorId._id);
      const mentorProfiles = await MentorProfile.find({
        mentorId: { $in: mentorIds },
      });

      // Enhance conversations with profile pictures
      const enhancedConversations = conversations.map((conv) => {
        const mentorProfile = mentorProfiles.find(
          (profile) =>
            profile.mentorId.toString() === conv.mentorId._id.toString()
        );

        return {
          ...conv.toObject(),
          mentorId: {
            ...conv.mentorId.toObject(),
            profilePictureUrl: mentorProfile?.profilePictureUrl || null,
          },
        };
      });

      res.status(200).json(enhancedConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({
        error: "Failed to fetch conversations",
        details: error.message,
      });
    }
  }
);

router.post("/learner/appointment", authMiddleware, async (req, res) => {
  try {
    const { mentorId, appointmentDateTime, skill } = req.body;
    const learnerId = req.learner._id;

    // Verify mentor exists
    const mentorExists = await mentor.findById(mentorId);
    if (!mentorExists) {
      return res.status(404).json({ error: "Mentor not found" });
    }

    // Get mentor profile to check availability and skills
    const mentorProfile = await MentorProfile.findOne({ mentorId });
    if (!mentorProfile) {
      return res.status(404).json({ error: "Mentor profile not found" });
    }

    // Verify mentor teaches this skill
    if (!mentorProfile.skills.includes(skill)) {
      return res
        .status(400)
        .json({ error: "Mentor does not teach this skill" });
    }

    // Check if the time slot is available for this skill
    const appointmentDate = new Date(appointmentDateTime);
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const dayOfWeek = days[appointmentDate.getDay()];
    const timeSlot = appointmentDate.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    const availableSlot = mentorProfile.availability[dayOfWeek]?.find(
      (slot) =>
        slot.startTime === timeSlot &&
        slot.isAvailable &&
        slot.skills.includes(skill)
    );

    if (!availableSlot) {
      return res
        .status(400)
        .json({ error: "Selected time slot is not available for this skill" });
    }

    const learner = await Learner.findById(learnerId);
    const learnerName = `${learner.firstName} ${learner.lastName}`;
    const mentorName = `${mentorExists.firstName} ${mentorExists.lastName}`;

    // Check for existing appointments in this time slot
    const existingAppointment = await Appointment.findOne({
      mentorId,
      appointmentDateTime,
      status: { $nin: ["cancelled", "rejected"] },
    });

    if (existingAppointment) {
      return res.status(400).json({ error: "Time slot is already booked" });
    }

    const appointment = new Appointment({
      mentorId,
      learnerId,
      learnerName: learnerName,
      mentorName: mentorName,
      appointmentDateTime: new Date(appointmentDateTime),
      skill: skill,
      duration: availableSlot.duration,
      status: "pending",
      statusHistory: [
        {
          status: "pending",
          updatedBy: learnerId,
          note: "Appointment requested by learner",
        },
      ],
    });

    await appointment.save();

    // Send notification to mentor about the new appointment request
    try {
      console.log("Sending notification to mentor:", {
        mentorId,
        learnerName,
        appointmentDateTime,
        skill,
      });

      await NotificationService.notifyAppointmentBooked(
        mentorId,
        learnerName,
        appointmentDateTime,
        skill
      );

      console.log("Notification sent successfully");
    } catch (notificationError) {
      console.error("Failed to send notification:", notificationError);
      // Continue with the response even if notification fails
    }

    res.status(201).json({
      message: "Appointment request sent successfully",
      appointment,
    });
  } catch (error) {
    console.error("Appointment creation error:", error);
    res.status(500).json({
      error: "Failed to create appointment request",
      details: error.message,
    });
  }
});

router.get("/learner/appointments/:id", async (req, res) => {
  try {
    const id = req.params["id"];
    const appointments = await Appointment.find({
      $or: [{ learnerId: id }, { mentorId: id }],
    })
      .populate("mentorId", "firstName lastName email") // Adjust fields based on your mentor schema
      .sort({ appointmentDateTime: 1 }); // Sort by date ascending

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/learner/appointment/:id", authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      learnerId: req.learner._id,
    }).populate("mentorId", "firstName lastName email");

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch(
  "/learner/appointment/:id/cancel",
  authMiddleware,
  async (req, res) => {
    try {
      const appointment = await Appointment.findOne({
        _id: req.params.id,
        learnerId: req.learner._id,
      });

      if (!appointment) {
        return res
          .status(404)
          .json({ error: "Appointment not found or cannot be cancelled" });
      }

      if (new Date(appointment.appointmentDateTime) <= new Date()) {
        return res
          .status(400)
          .json({ error: "Cannot cancel past appointments" });
      }

      appointment.status = "cancelled";
      await appointment.save();

      res.status(200).json({
        message: "Appointment cancelled successfully",
        appointment,
      });
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.get(
  "/learner/appointments/upcoming",
  authMiddleware,
  async (req, res) => {
    try {
      const appointments = await Appointment.find({
        learnerId: req.learner._id,
        appointmentDateTime: { $gt: new Date() },
        status: "scheduled",
      })
        .populate("mentorId", "firstName lastName email")
        .sort({ appointmentDateTime: 1 })
        .limit(10);

      res.status(200).json(appointments);
    } catch (error) {
      console.error("Error fetching upcoming appointments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = router;
