import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Navigation from "../../../components/mentee/home/Navigation";
// import Footer from "../../../components/landingPage/Footer";
import { useSocket } from "../../../contexts/SocketContext";
// createConversation,
import { fetchLearners } from "../../../services/api/mentorApi";
import ProfileAvatar from "../../../components/ProfileAvatar";
import { fetchMenteeConversations } from "../../../services/api/menteeApi";
import MenteeHeader from "../../../components/mentee/home/Header";
import EmojiPicker from "emoji-picker-react";
import { fetchUserProfile } from "../../../services/api/profileService";

// const ProfilePlaceholder = () => (
//   <svg className="w-8 h-8 text-gray-300 bg-gray-100 rounded-full" fill="currentColor" viewBox="0 0 24 24">
//     <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
//   </svg>
// );

// Add this CSS at the top of the component, after imports
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const Message_Mentor = () => {
  const { socket, connected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [learners, setLearners] = useState([]);
  const [conversations, setConversations] = useState([]);

  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const typingTimeout = useRef(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);

  const location = useLocation();
  const selectedMentorId = location.state?.selectedMentorId;
  const conversationId = location.state?.conversationId;

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    // Fetch current user's profile
    const fetchCurrentUserProfile = async () => {
      try {
        const profile = await fetchUserProfile(false); // false for mentee
        setCurrentUserProfile(profile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    const fetchInitialConversations = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        setLoading(true);

        const conversationsData = await fetchMenteeConversations(userId);
        console.log(conversationsData);

        const formattedConversations = conversationsData.map((conv) => ({
          id: conv._id,
          user: {
            id: conv.mentorId._id,
            name: `${conv.mentorId.firstName} ${conv.mentorId.lastName}`,
            email: conv.mentorId.email,
            image: conv.mentorId.profilePictureUrl || null,
            status: socket?.connected ? "pending" : "offline",
          },
          messages: conv.messages || [],
          lastMessage:
            conv.messages?.length > 0
              ? conv.messages[conv.messages.length - 1].content
              : "",
          time: new Date(conv.updatedAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));

        setConversations(formattedConversations);

        // If there's a conversationId from navigation, select that chat
        if (conversationId) {
          const selectedConversation = formattedConversations.find(
            (conv) => conv.id === conversationId
          );
          if (selectedConversation) {
            setSelectedChat(selectedConversation);
            setMessages(selectedConversation.messages);
            socket?.emit("joinRoom", {
              roomId: conversationId,
              userName: selectedChat.user.name,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUserProfile();
    fetchInitialConversations();
  }, [socket, conversationId, selectedChat?.user?.name]);

  useEffect(() => {
    if (!socket) return;

    socket.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);

      // Update selected chat if it's the current conversation
      if (selectedChat?.id === message.roomId) {
        setSelectedChat((prev) => ({
          ...prev,
          messages: [...(prev.messages || []), message],
          lastMessage: message.content,
        }));
      }

      // Update conversations list
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === message.roomId
            ? {
                ...conv,
                messages: [...(conv.messages || []), message],
                lastMessage: message.content,
              }
            : conv
        )
      );
    });

    socket.on("messageStatus", ({ messageId, status }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, status } : msg))
      );
    });

    socket.on("userTyping", ({ userId }) => {
      if (selectedChat?.user.id === userId) {
        setIsTyping(true);
      }
    });

    socket.on("userStoppedTyping", ({ userId }) => {
      if (selectedChat?.user.id === userId) {
        setIsTyping(false);
      }
    });

    socket.on("messageHistory", ({ messages }) => {
      setMessages(messages);
    });
    // for user id add in the parameters "userId, " and then add it in the message as
    socket.on("userJoined", ({ userName }) => {
      // Store the userName when user joins
      if (userName) {
        localStorage.setItem("lastChatUserName", userName);
      }
      const systemMessage = {
        id: Date.now(),
        type: "system",
        message: `${userName} joined the conversation`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, systemMessage]);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("messageStatus");
      socket.off("userTyping");
      socket.off("userStoppedTyping");
      socket.off("messageHistory");
      socket.off("userJoined");
      socket.off("userStatusUpdate");
    };
  }, [socket, selectedChat]);

  useEffect(() => {
    // Fetch learners when component mounts
    const getLearners = async () => {
      try {
        const data = await fetchLearners();
        setLearners(data);
      } catch (error) {
        console.error("Error fetching learners:", error);
      }
    };
    getLearners();
  }, []);

  useEffect(() => {
    if (selectedMentorId && conversationId && socket) {
      const learner = learners.find((l) => l._id === selectedMentorId);
      if (learner) {
        const newChat = {
          id: conversationId,
          user: {
            id: selectedMentorId,
            name: `${learner.firstName} ${learner.lastName}`,
            image: learner.image || "/default-avatar.png",
            status: "offline",
          },
          messages: [],
        };
        setSelectedChat(newChat);
        setMessages(newChat.messages);
        socket.emit("joinRoom", {
          roomId: conversationId,
          userName: selectedChat.user.name,
        });
      }
    }
  }, [
    selectedMentorId,
    conversationId,
    learners,
    socket,
    selectedChat?.user?.name,
  ]);

  // const handleCreateConversation = async (learnerId) => {
  //   try {
  //     const mentorId = localStorage.getItem('userId');
  //     const result = await createConversation(mentorId, learnerId);
  //     if (result.conv) {
  //       const learner = learners.find(l => l._id === learnerId);
  //       const newChat = {
  //         id: result.conv._id,
  //         user: {
  //           id: learnerId,
  //           name: learner ? `${learner.firstName} ${learner.lastName}` : 'Unknown',
  //           image: learner?.image || '/default-avatar.png',
  //           status: 'offline'
  //         },
  //         messages: []
  //       };
  //       setSelectedChat(newChat);
  //       socket.emit('joinRoom', { roomId: result.conv._id });
  //     }
  //   } catch (error) {
  //     console.error('Error creating conversation:', error);
  //   }
  // };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    const messageData = {
      roomId: selectedChat.id,
      message: newMessage,
      authToken: localStorage.getItem("authToken"),
      userName: localStorage.getItem("lastChatUserName"),
    };

    if (!selectedChat.id) {
      alert("Please join a room first");
      return;
    }

    socket.emit("sendMessage", messageData);
    setNewMessage("");
  };

  const handleTyping = () => {
    if (!socket || !selectedChat) return;

    socket.emit("typing", { roomId: selectedChat.id });

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = setTimeout(() => {
      socket.emit("stopTyping", { roomId: selectedChat.id });
    }, 1000);
  };

  const handleMessageInput = (e) => {
    setNewMessage(e.target.value);
    handleTyping();
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <div className="flex items-center gap-2 text-gray-500 text-sm ml-4 mb-2">
        <span>{selectedChat.user.name} is typing...</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
        </div>
      </div>
    );
  };

  const connectionStatus = connected ? (
    <span className="text-green-500 text-sm">Connected</span>
  ) : (
    <span className="text-red-500 text-sm">Disconnected</span>
  );

  useEffect(() => {
    if (!socket || !connected) return;

    const userId = localStorage.getItem("userId");
    const userType = window.location.pathname.includes("mentor")
      ? "mentor"
      : "mentee";

    // Emit online status when connected
    socket.emit("userOnline", { userId, userType });

    // Listen for users' status changes
    socket.on("userStatusUpdate", ({ userId, status }) => {
      setConversations((prevConversations) =>
        prevConversations.map((conv) => {
          if (conv.user.id === userId) {
            // Update both conversations list and selected chat if applicable
            if (selectedChat?.user.id === userId) {
              setSelectedChat((prev) => ({
                ...prev,
                user: { ...prev.user, status },
              }));
            }
            return {
              ...conv,
              user: { ...conv.user, status },
            };
          }
          return conv;
        })
      );
    });

    // Cleanup function
    return () => {
      socket.emit("userOffline", { userId, userType });
      socket.off("userStatusUpdate");
    };
  }, [socket, connected, selectedChat]);

  const onEmojiClick = (emojiObject) => {
    setNewMessage((prevMessage) => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="min-h-screen bg-[#0A1128]">
      <style>{scrollbarStyles}</style>
      <MenteeHeader />
      <Navigation />
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        {/* Main Chat Container */}
        <div className="flex gap-6 h-[75vh] bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
          {/* Left sidebar - Conversations List */}
          <div className="w-1/3 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">Messages</h2>
              <p className="text-sm text-white/60">
                Your conversations with mentors
              </p>
            </div>
            <div className="overflow-y-auto custom-scrollbar h-[calc(75vh-6rem)]">
              {conversations.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => {
                    setSelectedChat(chat);
                    setMessages(chat.messages);
                    socket?.emit("joinRoom", {
                      roomId: chat.id,
                      userName: chat.user.name,
                    });
                  }}
                  className={`flex items-center gap-3 p-4 hover:bg-white/5 cursor-pointer transition-all duration-200 ${
                    selectedChat?.id === chat.id
                      ? "bg-primary-color/20 border-l-4 border-primary-color"
                      : "border-l-4 border-transparent"
                  }`}
                >
                  <div className="relative">
                    <ProfileAvatar
                      name={chat.user.name}
                      image={chat.user.image}
                      size="lg"
                    />
                    {chat.user.status === "online" && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0A1128]"></div>
                    )}
                    {chat.user.status === "pending" && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-yellow-500 rounded-full border-2 border-[#0A1128]"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-white">
                        {chat.user.name}
                      </h3>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-white/40">
                          {chat.time}
                        </span>
                        {chat.unread > 0 && (
                          <div className="w-5 h-5 bg-primary-color rounded-full flex items-center justify-center">
                            <span className="text-xs text-white">
                              {chat.unread}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-white/60 truncate">
                      {chat.lastMessage || "Start a conversation"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Chat Area */}
          <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
            {selectedChat ? (
              <>
                {/* Chat header */}
                <div className="p-4 border-b border-white/10 bg-gradient-to-r from-primary-color/20 to-blue-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <ProfileAvatar
                          name={selectedChat.user.name}
                          email={selectedChat.user.email}
                          image={selectedChat.user.image}
                          size="lg"
                          style="character"
                        />
                        <div
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0A1128] ${
                            selectedChat.user.status === "online"
                              ? "bg-green-500"
                              : "bg-gray-500"
                          }`}
                        ></div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white flex items-center gap-2">
                          {selectedChat.user.name}
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              selectedChat.user.status === "online"
                                ? "bg-green-500/20 text-green-500"
                                : "bg-gray-500/20 text-gray-400"
                            }`}
                          >
                            {selectedChat.user.status === "online"
                              ? "Online"
                              : "Offline"}
                          </span>
                        </h3>
                        <p className="text-sm text-white/60">
                          {selectedChat.user.expertise || "Mentor"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          connected
                            ? "bg-green-500/20 text-green-500"
                            : "bg-red-500/20 text-red-500"
                        }`}
                      >
                        {connected ? "Connected to chat" : "Disconnected"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Messages area */}
                <div
                  className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at center, rgba(45, 144, 126, 0.05) 0%, transparent 70%)",
                  }}
                >
                  {messages.map((message, index) => {
                    if (message.type === "system") {
                      return (
                        <div
                          key={`system-${message.id || index}`}
                          className="flex items-center justify-center gap-2 my-4"
                        >
                          <div className="h-[1px] flex-1 bg-white/10"></div>
                          <p className="text-center text-sm text-white/40 px-4">
                            {message.message}
                          </p>
                          <div className="h-[1px] flex-1 bg-white/10"></div>
                        </div>
                      );
                    }

                    const userId = localStorage.getItem("userId");
                    const isMyMessage = message.userId === userId;

                    return (
                      <div
                        key={`message-${message.id || index}`}
                        className={`flex items-end gap-2 ${
                          isMyMessage ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!isMyMessage && (
                          <ProfileAvatar
                            name={selectedChat.user.name}
                            email={selectedChat.user.email}
                            image={selectedChat.user.image}
                            size="sm"
                            style="shape"
                          />
                        )}
                        <div
                          className={`max-w-[70%] rounded-2xl p-3 ${
                            isMyMessage
                              ? "bg-primary-color text-white rounded-tr-none"
                              : "bg-white/10 text-white rounded-tl-none"
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <div
                            className={`text-[10px] mt-1 ${
                              isMyMessage ? "text-white/60" : "text-white/40"
                            }`}
                          >
                            {new Date(message.timestamp).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </div>
                        {isMyMessage && (
                          <ProfileAvatar
                            name={
                              currentUserProfile?.fullName ||
                              localStorage.getItem("lastChatUserName")
                            }
                            email={
                              currentUserProfile?.email ||
                              localStorage.getItem("userEmail")
                            }
                            image={currentUserProfile?.profilePictureUrl}
                            size="sm"
                            style="character"
                          />
                        )}
                      </div>
                    );
                  })}
                  {renderTypingIndicator()}
                </div>

                {/* Message input */}
                <div className="p-4 border-t border-white/10 bg-white/5">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <button
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/60 hover:text-white"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        title="Add emoji"
                      >
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </button>
                      {showEmojiPicker && (
                        <div className="absolute bottom-12 left-0 z-50">
                          <div className="p-2 bg-white/10 backdrop-blur-xl rounded-lg border border-white/10">
                            <EmojiPicker
                              onEmojiClick={onEmojiClick}
                              disableAutoFocus
                              searchPlaceholder="Search emoji..."
                              previewConfig={{ showPreview: false }}
                              theme="dark"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={handleMessageInput}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 bg-white/5 text-white placeholder-white/40 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary-color"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="p-2 bg-primary-color text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Send message"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-16 h-16 mb-4 text-white/20">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Conversation Selected
                </h3>
                <p className="text-white/60">
                  Select a conversation from the list to start chatting with
                  your mentor
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message_Mentor;
