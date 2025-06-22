const mongoose = require("mongoose");

const LearnerOTPVerificationSchema = new mongoose.Schema({
  otp: String,
  userId: String,
  createdAt: Date,
  expiresAt: Date,
});

const LearnerOTPVerification = mongoose.model(
  "LearnerOTPVerification",
  LearnerOTPVerificationSchema
);

module.exports = LearnerOTPVerification;
