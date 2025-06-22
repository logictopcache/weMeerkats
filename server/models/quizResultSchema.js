const mongoose = require("mongoose");

const quizResultSchema = new mongoose.Schema(
  {
    learnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Learner",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    totalQuestions: {
      type: Number,
      default: 5,
    },
    timeTaken: {
      type: Number, // in seconds
      default: 0,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    retakeCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index to ensure one result per learner per category (for update on retake)
quizResultSchema.index({ learnerId: 1, category: 1 }, { unique: true });

// Add method to calculate performance level
quizResultSchema.methods.getPerformanceLevel = function () {
  if (this.percentage >= 80) return "Excellent";
  if (this.percentage >= 60) return "Good";
  if (this.percentage >= 40) return "Average";
  return "Needs Improvement";
};

const QuizResult = mongoose.model("QuizResult", quizResultSchema);
module.exports = QuizResult;
