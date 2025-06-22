const mongoose = require("mongoose");

const MentorOTPVerificationSchema = new mongoose.Schema({
  otp: String,
  userId: String,
  createdAt: Date,
  expiresAt: Date,
});

const MentorOTPVerification = mongoose.model(
  "MentorOTPVerification",
  MentorOTPVerificationSchema
);

module.exports = MentorOTPVerification;
