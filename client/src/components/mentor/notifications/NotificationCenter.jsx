import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBell,
  FiX,
  FiCheck,
  FiMail,
  FiBellOff,
  FiMessageSquare,
} from "react-icons/fi";
import { useNotifications } from "../../../hooks/useNotifications.jsx";

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const notificationRef = useRef(null);

  const {
    notifications,
    unreadCount,
    unreadChatCount,
    markAsRead,
    isLoading,
    error,
    refresh,
    handleNotificationClick,
  } = useNotifications(true); // true for mentor

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <FiBell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-primary-color text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-80 bg-[#111936] border border-white/10 rounded-lg shadow-lg overflow-hidden z-50"
          >
            <div className="p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">
                Notifications
              </h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-color mx-auto"></div>
                  <p className="mt-2">Loading notifications...</p>
                </div>
              ) : error ? (
                <div className="p-4 text-center text-red-500">
                  <p>{error}</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <FiBellOff size={32} className="mx-auto mb-2" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <>
                  {/* Unread Notifications */}
                  {notifications.some((n) => !n.isRead) && (
                    <div className="border-b border-white/10">
                      <div className="p-2 bg-white/[0.02]">
                        <h4 className="text-sm font-medium text-white/60 px-2">
                          Unread
                        </h4>
                      </div>
                      {notifications
                        .filter((n) => !n.isRead)
                        .map((notification) => {
                          const isChat = notification.type === "NEW_MESSAGE";
                          const Icon = isChat ? FiMessageSquare : FiBell;

                          return (
                            <div
                              key={notification._id}
                              onClick={() => {
                                markAsRead(notification._id);
                                handleNotificationClick(notification);
                              }}
                              className="p-4 border-b border-white/10 hover:bg-white/[0.02] transition-colors cursor-pointer bg-white/[0.02]"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3 flex-grow">
                                  <div
                                    className={`w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 ${
                                      isChat
                                        ? "bg-blue-500"
                                        : "bg-primary-color"
                                    }`}
                                  >
                                    <Icon className="w-4 h-4 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-white">
                                      {notification.message}
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1">
                                      {new Date(
                                        notification.createdAt
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification._id);
                                  }}
                                  className="p-1 text-gray-400 hover:text-white transition-colors"
                                >
                                  <FiCheck size={16} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}

                  {/* Read Notifications */}
                  {notifications.some((n) => n.isRead) && (
                    <div>
                      <div className="p-2">
                        <h4 className="text-sm font-medium text-white/60 px-2">
                          Earlier
                        </h4>
                      </div>
                      {notifications
                        .filter((n) => n.isRead)
                        .map((notification) => {
                          const isChat = notification.type === "NEW_MESSAGE";
                          const Icon = isChat ? FiMessageSquare : FiBell;

                          return (
                            <div
                              key={notification._id}
                              onClick={() =>
                                handleNotificationClick(notification)
                              }
                              className="p-4 border-b border-white/10 hover:bg-white/[0.02] transition-colors cursor-pointer"
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 ${
                                    isChat
                                      ? "bg-blue-500/50"
                                      : "bg-primary-color/50"
                                  }`}
                                >
                                  <Icon className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <p className="text-white/80">
                                    {notification.message}
                                  </p>
                                  <p className="text-sm text-gray-400 mt-1">
                                    {new Date(
                                      notification.createdAt
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
