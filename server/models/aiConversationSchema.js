const mongoose = require("mongoose");

const aiConversationSchema = new mongoose.Schema({
  learnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Learner',
    required: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  topic: {
    type: String,
    required: true
  },
  skill: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update lastUpdatedAt before saving
aiConversationSchema.pre('save', function(next) {
  this.lastUpdatedAt = new Date();
  next();
});

const AIConversation = mongoose.model("AIConversation", aiConversationSchema);
module.exports = AIConversation; 