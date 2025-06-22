import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  FiSearch,
  FiMessageSquare,
  FiBell,
  FiUser,
  FiLogOut,
} from "react-icons/fi";
import Avvvatars from "avvvatars-react";
import logo from "/logo.png";
import NotificationCenter from "../notifications/NotificationCenter";
import { useNotifications } from "../../../hooks/useNotifications";
import { fetchUserProfile } from "../../../services/api/profileService";
import ProfileAvatar from "../../ProfileAvatar";

const MenteeHeader = () => {
  const [showLogout, setShowLogout] = useState(false);
  const [searchParams] = useSearchParams();
  const [searchFocused, setSearchFocused] = useState(false);
  const [userProfile, setUserProfile] = useState({
    email: "",
    fullName: "",
    profilePictureUrl: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { unreadChatCount } = useNotifications(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await fetchUserProfile(false);
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
    navigate("/signin");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchQuery = e.target.search.value;
    if (searchQuery.trim()) {
      navigate(
        `/mentee/search?query=${encodeURIComponent(searchQuery.trim())}`
      );
    }
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
          <Link to="/mentee/home">
            <img
              src={logo}
              alt="WeMeerkats Logo"
              className="w-[180px] md:w-[250px] hover:opacity-90 transition-opacity"
            />
          </Link>
        </motion.div>

        <div className="relative max-w-md w-full mx-4">
          <form onSubmit={handleSearch} className="relative">
            <motion.div
              animate={{
                scale: searchFocused ? 1.02 : 1,
                boxShadow: searchFocused
                  ? "0 0 20px rgba(89, 187, 169, 0.2)"
                  : "none",
              }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <input
                type="text"
                name="search"
                defaultValue={searchParams.get("query") || ""}
                placeholder="Search Mentors"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full px-5 py-3 bg-white/[0.03] border border-white/10 rounded-xl focus:outline-none focus:border-primary-color text-white placeholder-white/40 pr-12"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-primary-color transition-colors"
              >
                <FiSearch size={20} />
              </button>
            </motion.div>
          </form>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/mentee/messages" className="relative group">
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
                  name={userProfile.fullName || "User"}
                  email={userProfile.email || "user@example.com"}
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
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-[#0A1128] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-white/10">
                    <p className="text-white/80 text-sm font-medium">
                      {userProfile.fullName || "User"}
                    </p>
                    <p className="text-white/60 text-[12px] text-wrap truncate">
                      {isLoading
                        ? "Loading..."
                        : userProfile.email || "user@example.com"}
                    </p>
                  </div>
                  <div className="p-2">
                    <Link
                      to="/mentee/profile"
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

export default MenteeHeader;
