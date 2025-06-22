import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { FiMessageSquare, FiUser, FiLogOut } from "react-icons/fi";
import Avvvatars from "avvvatars-react";
import logo from "/logo.png";
import NotificationCenter from "../notifications/NotificationCenter";
import { useNotifications } from "../../../hooks/useNotifications";
import { fetchUserProfile } from "../../../services/api/profileService";
import ProfileAvatar from "../../ProfileAvatar";

const MentorHeader = () => {
  const [showLogout, setShowLogout] = useState(false);
  const [userProfile, setUserProfile] = useState({
    email: "",
    fullName: "",
    profilePictureUrl: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const { unreadChatCount } = useNotifications(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await fetchUserProfile(true);
        setUserProfile(profile);
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/signin";
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLogout && !event.target.closest(".user-menu")) {
        setShowLogout(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showLogout]);

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-[#0A1128] border-b border-white/10"
    >
      <div className="flex justify-between items-center max-w-[1200px] mx-auto p-5">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link to="/mentor/home">
            <img
              src={logo}
              alt="WeMeerkats Logo"
              className="w-[180px] md:w-[250px] hover:opacity-90 transition-opacity"
            />
          </Link>
        </motion.div>

        <div className="flex items-center gap-6">
          <Link to="/mentor/messages" className="relative group">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full bg-white/[0.03] border border-white/10 text-white/60 hover:text-primary-color hover:border-primary-color/50 transition-colors"
            >
              <FiMessageSquare size={20} />
            </motion.div>
            {unreadChatCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium"
              >
                {unreadChatCount}
              </motion.div>
            )}
          </Link>

          <NotificationCenter />

          <div className="relative user-menu">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLogout(!showLogout)}
              className="flex items-center justify-center"
            >
              <div className="rounded-full overflow-hidden border-2 border-white/10 hover:border-primary-color/50 transition-colors">
                <ProfileAvatar
                  name={userProfile.fullName || "Mentor"}
                  email={userProfile.email || "mentor@example.com"}
                  image={userProfile.profilePictureUrl}
                  style="shape"
                  size="md"
                />
              </div>
            </motion.button>

            <AnimatePresence>
              {showLogout && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-[#111936] border border-white/10 rounded-lg shadow-lg overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-white/10">
                    <p className="text-white/80 text-sm font-medium">
                      {userProfile.fullName || "Mentor"}
                    </p>
                    <p className="text-white/60 text-sm truncate">
                      {isLoading
                        ? "Loading..."
                        : userProfile.email || "mentor@example.com"}
                    </p>
                  </div>
                  <div className="p-2">
                    <Link
                      to="/mentor/profile"
                      className="w-full px-3 py-2 text-left text-white/80 hover:text-white hover:bg-white/[0.03] rounded-lg transition-colors flex items-center gap-2 text-sm mb-1"
                    >
                      <FiUser size={16} />
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full px-3 py-2 text-left text-white/80 hover:text-white hover:bg-white/[0.03] rounded-lg transition-colors flex items-center gap-2 text-sm"
                    >
                      <FiLogOut size={16} />
                      <span>Sign out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MentorHeader;
