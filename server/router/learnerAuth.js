const bcrypt = require("bcryptjs");
const express = require("express");
const nodemailer = require("nodemailer");
const learnerRouter = express.Router();
const { body, validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");

const Learner = require("../models/learnerSchema");
const LearnerOTPVerification = require("../models/learnerOTPVerificationSchema");

const LearnerProfile = require("../models/learnerProfile");
const MentorProfile = require("../models/mentorProfile");
const skillMatchingService = require("../services/skillMatchingService");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.AUTHENTICATION_EMAIL,
    pass: process.env.AUTHENTICATION_PASSWORD,
  },
});

// Add matched mentors endpoint before the parameterized route
learnerRouter.get("/learner/matched-mentors", async (req, res) => {
  try {
    // Get learner ID from query parameter or token
    const learnerId = req.query.learnerId;

    if (!learnerId) {
      return res.status(400).json({
        error: "Learner ID is required",
        message: "Please provide learner ID as query parameter",
      });
    }

    // Get learner profile to extract skills
    const learnerProfile = await LearnerProfile.findOne({
      learnerId: learnerId,
    });

    if (
      !learnerProfile ||
      !learnerProfile.skills ||
      learnerProfile.skills.length === 0
    ) {
      return res.status(404).json({
        error: "Learner profile not found or no skills defined",
        message:
          "Please complete your profile with skills to get matched mentors",
      });
    }

    // Get all verified mentors with their profiles
    const mentorProfiles = await MentorProfile.find({
      isVerified: true,
    }).populate("mentorId", "firstName lastName email verified");

    if (!mentorProfiles || mentorProfiles.length === 0) {
      return res.status(404).json({
        error: "No verified mentors found",
        message: "No mentors are currently available",
      });
    }

    // Prepare mentor data for Python script
    const mentorsData = mentorProfiles.map((profile) => {
      const mentor = profile.mentorId;
      return {
        _id: profile.mentorId._id,
        mentorId: profile.mentorId._id,
        fullName: profile.fullName,
        email: profile.email || mentor.email,
        phone: profile.phone,
        bio: profile.bio,
        profilePictureUrl: profile.profilePictureUrl,
        education: profile.education || [],
        workExperiences: profile.workExperiences || [],
        certification: profile.certification,
        expertise: profile.expertise,
        skills: profile.skills || [],
        availability: profile.availability || {},
        isVerified: profile.isVerified,
        verified: mentor.verified,
        image: profile.profilePictureUrl
          ? `${req.protocol}://${req.get("host")}/uploads/${
              profile.profilePictureUrl
            }`
          : null,
      };
    });

    // Get query parameters for matching options
    const minScore = parseFloat(req.query.minScore) || 0.1;
    const maxResults = parseInt(req.query.maxResults) || 10;

    // Use Python script to rank mentors
    const matchingResult = await skillMatchingService.rankMentorsBySkills(
      learnerProfile.skills,
      mentorsData,
      {
        minScore: minScore,
        maxResults: maxResults,
      }
    );

    res.status(200).json({
      success: true,
      message: "Mentors matched successfully",
      data: {
        learner_skills: learnerProfile.skills,
        matched_mentors: matchingResult.ranked_mentors,
        total_mentors_processed: matchingResult.total_mentors_processed,
        mentors_returned: matchingResult.mentors_returned,
        matching_criteria: matchingResult.matching_criteria,
      },
    });
  } catch (error) {
    console.error("Error in mentor matching:", error);

    // Check if it's a Python dependency error
    if (error.message.includes("Python") || error.message.includes("python3")) {
      return res.status(503).json({
        error: "Skill matching service unavailable",
        message:
          "The matching service is currently unavailable. Please try again later.",
        details: "Python dependencies may not be installed",
      });
    }

    res.status(500).json({
      error: "Failed to match mentors",
      message: "An error occurred while matching mentors with your skills",
    });
  }
});

learnerRouter.get("/learner/:id", async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  const { id } = req.params;
  try {
    const learnerExists = await Learner.findById(id);
    if (!learnerExists) {
      return res.status(404).json({ error: "Learner Not Found" });
    }
    res.json({ message: "Learner Found", email: learnerExists["email"] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

learnerRouter.get("/learners", async (req, res) => {
  try {
    const learner = await Learner.find({ verified: true });
    res.status(200).json(learner);
  } catch (error) {
    console.error("Error fetching learner:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

learnerRouter.post(
  "/learner/signup",
  [
    body(
      "firstName",
      "Please Fill Out All the Fields Before Submitting"
    ).notEmpty(),
    body(
      "lastName",
      "Please Fill Out All the Fields Before Submitting"
    ).notEmpty(),
    body("email", "Please Provide A Valid Email Address").isEmail(),
    body("password", "Password Must Be At Least 6 Characters Long").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res
        .status(400)
        .json({ error: "Please fill out all the fields before submitting" });
    }

    try {
      const learnerExists = await Learner.findOne({ email: email });
      if (learnerExists) {
        return res.status(409).json({ error: "Learner Already Exists" });
      }

      const learner = new Learner({
        firstName,
        lastName,
        email,
        password,
        verified: false,
      });

      const learnerRegistration = await learner.save();

      if (learnerRegistration) {
        const otpVerificationResult = await learnerSendOTPVerificationEmail(
          learnerRegistration,
          res
        );
        return res.json({
          message: "Learner Registered Successfully",
          id: learnerRegistration["_id"],
          email: learnerRegistration["email"],
        });
      } else {
        return res.status(500).json({ error: "Learner Registration Failed" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

const learnerSendOTPVerificationEmail = async (learner, res) => {
  try {
    const otp = Math.floor(`${100000 + Math.random() * 900000}`).toString();
    const htmlEmail = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f4f4f7;
      margin: 0;
      padding: 0;
      color: #333333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 1px solid #e0e0e0;
    }
    .header h1 {
      font-size: 28px;
      color: #1d3557;
    }
    .content {
      text-align: center;
      padding: 20px 0;
    }
    .content p {
      font-size: 16px;
      color: #333333;
      margin-bottom: 15px;
    }
    .otp {
      font-size: 24px;
      background-color: #457b9d;
      color: #ffffff;
      padding: 10px 20px;
      display: inline-block;
      border-radius: 8px;
      margin-top: 10px;
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }
    .footer p {
      font-size: 14px;
      color: #7a7a7a;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Email Verification</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>Thank you for signing up. Please use the verification code below to verify your email address:</p>
      <div class="otp">${otp}</div>
    </div>
    <div class="content">
      <p>This code is valid for the next 5 minutes. If you didn’t request this, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>Sent by FYP2 | Need help? <a href="mailto:support@FYP2.com" style="color: #457b9d;">Contact Support</a></p>
    </div>
  </div>
</body>
</html>
`;

    const mailOptions = {
      from: process.env.AUTHENTICATION_EMAIL,
      to: learner.email,
      subject: "Confirm Your Email Address With FYP2",
      html: htmlEmail,
    };
    const saltRounds = 10;
    const hashedOTP = await bcrypt.hash(otp, saltRounds);
    const expirationDuration = 300000;
    const expiresAt = Date.now() + expirationDuration;
    const newOTPVerification = await new LearnerOTPVerification({
      otp: hashedOTP,
      userId: learner._id,
      createdAt: Date.now(),
      expiresAt: expiresAt,
    });
    await newOTPVerification.save();
    await transporter.sendMail(mailOptions);
    const additionalInformation = {
      userId: learner._id,
      email: learner.email,
    };
    return {
      status: "PENDING",
      message: "Verification OTP Email Sent",
      additionalInformation: additionalInformation,
    };
  } catch (error) {
    console.error("Error sending OTP verification email:", error);
    return {
      status: "FAILED",
      message: "Failed to send OTP verification email",
    };
  }
};

learnerRouter.post(
  "/learner/signin",
  [
    body(
      "email",
      "Please Fill Out All the Fields Before Submitting"
    ).notEmpty(),
    body(
      "password",
      "Please Fill Out All the Fields Before Submitting"
    ).notEmpty(),
    body("email", "Please Provide A Valid Email Address").isEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    } else {
      try {
        const { email, password } = req.body;
        if (!email || !password) {
          return res.status(400).json({ error: "All Fields Are Required" });
        }
        const learnerLogin = await Learner.findOne({ email: email });
        if (!learnerLogin) {
          return res.status(404).json({ error: "Learner Not Found" });
        }
        const isMatch = await bcrypt.compare(password, learnerLogin.password);
        const token = await learnerLogin.generateAuthenticationToken();
        res.cookie("jwtToken", token, {
          expires: new Date(Date.now() + 2592000000),
          httpOnly: true,
        });
        if (!isMatch) {
          return res.status(401).json({ error: "Invalid Credentials" });
        }
        res.json({
          message: "Learner Sign In Successfully",
          id: learnerLogin["_id"],
          email: learnerLogin["email"],
          token: token,
          emailVerified: learnerLogin.emailVerified,
          verified: learnerLogin.verified,
          rejected: learnerLogin.rejected,
          rejectionReason: learnerLogin.rejectionReason,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  }
);

learnerRouter.post("/learner/verifyOTP", async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ error: "Missing OTP or User ID" });
    }

    const otpRecord = await LearnerOTPVerification.findOne({
      userId: userId,
    });

    if (!otpRecord) {
      return res.status(400).json({ error: "Invalid or Expired OTP" });
    }

    if (otpRecord.expiresAt < Date.now()) {
      await LearnerOTPVerification.deleteOne({ userId: userId });
      return res.status(400).json({ error: "OTP has expired" });
    }

    const otpString = otp.toString();

    if (otpString === otpRecord.otp) {
      await Learner.updateOne({ _id: userId }, { emailVerified: true });
      await LearnerOTPVerification.deleteOne({ userId: userId });
      return res.status(200).json({ message: "OTP verified successfully" });
    }

    const isMatch = await bcrypt.compare(otpString, otpRecord.otp);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    await Learner.updateOne({ _id: userId }, { emailVerified: true });
    await LearnerOTPVerification.deleteOne({ userId: userId });

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

learnerRouter.post("/learner/resendOTPVerificationCode", async (req, res) => {
  try {
    const { userId, email } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ error: "All Fields Are Required" });
    }

    await LearnerOTPVerification.deleteMany({ userId });

    const otp = Math.floor(`${100000 + Math.random() * 900000}`).toString();
    const saltRounds = 10;
    const hashedOTP = await bcrypt.hash(otp, saltRounds);

    const expirationDuration = 300000;
    const expiresAt = Date.now() + expirationDuration;

    const newOTPVerification = await new LearnerOTPVerification({
      otp: hashedOTP,
      userId: userId,
      createdAt: Date.now(),
      expiresAt: expiresAt,
    }).save();

    const htmlEmail = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      background-color: #f4f4f7;
      margin: 0;
      padding: 0;
      color: #333333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 1px solid #e0e0e0;
    }
    .header h1 {
      font-size: 28px;
      color: #1d3557;
    }
    .content {
      text-align: center;
      padding: 20px 0;
    }
    .content p {
      font-size: 16px;
      color: #333333;
      margin-bottom: 15px;
    }
    .otp {
      font-size: 24px;
      background-color: #457b9d;
      color: #ffffff;
      padding: 10px 20px;
      display: inline-block;
      border-radius: 8px;
      margin-top: 10px;
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
    }
    .footer p {
      font-size: 14px;
      color: #7a7a7a;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Email Verification</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>Thank you for signing up. Please use the verification code below to verify your email address:</p>
      <div class="otp">${otp}</div>
    </div>
    <div class="content">
      <p>This code is valid for the next 5 minutes. If you didn’t request this, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>Sent by FYP2 | Need help? <a href="mailto:support@FYP2.com" style="color: #457b9d;">Contact Support</a></p>
    </div>
  </div>
</body>
</html>
`;

    const mailOptions = {
      from: process.env.AUTHENTICATION_EMAIL,
      to: email,
      subject: "Confirm Your Email Address With FYP2",
      html: htmlEmail,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      status: "PENDING",
      message: "Verification OTP Email Sent",
      additionalInformation: {
        userId: userId,
        email: email,
      },
    });
  } catch (error) {
    console.error("Error sending OTP verification email:", error);
    return res.status(500).json({
      status: "FAILED",
      message: "Failed to send OTP verification email",
    });
  }
});

learnerRouter.post("/learner/logout", (req, res) => {
  res.clearCookie("jwtToken", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
  res.json({ message: "Learner logged out successfully" });
});

module.exports = learnerRouter;
