const express = require("express");
const jwt = require("jsonwebtoken");
const Learner = require("../../models/learnerSchema");
const Mentor = require("../../models/mentorSchema");
const {
  fetchNotifications,
  markNotificationAsRead,
  updateNotificationPreferences,
} = require("../controllers/notificationController");
const {
  Notification,
  NotificationPreference,
} = require("../../models/notification");

const router = express.Router();

// Updated auth middleware to handle both learner and mentor tokens
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

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
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    }

    // Set user and userModel based on who was found
    if (learner) {
      req.user = learner;
      req.userModel = "Learner";
    } else {
      req.user = mentor;
      req.userModel = "Mentor";
    }

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// Protect all routes with the updated middleware
router.use(authMiddleware);

// One-time cleanup route for sample notifications
router.delete("/cleanup-sample-notifications", async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      type: {
        $in: ["WELCOME", "RECOMMENDATION", "REMINDER", "COURSE_UPDATE"],
      },
    });

    res.status(200).json({
      success: true,
      message: `Cleaned up ${result.deletedCount} sample notifications`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to cleanup sample notifications",
    });
  }
});

// Get notifications for the authenticated user (works for both learner and mentor)
router.get("/notifications", async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user._id,
      userModel: req.userModel,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
});

// Mark notification as read (works for both learner and mentor)
router.post("/notifications/:notificationId/read", async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.notificationId,
        userId: req.user._id,
        userModel: req.userModel,
      },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
    });
  }
});

// Update notification preferences (works for both learner and mentor)
router.put("/notification-preferences", async (req, res) => {
  try {
    const { email, push, inApp } = req.body;

    let preferences = await NotificationPreference.findOneAndUpdate(
      {
        userId: req.user._id,
        userModel: req.userModel,
      },
      {
        email,
        push,
        inApp,
        userId: req.user._id,
        userModel: req.userModel,
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      data: preferences,
    });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update notification preferences",
    });
  }
});

module.exports = router;
