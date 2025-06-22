const express = require("express");
const router = express.Router();
const QuizResult = require("../models/quizResultSchema");
const authMiddleware = require("../util/socketIo");

// Middleware to authenticate learner
const authenticateLearner = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });
    }

    const learner = await authMiddleware(token);
    req.learner = learner;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token." });
  }
};

// Save or update quiz result
router.post("/api/quiz-result", authenticateLearner, async (req, res) => {
  try {
    const { category, score, percentage, timeTaken } = req.body;
    const learnerId = req.learner._id;

    // Validate input
    if (
      !category ||
      typeof score !== "number" ||
      typeof percentage !== "number"
    ) {
      return res.status(400).json({
        error: "Missing required fields: category, score, percentage",
      });
    }

    if (score < 0 || score > 5 || percentage < 0 || percentage > 100) {
      return res.status(400).json({
        error: "Invalid score or percentage values",
      });
    }

    // Check if result already exists for this learner and category
    let existingResult = await QuizResult.findOne({ learnerId, category });

    if (existingResult) {
      // Update existing result (retake)
      existingResult.score = score;
      existingResult.percentage = percentage;
      existingResult.timeTaken = timeTaken || 0;
      existingResult.completedAt = new Date();
      existingResult.retakeCount += 1;

      await existingResult.save();

      res.json({
        success: true,
        message: "Quiz result updated successfully",
        result: existingResult,
        isRetake: true,
      });
    } else {
      // Create new result
      const newResult = new QuizResult({
        learnerId,
        category,
        score,
        percentage,
        timeTaken: timeTaken || 0,
      });

      await newResult.save();

      res.json({
        success: true,
        message: "Quiz result saved successfully",
        result: newResult,
        isRetake: false,
      });
    }
  } catch (error) {
    console.error("Error saving quiz result:", error);
    res.status(500).json({ error: "Failed to save quiz result" });
  }
});

// Get quiz result for specific category
router.get(
  "/api/quiz-result/:category",
  authenticateLearner,
  async (req, res) => {
    try {
      const { category } = req.params;
      const learnerId = req.learner._id;

      const result = await QuizResult.findOne({ learnerId, category });

      if (!result) {
        return res
          .status(404)
          .json({ error: "No result found for this category" });
      }

      res.json({
        success: true,
        result: {
          ...result.toObject(),
          performanceLevel: result.getPerformanceLevel(),
        },
      });
    } catch (error) {
      console.error("Error fetching quiz result:", error);
      res.status(500).json({ error: "Failed to fetch quiz result" });
    }
  }
);

// Get all quiz results for the learner
router.get("/api/quiz-results", authenticateLearner, async (req, res) => {
  try {
    const learnerId = req.learner._id;

    const results = await QuizResult.find({ learnerId }).sort({
      completedAt: -1,
    });

    const resultsWithPerformance = results.map((result) => ({
      ...result.toObject(),
      performanceLevel: result.getPerformanceLevel(),
    }));

    res.json({
      success: true,
      results: resultsWithPerformance,
      totalQuizzes: results.length,
      averageScore:
        results.length > 0
          ? Math.round(
              results.reduce((sum, r) => sum + r.percentage, 0) / results.length
            )
          : 0,
    });
  } catch (error) {
    console.error("Error fetching quiz results:", error);
    res.status(500).json({ error: "Failed to fetch quiz results" });
  }
});

// Delete quiz result (optional - for admin or testing)
router.delete(
  "/api/quiz-result/:category",
  authenticateLearner,
  async (req, res) => {
    try {
      const { category } = req.params;
      const learnerId = req.learner._id;

      const result = await QuizResult.findOneAndDelete({ learnerId, category });

      if (!result) {
        return res
          .status(404)
          .json({ error: "No result found for this category" });
      }

      res.json({
        success: true,
        message: "Quiz result deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting quiz result:", error);
      res.status(500).json({ error: "Failed to delete quiz result" });
    }
  }
);

module.exports = router;
