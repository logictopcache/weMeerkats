import React, { useState, useRef, useEffect } from "react";
import MenteeHeader from "../../../components/mentee/home/Header";
import Navigation from "../../../components/mentee/home/Navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSend,
  FiCpu,
  FiUser,
  FiLoader,
  FiTrash2,
  FiPlus,
  FiMessageSquare,
  FiClock,
  FiArrowLeft,
  FiBook,
  FiCode,
} from "react-icons/fi";
import useAIConversation from "../../../hooks/useAIConversation";
import { toast } from "react-toastify";

// Predefined learning topics and skills
const LEARNING_TOPICS = [
  "JavaScript Fundamentals",
  "React Development",
  "Node.js Backend",
  "Database Management",
  "API Development",
  "Web Security",
  "DevOps & Deployment",
  "Mobile Development",
  "Machine Learning Basics",
  "Data Structures & Algorithms",
  "System Design",
  "Cloud Computing",
  "Testing & Quality Assurance",
  "UI/UX Design Principles",
  "Version Control (Git)",
  "Custom Topic",
];

const PROGRAMMING_SKILLS = [
  "JavaScript",
  "Python",
  "React",
  "Node.js",
  "Java",
  "C++",
  "SQL",
  "MongoDB",
  "HTML/CSS",
  "TypeScript",
  "PHP",
  "Ruby",
  "Go",
  "Rust",
  "Swift",
  "General Programming",
];

const LearnFromAI = () => {
  const [input, setInput] = useState("");
  const [currentTopic, setCurrentTopic] = useState("");
  const [currentSkill, setCurrentSkill] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [showChatView, setShowChatView] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Generate suggested starter prompts
  const getSuggestedPrompts = () => {
    const actualTopic =
      currentTopic === "Custom Topic" ? customTopic : currentTopic;
    if (!actualTopic && !currentSkill) return [];

    const prompts = [];
    if (actualTopic && currentSkill) {
      prompts.push(
        `Explain the basics of ${actualTopic} in ${currentSkill}`,
        `What are the key concepts I should know about ${actualTopic}?`,
        `Show me a practical example of ${actualTopic} using ${currentSkill}`,
        `What are common mistakes beginners make with ${actualTopic}?`
      );
    } else if (actualTopic) {
      prompts.push(
        `What is ${actualTopic} and why is it important?`,
        `Give me a beginner's guide to ${actualTopic}`,
        `What are the prerequisites for learning ${actualTopic}?`
      );
    } else if (currentSkill) {
      prompts.push(
        `What are the fundamental concepts in ${currentSkill}?`,
        `Show me a simple example in ${currentSkill}`,
        `What are best practices for ${currentSkill} development?`
      );
    }
    return prompts.slice(0, 4);
  };

  const {
    isLoading,
    error,
    conversations,
    currentConversation,
    startConversation,
    saveResponse,
    loadConversations,
    loadConversation,
    deleteConversation,
    clearCurrentConversation,
  } = useAIConversation();

  useEffect(() => {
    loadConversations().catch((error) => {
      console.error("Failed to load conversations:", error);
    });
  }, [loadConversations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Get the actual topic (custom topic if selected, otherwise current topic)
    const actualTopic =
      currentTopic === "Custom Topic" ? customTopic : currentTopic;

    // Validate topic and skill for new conversations
    if (!currentConversation && (!actualTopic || !currentSkill)) {
      toast.error(
        "Please select both a learning topic and programming skill before starting."
      );
      return;
    }

    const userMessage = input.trim();
    setInput("");

    try {
      if (!currentConversation) {
        // Start new conversation
        await startConversation({
          message: userMessage,
          topic: actualTopic,
          skill: currentSkill,
        });
      } else {
        // Save user's message and wait for AI response
        await saveResponse(currentConversation._id, userMessage);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
      // Optionally restore the input if sending failed
      setInput(userMessage);
    }
  };

  const formatMessage = (text) => {
    // Format code blocks
    let formattedText = text.replace(
      /```([\s\S]*?)```/g,
      '<pre class="bg-gray-800 text-gray-100 p-4 rounded-lg my-2 overflow-x-auto">$1</pre>'
    );

    // Format inline code
    formattedText = formattedText.replace(
      /`(.*?)`/g,
      '<code class="bg-gray-700 text-gray-100 px-1 rounded">$1</code>'
    );

    // Format bold text
    formattedText = formattedText.replace(
      /\*\*(.*?)\*\*/g,
      "<strong>$1</strong>"
    );

    // Format italics
    formattedText = formattedText.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Format links
    formattedText = formattedText.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Format line breaks
    formattedText = formattedText.replace(/\n/g, "<br />");

    return formattedText;
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleConversationSelect = (conv) => {
    loadConversation(conv._id);
    setShowChatView(true);
  };

  const handleNewConversation = () => {
    clearCurrentConversation();
    setCurrentTopic("");
    setCurrentSkill("");
    setCustomTopic("");
    setShowChatView(true);
  };

  const handleBackToList = () => {
    setShowChatView(false);
  };

  useEffect(() => {
    // Reset mobile view state when screen size changes
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // lg breakpoint
        setShowChatView(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDeleteConversation = async (id) => {
    try {
      await deleteConversation(id);
      toast.success("Conversation deleted successfully");
    } catch (error) {
      toast.error("Failed to delete conversation");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1128]">
      <MenteeHeader />
      <Navigation />
      <div className="relative">
        <div className="max-w-[1400px] mx-auto px-5 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Conversation History Sidebar */}
            <div
              className={`lg:col-span-3 lg:block ${
                !showChatView || window.innerWidth >= 1024 ? "block" : "hidden"
              }`}
            >
              <div className="bg-[#111936] rounded-xl border border-primary-color/20 overflow-hidden h-[calc(100vh-220px)] lg:h-[800px] flex flex-col">
                <div className="p-4 border-b border-primary-color/20">
                  <button
                    onClick={handleNewConversation}
                    className="w-full flex items-center justify-center gap-2 bg-primary-color hover:bg-primary-color/90 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    <FiPlus className="w-5 h-5" />
                    <span>New Conversation</span>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {Array.isArray(conversations) &&
                    conversations.map((conv) => (
                      <motion.div
                        key={conv._id || `temp-${Date.now()}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-2 lg:p-3 rounded-lg cursor-pointer transition-colors ${
                          currentConversation?._id === conv._id
                            ? "bg-primary-color/20 border border-primary-color/30"
                            : "hover:bg-white/[0.02] border border-white/5"
                        }`}
                        onClick={() => handleConversationSelect(conv)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FiMessageSquare className="w-3 h-3 lg:w-4 lg:h-4 text-primary-color flex-shrink-0" />
                            <div className="truncate">
                              <h4 className="text-xs lg:text-sm text-white font-medium truncate">
                                {conv.topic || "General"}
                              </h4>
                              <p className="text-[10px] lg:text-xs text-gray-400 truncate">
                                {conv.skill || "Programming"}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteConversation(conv._id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <FiTrash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-[10px] lg:text-xs text-gray-400">
                          <FiClock className="w-2 h-2 lg:w-3 lg:h-3" />
                          <span>
                            {new Date(conv.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  {!isLoading &&
                    Array.isArray(conversations) &&
                    conversations.length === 0 && (
                      <div className="text-center text-gray-400 py-4">
                        <p>No conversations yet</p>
                        <p className="text-sm mt-1">
                          Start a new conversation to begin learning!
                        </p>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Main Chat Area */}
            <div
              className={`lg:col-span-9 ${
                showChatView || window.innerWidth >= 1024 ? "block" : "hidden"
              }`}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-6 lg:mb-8">
                  <button
                    onClick={handleBackToList}
                    className="lg:hidden p-2 text-white hover:text-primary-color transition-colors"
                  >
                    <FiArrowLeft className="w-6 h-6" />
                  </button>
                  <FiCpu className="text-3xl lg:text-4xl text-primary-color" />
                  <div className="flex-1">
                    <h1 className="text-xl lg:text-2xl font-bold text-white">
                      AI Learning Assistant
                    </h1>
                    <p className="text-sm lg:text-base text-gray-400">
                      Ask me anything about programming and technology
                    </p>
                    {currentConversation && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-color/20 text-primary-color text-xs rounded-full">
                          <FiBook className="w-3 h-3" />
                          {currentConversation.topic}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                          <FiCode className="w-3 h-3" />
                          {currentConversation.skill}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-[#111936] rounded-xl border border-primary-color/20 overflow-hidden">
                  <div
                    ref={chatContainerRef}
                    className="chat-messages h-[calc(100vh-400px)] lg:h-[600px] overflow-y-auto p-4 lg:p-6 space-y-6"
                  >
                    <AnimatePresence>
                      {currentConversation?.messages &&
                        Array.isArray(currentConversation.messages) &&
                        currentConversation.messages.map((msg, index) => (
                          <motion.div
                            key={msg._id || `msg-${index}-${Date.now()}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`flex items-start gap-2 lg:gap-3 ${
                              msg.role === "user" ? "flex-row-reverse" : ""
                            }`}
                          >
                            <div
                              className={`shrink-0 w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center ${
                                msg.role === "user"
                                  ? "bg-primary-color"
                                  : "bg-blue-600"
                              }`}
                            >
                              {msg.role === "user" ? (
                                <FiUser className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                              ) : (
                                <FiCpu className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                              )}
                            </div>
                            <div
                              className={`max-w-[90%] lg:max-w-[80%] p-3 lg:p-4 rounded-xl ${
                                msg.role === "user"
                                  ? "bg-primary-color text-white"
                                  : "bg-[#1a2547] text-gray-100"
                              }`}
                            >
                              <div
                                className="prose prose-invert max-w-none text-sm lg:text-base"
                                dangerouslySetInnerHTML={{
                                  __html: formatMessage(msg.content),
                                }}
                              />
                            </div>
                          </motion.div>
                        ))}
                      {isLoading && (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-start gap-3"
                        >
                          <div className="shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                            <FiCpu className="text-white" />
                          </div>
                          <div className="max-w-[80%] p-4 rounded-xl bg-[#1a2547]">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-primary-color rounded-full animate-bounce" />
                              <div className="w-2 h-2 bg-primary-color rounded-full animate-bounce [animation-delay:0.2s]" />
                              <div className="w-2 h-2 bg-primary-color rounded-full animate-bounce [animation-delay:0.4s]" />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="p-4 border-t border-primary-color/20">
                    {!currentConversation && (
                      <div className="space-y-4 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                              <FiBook className="w-4 h-4" />
                              Learning Topic
                            </label>
                            <select
                              value={currentTopic}
                              onChange={(e) => setCurrentTopic(e.target.value)}
                              className="w-full p-2 lg:p-3 bg-[#1a2547] text-white rounded-lg border border-primary-color/20 focus:border-primary-color focus:outline-none"
                            >
                              <option value="">Select a topic...</option>
                              {LEARNING_TOPICS.map((topic) => (
                                <option key={topic} value={topic}>
                                  {topic}
                                </option>
                              ))}
                            </select>
                            {currentTopic === "Custom Topic" && (
                              <input
                                type="text"
                                value={customTopic}
                                placeholder="Enter your custom topic"
                                className="mt-2 w-full p-2 lg:p-3 bg-[#1a2547] text-white placeholder-gray-400 rounded-lg border border-primary-color/20 focus:border-primary-color focus:outline-none"
                                onChange={(e) => setCustomTopic(e.target.value)}
                                autoFocus
                              />
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                              <FiCode className="w-4 h-4" />
                              Programming Skill
                            </label>
                            <select
                              value={currentSkill}
                              onChange={(e) => setCurrentSkill(e.target.value)}
                              className="w-full p-2 lg:p-3 bg-[#1a2547] text-white rounded-lg border border-primary-color/20 focus:border-primary-color focus:outline-none"
                            >
                              <option value="">Select a skill...</option>
                              {PROGRAMMING_SKILLS.map((skill) => (
                                <option key={skill} value={skill}>
                                  {skill}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Topic/Skill Context Display */}
                        {(currentTopic || currentSkill) && (
                          <div className="bg-primary-color/10 border border-primary-color/20 rounded-lg p-3">
                            <p className="text-sm text-primary-color font-medium mb-1">
                              Learning Context:
                            </p>
                            <p className="text-sm text-gray-300">
                              {(() => {
                                const actualTopic =
                                  currentTopic === "Custom Topic"
                                    ? customTopic
                                    : currentTopic;
                                if (actualTopic && currentSkill) {
                                  return `Focusing on ${actualTopic} with ${currentSkill}`;
                                } else if (actualTopic) {
                                  return `Learning about ${actualTopic}`;
                                } else {
                                  return `Practicing ${currentSkill}`;
                                }
                              })()}
                            </p>
                          </div>
                        )}

                        {/* Suggested Prompts */}
                        {!currentConversation &&
                          ((currentTopic && currentTopic !== "Custom Topic") ||
                            (currentTopic === "Custom Topic" && customTopic) ||
                            currentSkill) && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-gray-300">
                                Suggested questions:
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {getSuggestedPrompts().map((prompt, index) => (
                                  <button
                                    key={index}
                                    onClick={() => setInput(prompt)}
                                    className="text-left p-2 text-sm bg-[#1a2547] hover:bg-[#1e2a52] text-gray-300 hover:text-white rounded-lg border border-primary-color/10 hover:border-primary-color/30 transition-colors"
                                  >
                                    {prompt}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    )}
                    <div className="relative">
                      <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={
                          !currentConversation &&
                          (!(currentTopic === "Custom Topic"
                            ? customTopic
                            : currentTopic) ||
                            !currentSkill)
                            ? "Please select a topic and skill first..."
                            : "Type your question... (Shift + Enter for new line)"
                        }
                        disabled={
                          !currentConversation &&
                          (!(currentTopic === "Custom Topic"
                            ? customTopic
                            : currentTopic) ||
                            !currentSkill)
                        }
                        className={`w-full p-3 lg:p-4 pr-12 bg-[#1a2547] text-white placeholder-gray-400 rounded-xl border border-primary-color/20 focus:border-primary-color focus:outline-none resize-none ${
                          !currentConversation &&
                          (!currentTopic || !currentSkill)
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        rows="2"
                      />
                      <button
                        onClick={handleSend}
                        disabled={
                          !input.trim() ||
                          isLoading ||
                          (!currentConversation &&
                            (!(currentTopic === "Custom Topic"
                              ? customTopic
                              : currentTopic) ||
                              !currentSkill))
                        }
                        className={`absolute right-3 bottom-3 p-2 rounded-lg ${
                          input.trim() &&
                          !isLoading &&
                          (currentConversation ||
                            ((currentTopic === "Custom Topic"
                              ? customTopic
                              : currentTopic) &&
                              currentSkill))
                            ? "bg-primary-color text-white hover:bg-primary-color/80"
                            : "bg-gray-600 text-gray-400 cursor-not-allowed"
                        } transition-colors`}
                      >
                        {isLoading ? (
                          <FiLoader className="w-5 h-5 animate-spin" />
                        ) : (
                          <FiSend className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-400 text-right">
                      {!currentConversation &&
                      (!(currentTopic === "Custom Topic"
                        ? customTopic
                        : currentTopic) ||
                        !currentSkill)
                        ? "Select a topic and skill to start learning"
                        : "Press Enter to send, Shift + Enter for new line"}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnFromAI;
