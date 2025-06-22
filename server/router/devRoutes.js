const express = require("express");
const router = express.Router();
const MentorOTPVerification = require("../models/mentorOTPVerificationSchema");
const LearnerOTPVerification = require("../models/learnerOTPVerificationSchema");

// DEV ONLY: Endpoint to get unhashed OTP
router.get("/dev/get-otp/:userId/:type", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({ error: "Not found" });
  }

  try {
    const { userId, type } = req.params;
    let otpRecord;

    if (type === "learner") {
      otpRecord = await LearnerOTPVerification.findOne({
        userId: userId,
      });
    } else if (type === "mentor") {
      otpRecord = await MentorOTPVerification.findOne({
        userId: userId,
      });
    } else {
      return res.status(400).json({ error: "Invalid user type" });
    }

    if (!otpRecord) {
      return res.status(404).json({ error: "OTP not found" });
    }

    res.json({ otp: otpRecord.otp });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
