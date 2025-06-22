const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'userModel'
  },
  userModel: {
    type: String,
    required: true,
    enum: ['Learner', 'Mentor']
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const NotificationPreferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'userModel',
    required: true
  },
  userModel: {
    type: String,
    required: true,
    enum: ['Learner', 'Mentor']
  },
  email: {
    type: Boolean,
    default: true
  },
  push: {
    type: Boolean,
    default: true
  },
  inApp: {
    type: Boolean,
    default: true
  }
});

const Notification = mongoose.model('Notification', notificationSchema);
const NotificationPreference = mongoose.model('NotificationPreference', NotificationPreferenceSchema);

module.exports = { Notification, NotificationPreference }; 