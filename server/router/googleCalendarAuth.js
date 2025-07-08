const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const GoogleOAuth = require("../models/googleOAuthSchema");
const Learner = require("../models/learnerSchema");
const Mentor = require("../models/mentorSchema");
const googleCalendarService = require("../services/googleCalendarService");

// Auth middleware
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization token required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Try to find either a learner or mentor
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
      req.user = learner;
      req.userType = "Learner";
    } else {
      req.user = mentor;
      req.userType = "Mentor";
    }
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Get Google OAuth authorization URL
router.get("/google/auth-url", authMiddleware, async (req, res) => {
  try {
    const authUrl = googleCalendarService.getAuthUrl(
      req.user._id,
      req.userType
    );

    res.json({
      success: true,
      authUrl: authUrl,
      message: "Please visit this URL to authorize calendar access",
    });
  } catch (error) {
    console.error("Error generating auth URL:", error);
    res.status(500).json({
      error: "Failed to generate authorization URL",
      details: error.message,
    });
  }
});

// Handle Google OAuth callback
router.get("/google/callback", async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({ error: "Authorization code is required" });
    }

    // Get tokens from Google
    const tokens = await googleCalendarService.getTokens(code);

    // Extract user info from the state parameter
    let userId, userType;
    try {
      if (state) {
        const stateData = JSON.parse(state);
        userId = stateData.userId;
        userType = stateData.userType;
        console.log("Extracted user info:", { userId, userType });
      }
    } catch (error) {
      console.error("Error parsing state parameter:", error);
    }

    if (!userId || !userType) {
      return res.status(400).json({
        error: "User identification required. Please try authorization again.",
      });
    }

    // Store or update OAuth tokens
    const oauthRecord = await GoogleOAuth.findOneAndUpdate(
      { userId: userId, userType: userType },
      {
        userId: userId,
        userType: userType,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenType: tokens.token_type || "Bearer",
        expiryDate: new Date(tokens.expiry_date),
        scope: tokens.scope,
        isActive: true,
        lastUsed: new Date(),
      },
      { upsert: true, new: true }
    );

    // Redirect to frontend with success message
    const redirectUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/calendar-connected?success=true`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Error handling OAuth callback:", error);
    res.redirect(
      `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/calendar-connected?error=authorization_failed`
    );
  }
});

// Check calendar connection status
router.get("/google/status", authMiddleware, async (req, res) => {
  try {
    const oauthRecord = await GoogleOAuth.findOne({
      userId: req.user._id,
      userType: req.userType,
      isActive: true,
    });

    if (!oauthRecord) {
      return res.json({
        connected: false,
        message: "Calendar not connected",
      });
    }

    const isExpired = oauthRecord.isTokenExpired();
    const shouldRefresh = oauthRecord.shouldRefresh();

    res.json({
      connected: true,
      tokenExpired: isExpired,
      shouldRefresh: shouldRefresh,
      lastUsed: oauthRecord.lastUsed,
      connectedAt: oauthRecord.createdAt,
    });
  } catch (error) {
    console.error("Error checking calendar status:", error);
    res.status(500).json({
      error: "Failed to check calendar status",
      details: error.message,
    });
  }
});

// Disconnect Google Calendar
router.delete("/google/disconnect", authMiddleware, async (req, res) => {
  try {
    const result = await GoogleOAuth.findOneAndUpdate(
      { userId: req.user._id, userType: req.userType },
      { isActive: false },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ error: "No calendar connection found" });
    }

    res.json({
      success: true,
      message: "Calendar disconnected successfully",
    });
  } catch (error) {
    console.error("Error disconnecting calendar:", error);
    res.status(500).json({
      error: "Failed to disconnect calendar",
      details: error.message,
    });
  }
});

// Refresh OAuth tokens
router.post("/google/refresh-token", authMiddleware, async (req, res) => {
  try {
    const oauthRecord = await GoogleOAuth.findOne({
      userId: req.user._id,
      userType: req.userType,
      isActive: true,
    });

    if (!oauthRecord) {
      return res.status(404).json({ error: "No calendar connection found" });
    }

    // Set credentials and refresh
    googleCalendarService.setCredentials({
      access_token: oauthRecord.accessToken,
      refresh_token: oauthRecord.refreshToken,
      token_type: oauthRecord.tokenType,
      expiry_date: oauthRecord.expiryDate.getTime(),
    });

    // The Google client will automatically refresh the token
    // We need to get the new tokens and update our database
    const newTokens = await googleCalendarService.oauth2Client.getAccessToken();

    // Update stored tokens
    oauthRecord.accessToken = newTokens.token;
    oauthRecord.lastUsed = new Date();
    await oauthRecord.save();

    res.json({
      success: true,
      message: "Tokens refreshed successfully",
    });
  } catch (error) {
    console.error("Error refreshing tokens:", error);
    res.status(500).json({
      error: "Failed to refresh tokens",
      details: error.message,
    });
  }
});

// Debug endpoint to check OAuth records
router.get("/google/debug", authMiddleware, async (req, res) => {
  try {
    const oauthRecords = await GoogleOAuth.find({
      userId: req.user._id,
      userType: req.userType,
    });

    res.json({
      userId: req.user._id,
      userType: req.userType,
      oauthRecords: oauthRecords,
      totalRecords: oauthRecords.length,
    });
  } catch (error) {
    console.error("Error in debug endpoint:", error);
    res.status(500).json({
      error: "Failed to get debug info",
      details: error.message,
    });
  }
});

// Test calendar connection
router.get("/google/test-connection", authMiddleware, async (req, res) => {
  try {
    const oauthRecord = await GoogleOAuth.findOne({
      userId: req.user._id,
      userType: req.userType,
      isActive: true,
    });

    if (!oauthRecord) {
      return res.status(404).json({ error: "No calendar connection found" });
    }

    // Set credentials
    googleCalendarService.setCredentials({
      access_token: oauthRecord.accessToken,
      refresh_token: oauthRecord.refreshToken,
      token_type: oauthRecord.tokenType,
      expiry_date: oauthRecord.expiryDate.getTime(),
    });

    // Try to list calendars to test connection
    const { google } = require("googleapis");
    const calendar = google.calendar("v3");

    const response = await calendar.calendarList.list({
      maxResults: 10,
    });

    res.json({
      success: true,
      message: "Calendar connection is working",
      calendarsCount: response.data.items?.length || 0,
    });
  } catch (error) {
    console.error("Error testing calendar connection:", error);
    res.status(500).json({
      error: "Calendar connection test failed",
      details: error.message,
    });
  }
});

module.exports = router;
