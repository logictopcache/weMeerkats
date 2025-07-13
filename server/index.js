const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const conversation = require("./models/conversationSchema");
const OpenAI = require("openai");
const { NotificationService } = require("./util/notificationService");
const NotificationSocket = require("./util/notificationSocket");
const AIConversation = require("./models/aiConversationSchema");
const jwt = require("jsonwebtoken");
const Learner = require("./models/learnerSchema");

dotenv.config({ path: "./config.env" });

const app = express();
const server = http.createServer(app);

require("./database/connection");

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.text({ type: "/" }));
app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000",],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI,
});

// Function to create context-aware system prompts
const createSystemPrompt = (topic, skill) => {
  const basePrompt = `You are an AI Learning Assistant specialized in helping students learn technology and programming concepts. You should provide clear, educational, and practical explanations.`;

  const topicContext = topic ? `\n\nCurrent Topic Focus: ${topic}` : "";
  const skillContext = skill ? `\nCurrent Skill Focus: ${skill}` : "";

  const guidelines = `

Guidelines for responses:
1. Provide clear, beginner-friendly explanations
2. Include practical examples and code snippets when relevant
3. Break down complex concepts into digestible parts
4. Suggest follow-up learning resources when appropriate
5. Encourage questions and deeper exploration
6. Focus specifically on ${skill || "programming"} concepts${
    topic ? ` related to ${topic}` : ""
  }
7. Provide step-by-step guidance when explaining processes
8. Use analogies and real-world examples to clarify abstract concepts

Remember: You're helping students learn, so prioritize educational value and clarity in all responses.`;

  return basePrompt + topicContext + skillContext + guidelines;
};

// Helper function to get learner from token
const getLearnerFromToken = async (token) => {
  try {
    if (!token || !token.startsWith("Bearer ")) {
      return null;
    }
    const tokenStr = token.split(" ")[1];
    const decoded = jwt.verify(tokenStr, process.env.SECRET_KEY);
    const learner = await Learner.findOne({
      _id: decoded._id,
      "tokens.token": tokenStr,
    });
    return learner;
  } catch (error) {
    return null;
  }
};

app.post("/api/chat", async (req, res) => {
  try {
    const { messages, topic, skill, conversationId } = req.body;
    const authHeader = req.headers.authorization;

    // Get learner if authenticated
    const learner = await getLearnerFromToken(authHeader);

    // Create context-aware system prompt based on topic and skill
    const systemPrompt = createSystemPrompt(topic, skill);

    // Prepare messages with system context
    const contextualMessages = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    // Get AI response
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: contextualMessages,
    });

    const aiResponse = response.choices[0].message.content;

    // If learner is authenticated and wants to save the conversation
    if (learner && topic && skill) {
      let conversation;
      const userMessage = messages[messages.length - 1].content;

      if (conversationId) {
        // Add to existing conversation
        conversation = await AIConversation.findOne({
          _id: conversationId,
          learnerId: learner._id,
        });

        if (conversation) {
          conversation.messages.push(
            {
              role: "user",
              content: userMessage,
              timestamp: new Date(),
            },
            {
              role: "assistant",
              content: aiResponse,
              timestamp: new Date(),
            }
          );
          await conversation.save();
        }
      } else {
        // Create new conversation
        conversation = new AIConversation({
          learnerId: learner._id,
          messages: [
            {
              role: "user",
              content: userMessage,
              timestamp: new Date(),
            },
            {
              role: "assistant",
              content: aiResponse,
              timestamp: new Date(),
            },
          ],
          topic,
          skill,
        });
        await conversation.save();
      }

      return res.json({
        response: aiResponse,
        conversation,
      });
    }

    // If not saving conversation, just return the AI response
    res.json({
      response: aiResponse,
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).send({ error: "Something went wrong" });
  }
});

app.post("/api/create-prompt", async (req, res) => {
  const { title } = req.body;

  if (!title || typeof title !== "string") {
    return res.status(400).json({ status: false, message: "Invalid title" });
  }

  try {
    const prompt = `Generate only one prompt not question for creating quiz question topic is ${title} and start prompt just after [[ and end the prompt with ]]`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }],
    });

    const generatedPrompt = response.choices[0].message.content.trim();
    res.status(200).json({ status: true, generatedPrompt });
  } catch (error) {
    console.error("Error in /api/create-prompt:", error.message);
    res.status(500).json({ status: false, message: error.message });
  }
});

// Route to generate a question
app.post("/api/generate-question", async (req, res) => {
  const { generatedPrompt } = req.body;

  try {
    const prompt = `I want only one question. ${generatedPrompt} and start question just after [[ and end the question with ]]. And also give me the 4 options and answer. Answer should be one of the option without any special symbol. 1st option starts with $$ and end with $$. 2nd option starts with @@ and end with @@. 3rd option starts with ## and end with ##. 4th option starts with && and end with &&. Correct Answer starts with ~~~ and end with ~~~`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a quiz question generator." },
        { role: "user", content: prompt },
      ],
    });

    const question = response.choices[0].message.content.trim();
    res.status(200).json({ status: true, question });
  } catch (error) {
    console.error("Error generating question:", error.message);
    res.status(500).json({ status: false, message: error.message });
  }
});

const learnerRouter = require("./router/learnerAuth");
const mentorRouter = require("./router/mentorAuth");
const mentorProfileRouter = require("./router/mentorProfileRouter");
const learnerProfileRouter = require("./router/learnerProfileRouter");
const progressRouter = require("./router/progressRouter");
const notificationRouter = require("./router/routes/notificationRoutes");
const aiConversationRouter = require("./router/aiConversationRouter");
const quizResultRouter = require("./router/quizResultRouter");
const { adminRouter } = require("./router/adminAuth");
const adminDashboardRouter = require("./router/adminRoutes");
const authMiddleware = require("./util/socketIo");
const { console } = require("inspector");

// Google Calendar integration
const googleCalendarAuthRouter = require("./router/googleCalendarAuth");
const appointmentRouter = require("./router/appointmentRoutes");

// PDF Parser integration
const pdfParserRouter = require("./router/pdfParserRouter");

app.use(learnerRouter);
app.use(mentorRouter);
app.use(mentorProfileRouter);
app.use(learnerProfileRouter);
app.use(progressRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/ai", aiConversationRouter);
app.use(quizResultRouter);
app.use("/api", adminRouter);
app.use("/api", adminDashboardRouter);

// Google Calendar routes
app.use("/api/calendar", googleCalendarAuthRouter);
// Appointment routes
app.use("/api/appointments", appointmentRouter);

// PDF Parser routes
app.use("/api/pdf", pdfParserRouter);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  },
});

io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth.token || socket.handshake.headers.authorization;

    if (!token) {
      return next(new Error("Authentication error"));
    }

    const user = await authMiddleware(token);
    socket.user = user;
    next();
  } catch (error) {
    next(new Error("Authentication error"));
  }
});

// Initialize notification socket system
const notificationSocket = new NotificationSocket(io);
notificationSocket.initialize();
NotificationService.initialize(notificationSocket);

// Track online users
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("A user connected:", socket.user._id);

  socket.on("joinRoom", async ({ roomId }) => {
    try {
      const conversationDoc = await conversation.findOne({
        _id: roomId,
        $or: [{ mentorId: socket.user._id }, { learnerId: socket.user._id }],
      });

      if (conversationDoc) {
        socket.join(roomId);
        console.log(`User ${socket.user._id} joined room ${roomId}`);

        // Get user's full name
        const userName = `${socket.user.firstName} ${socket.user.lastName}`;

        const messageHistory = conversationDoc.messages
          .slice(-20)
          .map((msg) => ({
            message: msg.content,
            userId: msg.userId,
            timestamp: msg.timestamp,
          }));

        socket.emit("messageHistory", { messages: messageHistory });

        // Broadcast user joined with name
        io.to(roomId).emit("userJoined", {
          userId: socket.user._id,
          userName: userName,
        });
      } else {
        socket.emit("error", { message: "Not authorized to join this room" });
      }
    } catch (error) {
      console.error("Error joining room:", error);
      socket.emit("error", { message: "Failed to join room" });
    }
  });

  socket.on("sendMessage", async ({ roomId, message }) => {
    try {
      io.to(roomId).emit("receiveMessage", {
        message,
        userId: socket.user._id,
        timestamp: new Date(),
      });

      // Get the conversation to find the other user
      const conversationDoc = await conversation
        .findOne({
          _id: roomId,
        })
        .populate("learnerId mentorId");

      if (conversationDoc) {
        // Check if sender is mentor or learner
        const isSenderMentor =
          conversationDoc.mentorId._id.toString() ===
          socket.user._id.toString();

        // Determine recipient ID and model based on sender
        const recipientId = isSenderMentor
          ? conversationDoc.learnerId._id
          : conversationDoc.mentorId._id;
        const recipientModel = isSenderMentor ? "Learner" : "Mentor";

        // Create notification for the recipient with proper userModel
        await NotificationService.notifyNewMessage(
          recipientId,
          `${socket.user.firstName} ${socket.user.lastName}`,
          recipientModel
        );
      }

      await conversation.updateOne(
        { _id: roomId },
        {
          $push: {
            messages: {
              userId: socket.user._id,
              content: message,
              timestamp: new Date(),
            },
          },
        }
      );
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Handle user coming online
  socket.on("userOnline", () => {
    onlineUsers.set(socket.user._id, true);
    io.emit("userStatusUpdate", {
      userId: socket.user._id,
      status: "online",
    });
  });

  // Modify existing disconnect handler
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.user._id);
    onlineUsers.delete(socket.user._id);
    io.emit("userStatusUpdate", {
      userId: socket.user._id,
      status: "offline",
    });
  });

  // Add handler to get user status
  socket.on("getUserStatus", (userId) => {
    const isOnline = onlineUsers.has(userId);
    socket.emit("userStatusResponse", {
      userId,
      status: isOnline ? "online" : "offline",
    });
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});
// Only add in development
if (process.env.NODE_ENV !== "production") {
  const devRoutes = require("./router/devRoutes");
  app.use(devRoutes);
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
  server.close(() => {
    process.exit(1);
  });
});
