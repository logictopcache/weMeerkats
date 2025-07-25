import { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { MessageCircle, User } from "lucide-react";
import { fetchMatchedMentors } from "../../../services/api/matchedMentorsService";
import {
  createMenteeConversation,
  fetchMenteeConversations,
} from "../../../services/api/menteeApi";
import { fetchMentors } from "../../../services/api/mentorApi";
import { toast } from "react-hot-toast";

const MentorCard = ({ mentor }) => {
  const navigate = useNavigate();

  const handleSendMessage = async () => {
    try {
      const userId = localStorage.getItem("userId");

      // First check if conversation already exists
      const conversations = await fetchMenteeConversations(userId);
      const existingConversation = conversations.find(
        (conv) => conv.mentorId._id === mentor._id
      );

      if (existingConversation) {
        // If conversation exists, navigate to it
        navigate("/mentee/messages", {
          state: {
            conversationId: existingConversation._id,
            selectedMentorId: mentor._id,
          },
        });
      } else {
        // If no conversation exists, create one
        const result = await createMenteeConversation(mentor._id, userId);
        if (result.conversation) {
          navigate("/mentee/messages", {
            state: {
              conversationId: result.conversation._id,
              selectedMentorId: mentor._id,
            },
          });
        }
      }
    } catch (error) {
      console.error("Error handling conversation:", error);
      if (error.response?.data?.error === "conversation already exists") {
        toast.error(
          "A conversation with this mentor already exists. Please check your messages."
        );
      } else {
        toast.error("Failed to start conversation");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="relative group w-[320px]"
    >
      {/* Gradient Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-color/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Card Content */}
      <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        <div className="relative">
          <img
            src={mentor.image || "/media.png"}
            alt={`${mentor.firstName} ${mentor.lastName}`}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.target.src = "/media.png"; // Fallback if image fails to load
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1128]/90 to-transparent" />
          {!mentor.isVerified && (
            <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-500/90 text-black text-xs font-medium rounded-full">
              Pending Verification
            </div>
          )}
          {mentor.isVerified && (
            <div className="absolute top-4 right-4 px-3 py-1 bg-green-500/90 text-white text-xs font-medium rounded-full">
              Verified
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-bold text-lg text-white mb-1 group-hover:text-primary-color transition-colors">
              {mentor.fullName || `${mentor.firstName} ${mentor.lastName}`}
            </h3>
          </div>

          {/* Bio Section */}
          {mentor.bio && (
            <p
              className="text-white/70 text-xs leading-relaxed overflow-hidden"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {mentor.bio}
            </p>
          )}

          {/* Matching Score */}
          {mentor.matching_score !== undefined && (
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 bg-white/5 rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-green-400 to-blue-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${mentor.matching_score * 100}%` }}
                />
              </div>
              <span className="text-xs text-white/70 font-medium">
                {Math.round(mentor.matching_score * 100)}% Match
              </span>
            </div>
          )}

          {/* Matched Skills */}
          {mentor.matched_skills && mentor.matched_skills.length > 0 && (
            <div className="mb-2">
              <p className="text-xs text-white/60 mb-1">Matched Skills:</p>
              <div className="flex flex-wrap gap-1">
                {mentor.matched_skills.slice(0, 2).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30"
                  >
                    {skill}
                  </span>
                ))}
                {mentor.matched_skills.length > 2 && (
                  <span className="px-2 py-1 bg-white/5 text-white/60 text-xs rounded-full">
                    +{mentor.matched_skills.length - 2}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Skills Section */}
          {mentor.skills && mentor.skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {mentor.skills.slice(0, 2).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary-color/10 text-primary-color text-xs rounded-full border border-primary-color/20"
                >
                  {skill}
                </span>
              ))}
              {mentor.skills.length > 2 && (
                <span className="px-2 py-1 bg-white/5 text-white/60 text-xs rounded-full">
                  +{mentor.skills.length - 2}
                </span>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Link to={`/mentee/mprofile?id=${mentor._id}`} className="flex-1">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-1 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 text-white py-2 px-3 rounded-lg transition-all duration-300 text-sm"
              >
                <User className="w-3 h-3" />
                <span>Profile</span>
              </motion.button>
            </Link>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSendMessage}
              disabled={!mentor.isVerified}
              className={`flex items-center justify-center gap-1 ${
                mentor.isVerified
                  ? "bg-gradient-to-r from-primary-color/20 to-blue-500/20 hover:from-primary-color/30 hover:to-blue-500/30 backdrop-blur-xl border border-white/10 text-white"
                  : "bg-white/[0.02] text-white/30 cursor-not-allowed border border-white/10"
              } py-2 px-3 rounded-lg transition-all duration-300 text-sm`}
            >
              <MessageCircle className="w-3 h-3" />
              <span>Message</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Mentors = () => {
  const [mentors, setMentors] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getMatchedMentors = async () => {
      try {
        const response = await fetchMatchedMentors({
          minScore: 0.2,
          maxResults: 3,
        });

        if (response.success && response.data.matched_mentors) {
          setMentors(response.data.matched_mentors);
        } else {
          setMentors([]);
        }
      } catch (error) {
        console.error("Error fetching matched mentors:", error);

        // Show user-friendly error message
        if (
          error.message.includes("profile not found") ||
          error.message.includes("no skills defined")
        ) {
          toast.error(
            "Please complete your profile with skills to see matched mentors"
          );
        } else if (error.message.includes("unavailable")) {
          toast.error(
            "Matching service is temporarily unavailable. Showing all mentors instead."
          );
          // Fallback to regular mentors API
          try {
            const data = await fetchMentors();
            setMentors(data);
          } catch (fallbackError) {
            console.error("Fallback mentor fetch failed:", fallbackError);
            setMentors([]);
          }
        } else {
          toast.error("Failed to load matched mentors");
          setMentors([]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    getMatchedMentors();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-color"></div>
      </div>
    );
  }

  if (!mentors || mentors.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl text-white/80 mb-4">No mentors found</h3>
        <p className="text-white/60">Check back later for available mentors.</p>
      </div>
    );
  }

  const itemsPerPage =
    window.innerWidth >= 1280
      ? 4
      : window.innerWidth >= 1024
      ? 3
      : window.innerWidth >= 768
      ? 2
      : 1;
  const totalPages = Math.ceil(mentors.length / itemsPerPage);
  const currentPage = Math.floor(currentIndex / itemsPerPage);

  const canGoNext = currentIndex < mentors.length - itemsPerPage;
  const canGoPrev = currentIndex > 0;

  const handlePrev = () => {
    if (!canGoPrev) return;
    setDirection(-1);
    setCurrentIndex((prev) => Math.max(0, prev - itemsPerPage));
  };

  const handleNext = () => {
    if (!canGoNext) return;
    setDirection(1);
    setCurrentIndex((prev) =>
      Math.min(mentors.length - itemsPerPage, prev + itemsPerPage)
    );
  };

  const handleDotClick = (pageIndex) => {
    setDirection(pageIndex > currentPage ? 1 : -1);
    setCurrentIndex(pageIndex * itemsPerPage);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-5 py-10 bg-[#0A1128]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-white mb-4">
          Your Matched Mentors
        </h1>
        <p className="text-white/60 max-w-2xl mx-auto">
          Discover mentors perfectly matched to your skills and learning goals
          learning journey. Choose from our carefully selected professionals and
          start growing today.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl text-white font-semibold">
            Available Mentors ({mentors.length})
          </h2>
          {mentors.length > itemsPerPage && (
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePrev}
                disabled={!canGoPrev}
                className={`p-2 rounded-full ${
                  canGoPrev
                    ? "bg-white/[0.03] hover:bg-white/[0.06] text-white border border-white/10"
                    : "bg-white/[0.02] text-white/20 cursor-not-allowed"
                }`}
              >
                <FiChevronLeft size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleNext}
                disabled={!canGoNext}
                className={`p-2 rounded-full ${
                  canGoNext
                    ? "bg-white/[0.03] hover:bg-white/[0.06] text-white border border-white/10"
                    : "bg-white/[0.02] text-white/20 cursor-not-allowed"
                }`}
              >
                <FiChevronRight size={20} />
              </motion.button>
            </div>
          )}
        </div>

        <div className="relative">
          <div className="flex justify-center items-center">
            <div className="w-full overflow-hidden py-4">
              <AnimatePresence mode="wait" initial={false} custom={direction}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  initial={{ opacity: 0, x: direction > 0 ? 200 : -200 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -200 : 200 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="flex gap-6 flex-wrap justify-center md:justify-start"
                >
                  {mentors
                    .slice(currentIndex, currentIndex + itemsPerPage)
                    .map((mentor) => (
                      <MentorCard key={mentor._id} mentor={mentor} />
                    ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-3 mt-8">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentPage === index
                      ? "bg-primary-color w-6"
                      : "bg-white/20 hover:bg-white/30"
                  }`}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

MentorCard.propTypes = {
  mentor: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    isVerified: PropTypes.bool.isRequired,
    image: PropTypes.string,
  }).isRequired,
};

export default Mentors;
