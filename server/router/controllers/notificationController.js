const { Notification, NotificationPreference } = require('../../models/notification');
const asyncHandler = require('express-async-handler');

// Helper function to clean up sample notifications
const cleanupSampleNotifications = async () => {
  await Notification.deleteMany({
    type: { 
      $in: ['WELCOME', 'RECOMMENDATION', 'REMINDER', 'COURSE_UPDATE']
    }
  });
};

// Get all notifications for a user
exports.fetchNotifications = asyncHandler(async (req, res) => {
  // First, cleanup any existing sample notifications
  await cleanupSampleNotifications();
  
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    data: notifications
  });
});

// Mark a notification as read
exports.markNotificationAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { 
      _id: req.params.notificationId,
      userId: req.user._id
    },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  res.status(200).json({
    success: true,
    data: notification
  });
});

// Update notification preferences
exports.updateNotificationPreferences = asyncHandler(async (req, res) => {
  const { email, push, inApp } = req.body;

  let preferences = await NotificationPreference.findOne({ userId: req.user._id });

  if (!preferences) {
    preferences = await NotificationPreference.create({
      userId: req.user._id,
      email,
      push,
      inApp
    });
  } else {
    preferences = await NotificationPreference.findOneAndUpdate(
      { userId: req.user._id },
      { email, push, inApp },
      { new: true }
    );
  }

  res.status(200).json({
    success: true,
    data: preferences
  });
}); 