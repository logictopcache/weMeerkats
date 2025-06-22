const bcrypt = require("bcryptjs");
const express = require("express");
const nodemailer = require("nodemailer");
const mentorRouter = express.Router();
const { body, validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");

const Mentor = require("../models/mentorSchema");
const MentorOTPVerification = require("../models/mentorOTPVerificationSchema");

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

mentorRouter.get("/mentor/:id", async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  const { id } = req.params;
  try {
    const mentorExists = await Mentor.findById(id);
    if (!mentorExists) {
      return res.status(404).json({ error: "Mentor Not Found" });
    }
    res.json({ message: "Mentor Found", email: mentorExists["email"] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

mentorRouter.get("/mentors", async (req, res) => {
  try {
    const mentors = await Mentor.find({ verified: true });
    res.status(200).json(mentors);
  } catch (error) {
    console.error("Error fetching mentors:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

mentorRouter.post(
  "/mentor/signup",
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
      const mentorExists = await Mentor.findOne({ email: email });
      if (mentorExists) {
        return res.status(409).json({ error: "Mentor Already Exists" });
      }

      const mentor = new Mentor({
        firstName,
        lastName,
        email,
        password,
        verified: false,
      });

      const mentorRegistration = await mentor.save();

      if (mentorRegistration) {
        await mentorSendOTPVerificationEmail(mentorRegistration, res);
        res.json({
          message: "Mentor Registered Successfully",
          id: mentorRegistration["_id"],
          email: mentorRegistration["email"],
        });
      } else {
        return res.status(500).json({ error: "Mentor Registration Failed" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

const mentorSendOTPVerificationEmail = async (mentor, res) => {
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
      to: mentor.email,
      subject: "Confirm Your Email Address With FYP2",
      html: htmlEmail,
    };
    const saltRounds = 10;
    const hashedOTP = await bcrypt.hash(otp, saltRounds);
    const expirationDuration = 60000;
    const expiresAt = Date.now() + expirationDuration;
    const newOTPVerification = new MentorOTPVerification({
      otp: hashedOTP,
      userId: mentor._id,
      createdAt: Date.now(),
      expiresAt: expiresAt,
    });
    await newOTPVerification.save();
    await transporter.sendMail(mailOptions);
    const additionalInformation = {
      userId: mentor._id,
      email: mentor.email,
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

mentorRouter.post("/mentor/verifyOTP", async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ error: "Missing OTP or User ID" });
    }

    const otpRecord = await MentorOTPVerification.findOne({
      userId: userId,
    });

    if (!otpRecord) {
      return res.status(400).json({ error: "Invalid or Expired OTP" });
    }

    if (otpRecord.expiresAt < Date.now()) {
      await MentorOTPVerification.deleteOne({ userId: userId });
      return res.status(400).json({ error: "OTP has expired" });
    }

    const otpString = otp.toString();

    if (otpString === otpRecord.otp) {
      await Mentor.updateOne({ _id: userId }, { emailVerified: true });
      await MentorOTPVerification.deleteOne({ userId: userId });
      return res.status(200).json({ message: "OTP verified successfully" });
    }

    const isMatch = await bcrypt.compare(otpString, otpRecord.otp);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    await Mentor.updateOne({ _id: userId }, { emailVerified: true });
    await MentorOTPVerification.deleteOne({ userId: userId });

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

mentorRouter.post("/mentor/resendOTPVerificationCode", async (req, res) => {
  try {
    const { userId, email } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ error: "All Fields Are Required" });
    }

    await MentorOTPVerification.deleteMany({ userId });

    const otp = Math.floor(`${100000 + Math.random() * 900000}`).toString();
    const saltRounds = 10;
    const hashedOTP = await bcrypt.hash(otp, saltRounds);

    const expirationDuration = 60000;
    const expiresAt = Date.now() + expirationDuration;

    const newOTPVerification = await new MentorOTPVerification({
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
      message: "Verification OTP Sent Successfully",
      additionalInformation: {
        userId: userId,
        email: email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "FAILED",
      error: "Failed to send OTP verification email",
    });
  }
});

mentorRouter.post(
  "/mentor/signin",
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
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          error: "Please Fill Out All the Fields Before Submitting",
        });
      }
      const mentorLogin = await Mentor.findOne({ email: email });
      if (!mentorLogin) {
        return res.status(404).json({ error: "Mentor Not Found" });
      }
      const isMatch = await bcrypt.compare(password, mentorLogin.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid Credentials" });
      }
      const token = await mentorLogin.generateAuthenticationToken();
      res.cookie("jwtToken", token, {
        expires: new Date(Date.now() + 2592000000),
        httpOnly: true,
      });
      res.json({
        message: "Mentor Sign In Successfully",
        id: mentorLogin["_id"],
        email: mentorLogin["email"],
        token: token,
        emailVerified: mentorLogin.emailVerified,
        verified: mentorLogin.verified,
        rejected: mentorLogin.rejected,
        rejectionReason: mentorLogin.rejectionReason,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

mentorRouter.post("/mentor/logout", (req, res) => {
  res.clearCookie("jwtToken", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
  res.json({ message: "Mentor logged out successfully" });
});

module.exports = mentorRouter;
