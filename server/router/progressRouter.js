const express = require("express");
const router = express.Router();
const { Progress, SkillAssignment } = require("../models/progressSchema");
const SkillCategory = require("../models/skillCategorySchema");
const LearningPath = require("../models/learningPathSchema");
const MentorProfile = require("../models/mentorProfile");
const jwt = require("jsonwebtoken");
const Learner = require("../models/learnerSchema");
const Mentor = require("../models/mentorSchema");
const { NotificationService } = require("../util/notificationService");
const LearnerProfile = require("../models/learnerProfile");
const Appointment = require("../models/appointmentSchema");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization token required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Try to find either a learner or mentor based on the token
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
      req.learner = learner;
      req.userType = "learner";
    } else {
      req.mentor = mentor;
      req.userType = "mentor";
    }
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Helper middleware to ensure user is a mentor
const ensureMentor = (req, res, next) => {
  if (req.userType !== "mentor") {
    return res
      .status(403)
      .json({ error: "Access denied. Mentor only endpoint." });
  }
  next();
};

// Helper middleware to ensure user is a learner
const ensureLearner = (req, res, next) => {
  if (req.userType !== "learner") {
    return res
      .status(403)
      .json({ error: "Access denied. Learner only endpoint." });
  }
  next();
};

// 1. Learning Path Management
router.post(
  "/api/learner/learning-path",
  [authMiddleware, ensureLearner],
  async (req, res) => {
    try {
      const { selectedCategory, selectedSkills } = req.body;

      let learningPath = await LearningPath.findOne({
        learnerId: req.learner._id,
      });

      if (learningPath) {
        learningPath.selectedCategory = selectedCategory;
        learningPath.selectedSkills = selectedSkills;
        await learningPath.save();
      } else {
        learningPath = new LearningPath({
          learnerId: req.learner._id,
          selectedCategory,
          selectedSkills,
        });
        await learningPath.save();
      }

      res.status(200).json({
        message: "Learning path updated successfully",
        learningPath,
      });
    } catch (error) {
      console.error("Learning path update error:", error);
      res.status(500).json({
        error: "Failed to update learning path",
        details: error.message,
      });
    }
  }
);

router.get(
  "/api/learner/learning-path/:learnerId",
  [authMiddleware, ensureLearner],
  async (req, res) => {
    try {
      const learningPath = await LearningPath.findOne({
        learnerId: req.params.learnerId,
      });

      if (!learningPath) {
        return res.status(404).json({ error: "Learning path not found" });
      }

      // Get the actual progress from Progress model
      const progress = await Progress.findOne({
        learnerId: req.params.learnerId,
      });

      if (progress) {
        // Update learning path skills with actual progress
        learningPath.selectedSkills = learningPath.selectedSkills.map(
          (skill) => {
            const skillProgress = progress.skillProgress.find(
              (sp) => sp.skillName === skill.name
            );
            if (skillProgress) {
              skill.progress = skillProgress.progress;
            }
            return skill;
          }
        );

        // Save the updated learning path
        await learningPath.save();
      }

      res.status(200).json(learningPath);
    } catch (error) {
      console.error("Learning path fetch error:", error);
      res.status(500).json({
        error: "Failed to fetch learning path",
        details: error.message,
      });
    }
  }
);

// 2. Skill Progress
router.get("/api/learner/skills/:category", async (req, res) => {
  try {
    const category = await SkillCategory.findOne({ name: req.params.category });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json(category.skills);
  } catch (error) {
    console.error("Skills fetch error:", error);
    res.status(500).json({
      error: "Failed to fetch skills",
      details: error.message,
    });
  }
});

router.post(
  "/api/learner/skill-progress",
  [authMiddleware, ensureLearner],
  async (req, res) => {
    try {
      const { skillName, progress } = req.body;

      const learningPath = await LearningPath.findOne({
        learnerId: req.learner._id,
      });

      if (!learningPath) {
        return res.status(404).json({ error: "Learning path not found" });
      }

      const skillIndex = learningPath.selectedSkills.findIndex(
        (s) => s.name === skillName
      );

      if (skillIndex === -1) {
        return res
          .status(400)
          .json({ error: "Skill not found in learning path" });
      }

      learningPath.selectedSkills[skillIndex].progress = progress;
      await learningPath.save();

      res.status(200).json({
        message: "Skill progress updated successfully",
        learningPath,
      });
    } catch (error) {
      console.error("Skill progress update error:", error);
      res.status(500).json({
        error: "Failed to update skill progress",
        details: error.message,
      });
    }
  }
);

// 3. Course Progress
router.get(
  "/api/mentor/course-progress/:courseId",
  [authMiddleware, ensureMentor],
  async (req, res) => {
    try {
      const progress = await Progress.findOne({ courseId: req.params.courseId })
        .populate("learnerId", "firstName lastName email")
        .populate("mentorId", "firstName lastName email");

      if (!progress) {
        return res.status(404).json({ error: "Course progress not found" });
      }

      res.status(200).json(progress);
    } catch (error) {
      console.error("Course progress fetch error:", error);
      res.status(500).json({
        error: "Failed to fetch course progress",
        details: error.message,
      });
    }
  }
);

router.post(
  "/api/mentor/course-progress",
  [authMiddleware, ensureMentor],
  async (req, res) => {
    try {
      const { learnerId, courseId, skillProgress, notes } = req.body;

      let progress = await Progress.findOne({
        learnerId,
        courseId,
        mentorId: req.mentor._id,
      });

      if (progress) {
        if (skillProgress) {
          progress.skillProgress = skillProgress;
        }
        if (notes) {
          const lastSession = progress.sessions[progress.sessions.length - 1];
          if (lastSession) {
            lastSession.notes = notes;
          }
        }
        await progress.save();
      } else {
        progress = new Progress({
          learnerId,
          mentorId: req.mentor._id,
          courseId,
          skillProgress: skillProgress || [],
        });
        await progress.save();
      }

      res.status(200).json({
        message: "Course progress updated successfully",
        progress,
      });
    } catch (error) {
      console.error("Course progress update error:", error);
      res.status(500).json({
        error: "Failed to update course progress",
        details: error.message,
      });
    }
  }
);

// 4. Assignments
router.post(
  "/api/mentor/assignment",
  [authMiddleware, ensureMentor],
  async (req, res) => {
    try {
      const { courseId, title, description, dueDate } = req.body;

      const progress = await Progress.findOne({
        courseId,
        mentorId: req.mentor._id,
      });

      if (!progress) {
        return res.status(404).json({ error: "Course progress not found" });
      }

      progress.assignments.push({
        title,
        description,
        submissionDate: dueDate,
      });

      await progress.save();

      res.status(201).json({
        message: "Assignment created successfully",
        assignment: progress.assignments[progress.assignments.length - 1],
      });
    } catch (error) {
      console.error("Assignment creation error:", error);
      res.status(500).json({
        error: "Failed to create assignment",
        details: error.message,
      });
    }
  }
);

router.put(
  "/api/mentor/assignment/:assignmentId",
  [authMiddleware, ensureMentor],
  async (req, res) => {
    try {
      const { status, feedback, grade } = req.body;

      const progress = await Progress.findOne({
        "assignments._id": req.params.assignmentId,
        mentorId: req.mentor._id,
      }).populate("learnerId");

      if (!progress) {
        return res.status(404).json({ error: "Assignment not found" });
      }

      const assignment = progress.assignments.id(req.params.assignmentId);

      if (status) assignment.status = status;
      if (feedback) assignment.feedback = feedback;
      if (grade !== undefined) assignment.grade = grade;

      await progress.save();

      // If feedback is provided, send a notification to the learner
      if (feedback) {
        await NotificationService.notifyMentorFeedback(
          progress.learnerId._id,
          assignment.title
        );
      }

      res.status(200).json({
        message: "Assignment updated successfully",
        assignment,
      });
    } catch (error) {
      console.error("Assignment update error:", error);
      res.status(500).json({
        error: "Failed to update assignment",
        details: error.message,
      });
    }
  }
);

// 5. Sessions
router.post(
  "/api/mentor/session",
  [authMiddleware, ensureMentor],
  async (req, res) => {
    try {
      const { learnerId, courseId, date, duration } = req.body;

      const progress = await Progress.findOne({
        learnerId,
        courseId,
        mentorId: req.mentor._id,
      });

      if (!progress) {
        return res.status(404).json({ error: "Course progress not found" });
      }

      progress.sessions.push({
        date,
        duration,
        status: "scheduled",
      });

      await progress.save();

      res.status(201).json({
        message: "Session scheduled successfully",
        session: progress.sessions[progress.sessions.length - 1],
      });
    } catch (error) {
      console.error("Session scheduling error:", error);
      res.status(500).json({
        error: "Failed to schedule session",
        details: error.message,
      });
    }
  }
);

router.put(
  "/api/mentor/session/:sessionId",
  [authMiddleware, ensureMentor],
  async (req, res) => {
    try {
      const { status, notes } = req.body;

      const progress = await Progress.findOne({
        "sessions._id": req.params.sessionId,
        mentorId: req.mentor._id,
      });

      if (!progress) {
        return res.status(404).json({ error: "Session not found" });
      }

      const session = progress.sessions.id(req.params.sessionId);

      if (status) session.status = status;
      if (notes) session.notes = notes;

      await progress.save();

      res.status(200).json({
        message: "Session updated successfully",
        session,
      });
    } catch (error) {
      console.error("Session update error:", error);
      res.status(500).json({
        error: "Failed to update session",
        details: error.message,
      });
    }
  }
);

// Add this before other routes
router.post("/api/skill-category", async (req, res) => {
  try {
    const { name, skills } = req.body;

    const category = new SkillCategory({
      name,
      skills,
    });

    await category.save();

    res.status(201).json({
      message: "Skill category created successfully",
      category,
    });
  } catch (error) {
    console.error("Skill category creation error:", error);
    res.status(500).json({
      error: "Failed to create skill category",
      details: error.message,
    });
  }
});

// Add this after the skill category creation endpoint
router.get("/api/skill-categories", async (req, res) => {
  try {
    const categories = await SkillCategory.find();

    res.status(200).json({
      message: "Categories fetched successfully",
      categories,
    });
  } catch (error) {
    console.error("Categories fetch error:", error);
    res.status(500).json({
      error: "Failed to fetch categories",
      details: error.message,
    });
  }
});

// Add this endpoint to update category skills
router.patch("/api/skill-category/:categoryName/skills", async (req, res) => {
  try {
    const { categoryName } = req.params;
    const { skills } = req.body;

    const category = await SkillCategory.findOne({ name: categoryName });

    if (!category) {
      return res.status(404).json({
        error: "Category not found",
      });
    }

    // Check for duplicate skill names
    const existingSkillNames = new Set(
      category.skills.map((skill) => skill.name)
    );
    const newSkillNames = new Set(skills.map((skill) => skill.name));
    const duplicates = [...newSkillNames].filter((name) =>
      existingSkillNames.has(name)
    );

    if (duplicates.length > 0) {
      return res.status(400).json({
        error: "Duplicate skills found",
        duplicateSkills: duplicates,
      });
    }

    // Add new skills to the category
    category.skills.push(...skills);
    await category.save();

    res.status(200).json({
      message: "Skills added successfully",
      category,
    });
  } catch (error) {
    console.error("Skills update error:", error);
    res.status(500).json({
      error: "Failed to add skills",
      details: error.message,
    });
  }
});

// Get all mentees' progress for a mentor
router.get(
  "/api/mentor/mentees-progress",
  [authMiddleware, ensureMentor],
  async (req, res) => {
    try {
      const mentorId = req.mentor._id;

      // Get mentor's profile to check which skills they teach
      const mentorProfile = await MentorProfile.findOne({ mentorId });
      if (!mentorProfile) {
        return res.status(404).json({ error: "Mentor profile not found" });
      }

      // Get all learning paths
      const learningPaths = await LearningPath.find().populate(
        "learnerId",
        "firstName lastName email"
      );

      // Get all progress records
      const progressRecords = await Progress.find().populate(
        "learnerId",
        "firstName lastName email"
      );

      // Get all learner profiles to include profile pictures
      const LearnerProfile = require("../models/learnerProfile");
      const learnerProfiles = await LearnerProfile.find({});

      // Get all skill assignments to calculate total weightage per skill
      const skillAssignments = await SkillAssignment.find({
        skillName: { $in: mentorProfile.skills },
      });

      const menteeProgress = [];

      for (const learningPath of learningPaths) {
        // Get progress record for this learner
        const progress = progressRecords.find(
          (p) =>
            p.learnerId._id.toString() === learningPath.learnerId._id.toString()
        );

        // Filter skills to only those taught by this mentor
        const relevantSkills = learningPath.selectedSkills.filter((skill) =>
          mentorProfile.skills.includes(skill.name)
        );

        if (relevantSkills.length === 0) continue; // Skip if learner isn't learning any of mentor's skills

        // Calculate progress for each skill
        const skillsProgress = relevantSkills.map((skill) => {
          const skillProgress = progress?.skillProgress.find(
            (sp) => sp.skillName === skill.name
          );

          const skillAssignmentsTotal = skillAssignments.filter(
            (sa) => sa.skillName === skill.name
          );

          const completedAssignments =
            skillProgress?.completedAssignments || [];
          const completedSkillAssignments = skillAssignments.filter(
            (sa) =>
              sa.skillName === skill.name &&
              completedAssignments.includes(sa._id)
          );

          const totalWeightage = skillAssignmentsTotal.reduce(
            (sum, assignment) => sum + assignment.weightage,
            0
          );

          const completedWeightage = completedSkillAssignments.reduce(
            (sum, assignment) => sum + assignment.weightage,
            0
          );

          const progressPercentage =
            totalWeightage > 0
              ? Math.round((completedWeightage / totalWeightage) * 100)
              : 0;

          return {
            name: skill.name,
            progress: progressPercentage,
            totalAssignments: skillAssignmentsTotal.length,
            completedAssignments: completedSkillAssignments.length,
          };
        });

        // Calculate overall progress across all relevant skills
        const overallProgress =
          skillsProgress.length > 0
            ? Math.round(
                skillsProgress.reduce((sum, skill) => sum + skill.progress, 0) /
                  skillsProgress.length
              )
            : 0;

        // Get learner profile to include profile picture
        const learnerProfile = learnerProfiles.find(
          (profile) =>
            profile.learnerId.toString() ===
            learningPath.learnerId._id.toString()
        );

        menteeProgress.push({
          learner: {
            ...learningPath.learnerId.toObject(),
            profilePictureUrl: learnerProfile?.profilePictureUrl || null,
          },
          overallProgress,
          skills: skillsProgress,
          startDate: progress?.startDate || learningPath.createdAt,
        });
      }

      res.status(200).json({
        menteeProgress: menteeProgress.sort(
          (a, b) => b.overallProgress - a.overallProgress
        ),
      });
    } catch (error) {
      console.error("Error fetching mentees progress:", error);
      res.status(500).json({
        error: "Failed to fetch mentees progress",
        details: error.message,
      });
    }
  }
);

// Create an assignment for a skill (mentor only)
router.post(
  "/api/mentor/skill/create-assignment",
  [authMiddleware, ensureMentor],
  async (req, res) => {
    try {
      const { skillName, title, description, weightage } = req.body;

      // Verify the mentor teaches this skill
      const mentorProfile = await MentorProfile.findOne({
        mentorId: req.mentor._id,
      });
      if (!mentorProfile || !mentorProfile.skills.includes(skillName)) {
        return res.status(403).json({
          error: "You are not authorized to create assignments for this skill",
        });
      }

      // Verify the skill exists
      const skillCategory = await SkillCategory.findOne({
        "skills.name": skillName,
      });

      if (!skillCategory) {
        return res.status(404).json({ error: "Skill not found" });
      }

      // Create the skill assignment
      const skillAssignment = new SkillAssignment({
        title,
        description,
        skillName,
        weightage,
        createdBy: req.mentor._id,
      });

      await skillAssignment.save();

      // Find all learners who have this skill in their learning path
      const learningPaths = await LearningPath.find({
        "selectedSkills.name": skillName,
      }).populate("learnerId");

      // Send notifications to all relevant learners
      const notificationPromises = learningPaths.map((path) =>
        NotificationService.notifyNewAssignment(path.learnerId._id, skillName)
      );

      await Promise.all(notificationPromises);

      res.status(201).json({
        message: "Skill assignment created successfully",
        assignment: skillAssignment,
      });
    } catch (error) {
      console.error("Skill assignment creation error:", error);
      res.status(500).json({
        error: "Failed to create skill assignment",
        details: error.message,
      });
    }
  }
);

// Get all assignments for a skill
router.get(
  "/api/skill-assignments/:skillName",
  [authMiddleware],
  async (req, res) => {
    try {
      const { skillName } = req.params;

      const assignments = await SkillAssignment.find({ skillName }).populate(
        "createdBy",
        "firstName lastName email"
      );

      res.status(200).json(assignments);
    } catch (error) {
      console.error("Error fetching skill assignments:", error);
      res.status(500).json({
        error: "Failed to fetch skill assignments",
        details: error.message,
      });
    }
  }
);

// Mark assignment as completed (learner only)
router.post(
  "/api/learner/complete-assignment/:assignmentId",
  [authMiddleware, ensureLearner],
  async (req, res) => {
    try {
      const { assignmentId } = req.params;

      // Verify assignment exists
      const assignment = await SkillAssignment.findById(assignmentId);
      if (!assignment) {
        return res.status(404).json({ error: "Assignment not found" });
      }

      // Get or create progress record
      let progress = await Progress.findOne({ learnerId: req.learner._id });
      if (!progress) {
        progress = new Progress({ learnerId: req.learner._id });
      }

      // Find or create skill progress
      let skillProgress = progress.skillProgress.find(
        (s) => s.skillName === assignment.skillName
      );
      if (!skillProgress) {
        skillProgress = {
          skillName: assignment.skillName,
          completedAssignments: [],
          progress: 0,
        };
        progress.skillProgress.push(skillProgress);
      }

      // Check if assignment is already completed
      if (
        skillProgress.completedAssignments.some(
          (id) => id.toString() === assignmentId
        )
      ) {
        return res.status(400).json({ error: "Assignment already completed" });
      }

      // Add assignment to completed list
      skillProgress.completedAssignments.push(assignmentId);

      // Save progress - the pre-save middleware will update the progress percentage
      await progress.save();

      // Update learning path progress
      const learningPath = await LearningPath.findOne({
        learnerId: req.learner._id,
      });
      if (learningPath) {
        const skillIndex = learningPath.selectedSkills.findIndex(
          (s) => s.name === assignment.skillName
        );
        if (skillIndex !== -1) {
          const updatedProgress = progress.skillProgress.find(
            (s) => s.skillName === assignment.skillName
          ).progress;
          learningPath.selectedSkills[skillIndex].progress = updatedProgress;
          await learningPath.save();
        }
      }

      // Fetch the updated skill progress to return in response
      const updatedSkillProgress = progress.skillProgress.find(
        (s) => s.skillName === assignment.skillName
      );

      res.status(200).json({
        message: "Assignment marked as completed",
        skillProgress: updatedSkillProgress,
        overallProgress: progress.overallProgress,
        learningPathProgress: learningPath
          ? learningPath.completedProgress
          : null,
      });
    } catch (error) {
      console.error("Error completing assignment:", error);
      res.status(500).json({
        error: "Failed to complete assignment",
        details: error.message,
      });
    }
  }
);

// Get assignments created by a mentor
router.get(
  "/api/mentor/created-assignments",
  [authMiddleware, ensureMentor],
  async (req, res) => {
    try {
      // Get all assignments created by the mentor
      const assignments = await SkillAssignment.find({
        createdBy: req.mentor._id,
      }).sort({ createdAt: -1 });

      // Get all progress records to check completion status
      const allProgress = await Progress.find({
        "skillProgress.completedAssignments": {
          $in: assignments.map((a) => a._id),
        },
      }).populate("learnerId", "firstName lastName email");

      // Enhance assignments with completion information
      const enhancedAssignments = assignments.map((assignment) => {
        const completedBy = allProgress
          .filter((progress) =>
            progress.skillProgress.some((skill) =>
              skill.completedAssignments.includes(assignment._id)
            )
          )
          .map((progress) => ({
            id: progress.learnerId._id,
            firstName: progress.learnerId.firstName,
            lastName: progress.learnerId.lastName,
            email: progress.learnerId.email,
            completedAt: progress.skillProgress.find((skill) =>
              skill.completedAssignments.includes(assignment._id)
            ).lastUpdated,
          }));

        return {
          ...assignment.toObject(),
          isCompleted: completedBy.length > 0,
          completedBy: completedBy,
          totalCompletions: completedBy.length,
        };
      });

      res.status(200).json(enhancedAssignments);
    } catch (error) {
      console.error("Error fetching created assignments:", error);
      res.status(500).json({
        error: "Failed to fetch assignments",
        details: error.message,
      });
    }
  }
);

// Get learner's completed assignments (for learner)
router.get(
  "/api/learner/completed-assignments",
  [authMiddleware, ensureLearner],
  async (req, res) => {
    try {
      const progress = await Progress.findOne({ learnerId: req.learner._id });

      if (!progress) {
        return res.status(200).json({ completedAssignments: [] });
      }

      // Get all completed assignments with details
      const completedAssignments = [];
      for (const skillProgress of progress.skillProgress) {
        const assignments = await SkillAssignment.find({
          _id: { $in: skillProgress.completedAssignments },
        }).populate("createdBy", "firstName lastName");

        completedAssignments.push({
          skillName: skillProgress.skillName,
          progress: skillProgress.progress,
          assignments: assignments,
        });
      }

      res.status(200).json({
        completedAssignments,
      });
    } catch (error) {
      console.error("Error fetching completed assignments:", error);
      res.status(500).json({
        error: "Failed to fetch completed assignments",
        details: error.message,
      });
    }
  }
);

// Get learner's completed assignments by skill (for learner)
router.get(
  "/api/learner/completed-assignments/:skillName",
  [authMiddleware, ensureLearner],
  async (req, res) => {
    try {
      const { skillName } = req.params;
      const progress = await Progress.findOne({ learnerId: req.learner._id });

      if (!progress) {
        return res.status(200).json({ completedAssignments: [] });
      }

      const skillProgress = progress.skillProgress.find(
        (s) => s.skillName === skillName
      );
      if (!skillProgress) {
        return res.status(200).json({ completedAssignments: [] });
      }

      const completedAssignments = await SkillAssignment.find({
        _id: { $in: skillProgress.completedAssignments },
      }).populate("createdBy", "firstName lastName");

      res.status(200).json({
        skillName,
        progress: skillProgress.progress,
        completedAssignments,
      });
    } catch (error) {
      console.error("Error fetching skill completed assignments:", error);
      res.status(500).json({
        error: "Failed to fetch completed assignments",
        details: error.message,
      });
    }
  }
);

// Get all assignments status for a skill (completed and pending)
router.get(
  "/api/learner/skill-assignments-status/:skillName",
  [authMiddleware, ensureLearner],
  async (req, res) => {
    try {
      const { skillName } = req.params;

      // Get all assignments for the skill
      const allAssignments = await SkillAssignment.find({ skillName }).populate(
        "createdBy",
        "firstName lastName"
      );

      // Get learner's progress
      const progress = await Progress.findOne({ learnerId: req.learner._id });
      const skillProgress = progress?.skillProgress.find(
        (s) => s.skillName === skillName
      );
      const completedIds = skillProgress
        ? skillProgress.completedAssignments.map((id) => id.toString())
        : [];

      // Mark assignments as completed or pending
      const assignmentsWithStatus = allAssignments.map((assignment) => ({
        ...assignment.toObject(),
        status: completedIds.includes(assignment._id.toString())
          ? "completed"
          : "pending",
      }));

      res.status(200).json({
        skillName,
        progress: skillProgress?.progress || 0,
        assignments: assignmentsWithStatus,
      });
    } catch (error) {
      console.error("Error fetching assignments status:", error);
      res.status(500).json({
        error: "Failed to fetch assignments status",
        details: error.message,
      });
    }
  }
);

// Find the progress update route and add notification
router.put("/progress/:progressId", async (req, res) => {
  try {
    const { progressId } = req.params;
    const { progress, courseId } = req.body;

    const updatedProgress = await Progress.findByIdAndUpdate(
      progressId,
      { progress },
      { new: true }
    ).populate("courseId");

    if (!updatedProgress) {
      return res.status(404).json({ error: "Progress not found" });
    }

    // Create notification if progress is a multiple of 25%
    if (progress % 25 === 0) {
      await NotificationService.notifyProgressUpdate(
        updatedProgress.learnerId,
        updatedProgress.courseId.name,
        progress
      );
    }

    res.status(200).json(updatedProgress);
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get mentee profile data for mentor view
router.get(
  "/api/mentor/mentee-profile/:learnerId",
  [authMiddleware, ensureMentor],
  async (req, res) => {
    try {
      const { learnerId } = req.params;

      // Get learner profile
      const learnerProfile = await LearnerProfile.findOne({
        learnerId,
      }).populate("learnerId", "firstName lastName email");

      if (!learnerProfile) {
        return res.status(404).json({ error: "Learner profile not found" });
      }

      // Get learning path and skills
      const learningPath = await LearningPath.findOne({ learnerId });

      // Get progress data
      const progress = await Progress.findOne({ learnerId });

      // Get upcoming sessions
      const upcomingAppointments = await Appointment.find({
        learnerId,
        appointmentDateTime: { $gte: new Date() },
        status: { $in: ["pending", "accepted"] },
      })
        .populate({
          path: "mentorId",
          select: "firstName lastName email",
          model: "Mentor", // Explicitly specify the model
        })
        .sort({ appointmentDateTime: 1 })
        .limit(5);

      // Calculate skill progress
      const skillsProgress = [];
      if (learningPath && progress) {
        for (const skill of learningPath.selectedSkills) {
          const skillProgress = progress.skillProgress.find(
            (sp) => sp.skillName === skill.name
          );
          if (skillProgress) {
            skillsProgress.push({
              name: skill.name,
              progress: skillProgress.progress || 0,
            });
          }
        }
      }

      // Format the response
      const response = {
        profile: {
          id: learnerProfile.learnerId._id,
          fullName:
            learnerProfile.fullName ||
            `${learnerProfile.learnerId.firstName} ${learnerProfile.learnerId.lastName}`,
          email: learnerProfile.learnerId.email,
          bio: learnerProfile.bio || "",
          profilePicture: learnerProfile.profilePictureUrl,
          status: "Active Learner",
        },
        skillsToLearn: learnerProfile.skills || [],
        learningProgress: skillsProgress,
        upcomingSessions: upcomingAppointments.map((appointment) => {
          // Add debug logging

          return {
            title: appointment.mentorId
              ? `Session with ${appointment.mentorId.firstName || ""} ${
                  appointment.mentorId.lastName || ""
                }`.trim()
              : "Session",
            date: appointment.appointmentDateTime,
            time: new Date(appointment.appointmentDateTime).toLocaleTimeString(
              "en-US",
              {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }
            ),
            skill: appointment.skill,
          };
        }),
      };

      res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching mentee profile:", error);
      res.status(500).json({
        error: "Failed to fetch mentee profile",
        details: error.message,
      });
    }
  }
);

module.exports = router;
