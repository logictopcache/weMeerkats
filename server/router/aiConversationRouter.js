const express = require("express");
const router = express.Router();
const AIConversation = require("../models/aiConversationSchema");
const jwt = require("jsonwebtoken");
const Learner = require("../models/learnerSchema");

// Auth middleware specific for learners
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization token required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const learner = await Learner.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!learner) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    req.token = token;
    req.learner = learner;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Start a new conversation or add to existing one
router.post("/ai-conversation", authMiddleware, async (req, res) => {
  try {
    const { message, topic, skill, conversationId } = req.body;

    if (!message || !topic || !skill) {
      return res.status(400).json({ error: "Message, topic, and skill are required" });
    }

    let conversation;
    if (conversationId) {
      // Add to existing conversation
      conversation = await AIConversation.findOne({
        _id: conversationId,
        learnerId: req.learner._id
      });

      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      conversation.messages.push({
        role: 'user',
        content: message
      });
      conversation.lastUpdatedAt = new Date();
      await conversation.save();
    } else {
      // Start new conversation
      conversation = new AIConversation({
        learnerId: req.learner._id,
        messages: [{
          role: 'user',
          content: message
        }],
        topic,
        skill
      });
      await conversation.save();
    }

    res.status(200).json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error("Error in AI conversation:", error);
    res.status(500).json({ error: "Failed to process conversation" });
  }
});

// Save AI response
router.post("/ai-conversation/:conversationId/response", authMiddleware, async (req, res) => {
  try {
    const { response } = req.body;
    const { conversationId } = req.params;

    if (!response) {
      return res.status(400).json({ error: "Response is required" });
    }

    const conversation = await AIConversation.findOne({
      _id: conversationId,
      learnerId: req.learner._id
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    conversation.messages.push({
      role: 'assistant',
      content: response
    });
    conversation.lastUpdatedAt = new Date();
    await conversation.save();

    res.status(200).json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error("Error saving AI response:", error);
    res.status(500).json({ error: "Failed to save response" });
  }
});

// Get all conversations for a learner
router.get("/ai-conversations", authMiddleware, async (req, res) => {
  try {
    const conversations = await AIConversation.find({
      learnerId: req.learner._id
    }).sort({ lastUpdatedAt: -1 });

    res.status(200).json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// Get a specific conversation
router.get("/ai-conversation/:conversationId", authMiddleware, async (req, res) => {
  try {
    const conversation = await AIConversation.findOne({
      _id: req.params.conversationId,
      learnerId: req.learner._id
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    res.status(200).json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
});

// Get conversations by skill
router.get("/ai-conversations/skill/:skill", authMiddleware, async (req, res) => {
  try {
    const conversations = await AIConversation.find({
      learnerId: req.learner._id,
      skill: req.params.skill
    }).sort({ lastUpdatedAt: -1 });

    res.status(200).json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error("Error fetching conversations by skill:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// Delete a conversation
router.delete("/ai-conversation/:conversationId", authMiddleware, async (req, res) => {
  try {
    const conversation = await AIConversation.findOneAndDelete({
      _id: req.params.conversationId,
      learnerId: req.learner._id
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    res.status(200).json({
      success: true,
      message: "Conversation deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

module.exports = router; 