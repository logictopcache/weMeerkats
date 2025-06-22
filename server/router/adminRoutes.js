const express = require("express");
const { adminAuthMiddleware } = require("./adminAuth");
const Mentor = require("../models/mentorSchema");
const Learner = require("../models/learnerSchema");
const MentorProfile = require("../models/mentorProfile");
const LearnerProfile = require("../models/learnerProfile");

const adminDashboardRouter = express.Router();

// Get dashboard statistics
adminDashboardRouter.get(
  "/admin/dashboard/stats",
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const [
        totalMentors,
        totalMentees,
        pendingMentors,
        pendingMentees,
        approvedMentors,
        approvedMentees,
        rejectedMentors,
        rejectedMentees,
      ] = await Promise.all([
        Mentor.countDocuments(),
        Learner.countDocuments(),
        Mentor.countDocuments({
          emailVerified: true,
          verified: false,
          rejected: { $ne: true },
        }),
        Learner.countDocuments({
          emailVerified: true,
          verified: false,
          rejected: { $ne: true },
        }),
        Mentor.countDocuments({ verified: true }),
        Learner.countDocuments({ verified: true }),
        Mentor.countDocuments({ rejected: true }),
        Learner.countDocuments({ rejected: true }),
      ]);

      res.json({
        totalMentors,
        totalMentees,
        pendingMentors,
        pendingMentees,
        approvedMentors,
        approvedMentees,
        rejectedMentors,
        rejectedMentees,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard statistics" });
    }
  }
);

// Get pending mentors
adminDashboardRouter.get(
  "/admin/mentors/pending",
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const pendingMentors = await Mentor.find({
        emailVerified: true,
        verified: false,
        rejected: { $ne: true },
      }).select("firstName lastName email createdAt");

      // Get mentor profiles for additional info
      const mentorIds = pendingMentors.map((m) => m._id);
      const mentorProfiles = await MentorProfile.find({
        mentorId: { $in: mentorIds },
      });

      const enrichedMentors = pendingMentors.map((mentor) => {
        const profile = mentorProfiles.find(
          (p) => p.mentorId.toString() === mentor._id.toString()
        );

        return {
          ...mentor.toObject(),
          profile: profile
            ? {
                fullName: profile.fullName,
                bio: profile.bio,
                skills: profile.skills,
                expertise: profile.expertise,
                education: profile.education,
                workExperiences: profile.workExperiences,
                profilePictureUrl: profile.profilePictureUrl,
              }
            : null,
        };
      });

      res.json(enrichedMentors);
    } catch (error) {
      console.error("Error fetching pending mentors:", error);
      res.status(500).json({ error: "Failed to fetch pending mentors" });
    }
  }
);

// Get pending mentees
adminDashboardRouter.get(
  "/admin/mentees/pending",
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const pendingMentees = await Learner.find({
        emailVerified: true,
        verified: false,
        rejected: { $ne: true },
      }).select("firstName lastName email createdAt");

      // Get learner profiles for additional info
      const learnerIds = pendingMentees.map((l) => l._id);
      const learnerProfiles = await LearnerProfile.find({
        learnerId: { $in: learnerIds },
      });

      const enrichedMentees = pendingMentees.map((mentee) => {
        const profile = learnerProfiles.find(
          (p) => p.learnerId.toString() === mentee._id.toString()
        );

        return {
          ...mentee.toObject(),
          profile: profile
            ? {
                fullName: profile.fullName,
                bio: profile.bio,
                skills: profile.skills,
                education: profile.education,
                profilePictureUrl: profile.profilePictureUrl,
              }
            : null,
        };
      });

      res.json(enrichedMentees);
    } catch (error) {
      console.error("Error fetching pending mentees:", error);
      res.status(500).json({ error: "Failed to fetch pending mentees" });
    }
  }
);

// Get all mentors with status
adminDashboardRouter.get(
  "/admin/mentors",
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      let filter = {};
      if (status === "pending") {
        filter = {
          emailVerified: true,
          verified: false,
          rejected: { $ne: true },
        };
      } else if (status === "approved") {
        filter = { verified: true };
      } else if (status === "rejected") {
        filter = { rejected: true };
      }

      const mentors = await Mentor.find(filter)
        .select("firstName lastName email verified rejected createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Mentor.countDocuments(filter);

      // Get mentor profiles
      const mentorIds = mentors.map((m) => m._id);
      const mentorProfiles = await MentorProfile.find({
        mentorId: { $in: mentorIds },
      });

      const enrichedMentors = mentors.map((mentor) => {
        const profile = mentorProfiles.find(
          (p) => p.mentorId.toString() === mentor._id.toString()
        );

        return {
          ...mentor.toObject(),
          profile: profile
            ? {
                fullName: profile.fullName,
                bio: profile.bio,
                skills: profile.skills,
                expertise: profile.expertise,
                profilePictureUrl: profile.profilePictureUrl,
              }
            : null,
        };
      });

      res.json({
        mentors: enrichedMentors,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.error("Error fetching mentors:", error);
      res.status(500).json({ error: "Failed to fetch mentors" });
    }
  }
);

// Get all mentees with status
adminDashboardRouter.get(
  "/admin/mentees",
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      let filter = {};
      if (status === "pending") {
        filter = {
          emailVerified: true,
          verified: false,
          rejected: { $ne: true },
        };
      } else if (status === "approved") {
        filter = { verified: true };
      } else if (status === "rejected") {
        filter = { rejected: true };
      }

      const mentees = await Learner.find(filter)
        .select("firstName lastName email verified rejected createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Learner.countDocuments(filter);

      // Get learner profiles
      const learnerIds = mentees.map((l) => l._id);
      const learnerProfiles = await LearnerProfile.find({
        learnerId: { $in: learnerIds },
      });

      const enrichedMentees = mentees.map((mentee) => {
        const profile = learnerProfiles.find(
          (p) => p.learnerId.toString() === mentee._id.toString()
        );

        return {
          ...mentee.toObject(),
          profile: profile
            ? {
                fullName: profile.fullName,
                bio: profile.bio,
                skills: profile.skills,
                education: profile.education,
                profilePictureUrl: profile.profilePictureUrl,
              }
            : null,
        };
      });

      res.json({
        mentees: enrichedMentees,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.error("Error fetching mentees:", error);
      res.status(500).json({ error: "Failed to fetch mentees" });
    }
  }
);

// Approve mentor
adminDashboardRouter.patch(
  "/admin/mentors/:id/approve",
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const mentorId = req.params.id;

      const mentor = await Mentor.findByIdAndUpdate(
        mentorId,
        {
          verified: true,
          rejected: false,
          approvedAt: new Date(),
          approvedBy: req.admin.id,
        },
        { new: true }
      );

      if (!mentor) {
        return res.status(404).json({ error: "Mentor not found" });
      }

      res.json({
        message: "Mentor approved successfully",
        mentor: {
          id: mentor._id,
          name: `${mentor.firstName} ${mentor.lastName}`,
          email: mentor.email,
          verified: mentor.verified,
        },
      });
    } catch (error) {
      console.error("Error approving mentor:", error);
      res.status(500).json({ error: "Failed to approve mentor" });
    }
  }
);

// Reject mentor
adminDashboardRouter.patch(
  "/admin/mentors/:id/reject",
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const mentorId = req.params.id;
      const { reason } = req.body;

      const mentor = await Mentor.findByIdAndUpdate(
        mentorId,
        {
          verified: false,
          rejected: true,
          rejectionReason: reason,
          rejectedAt: new Date(),
          rejectedBy: req.admin.id,
        },
        { new: true }
      );

      if (!mentor) {
        return res.status(404).json({ error: "Mentor not found" });
      }

      res.json({
        message: "Mentor rejected successfully",
        mentor: {
          id: mentor._id,
          name: `${mentor.firstName} ${mentor.lastName}`,
          email: mentor.email,
          rejected: mentor.rejected,
          rejectionReason: mentor.rejectionReason,
        },
      });
    } catch (error) {
      console.error("Error rejecting mentor:", error);
      res.status(500).json({ error: "Failed to reject mentor" });
    }
  }
);

// Approve mentee
adminDashboardRouter.patch(
  "/admin/mentees/:id/approve",
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const menteeId = req.params.id;

      const mentee = await Learner.findByIdAndUpdate(
        menteeId,
        {
          verified: true,
          rejected: false,
          approvedAt: new Date(),
          approvedBy: req.admin.id,
        },
        { new: true }
      );

      if (!mentee) {
        return res.status(404).json({ error: "Mentee not found" });
      }

      res.json({
        message: "Mentee approved successfully",
        mentee: {
          id: mentee._id,
          name: `${mentee.firstName} ${mentee.lastName}`,
          email: mentee.email,
          verified: mentee.verified,
        },
      });
    } catch (error) {
      console.error("Error approving mentee:", error);
      res.status(500).json({ error: "Failed to approve mentee" });
    }
  }
);

// Reject mentee
adminDashboardRouter.patch(
  "/admin/mentees/:id/reject",
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const menteeId = req.params.id;
      const { reason } = req.body;

      const mentee = await Learner.findByIdAndUpdate(
        menteeId,
        {
          verified: false,
          rejected: true,
          rejectionReason: reason,
          rejectedAt: new Date(),
          rejectedBy: req.admin.id,
        },
        { new: true }
      );

      if (!mentee) {
        return res.status(404).json({ error: "Mentee not found" });
      }

      res.json({
        message: "Mentee rejected successfully",
        mentee: {
          id: mentee._id,
          name: `${mentee.firstName} ${mentee.lastName}`,
          email: mentee.email,
          rejected: mentee.rejected,
          rejectionReason: mentee.rejectionReason,
        },
      });
    } catch (error) {
      console.error("Error rejecting mentee:", error);
      res.status(500).json({ error: "Failed to reject mentee" });
    }
  }
);

// Get mentor details
adminDashboardRouter.get(
  "/admin/mentors/:id",
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const mentorId = req.params.id;

      const mentor = await Mentor.findById(mentorId);
      if (!mentor) {
        return res.status(404).json({ error: "Mentor not found" });
      }

      const mentorProfile = await MentorProfile.findOne({ mentorId });

      res.json({
        ...mentor.toObject(),
        profile: mentorProfile,
      });
    } catch (error) {
      console.error("Error fetching mentor details:", error);
      res.status(500).json({ error: "Failed to fetch mentor details" });
    }
  }
);

// Get mentee details
adminDashboardRouter.get(
  "/admin/mentees/:id",
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const menteeId = req.params.id;

      const mentee = await Learner.findById(menteeId);
      if (!mentee) {
        return res.status(404).json({ error: "Mentee not found" });
      }

      const learnerProfile = await LearnerProfile.findOne({
        learnerId: menteeId,
      });

      res.json({
        ...mentee.toObject(),
        profile: learnerProfile,
      });
    } catch (error) {
      console.error("Error fetching mentee details:", error);
      res.status(500).json({ error: "Failed to fetch mentee details" });
    }
  }
);

module.exports = adminDashboardRouter;
