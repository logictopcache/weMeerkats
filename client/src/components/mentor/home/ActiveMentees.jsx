import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  createConversation,
  fetchMentorConversations,
} from "../../../services/api/mentorApi";
import { fetchMenteesProgress } from "../../../services/api/mentorProgressApi";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ProfileAvatar from "../../../components/ProfileAvatar";

const MenteeCard = ({ mentee, onStartChat }) => {
  const navigate = useNavigate();
  const [progressData, setProgressData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadProgressData = async () => {
      try {
        const data = await fetchMenteesProgress();
        const menteeProgress = data.menteeProgress.find(
          (progress) => progress.learner._id === mentee._id
        );
        setProgressData(menteeProgress);
      } catch (error) {
        console.error("Error loading mentee progress:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgressData();
  }, [mentee._id]);

  if (isLoading) {
    return (
      <motion.div
        layout
        className="bg-[#0c1631] backdrop-blur-xl rounded-2xl border border-white/10 p-4 md:p-6"
      >
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-white/10 h-12 w-12 md:h-16 md:w-16"></div>
          <div className="flex-1 space-y-4">
            <div className="h-4 bg-white/10 rounded w-3/4"></div>
            <div className="h-4 bg-white/10 rounded w-1/2"></div>
            <div className="h-2 bg-white/10 rounded w-full"></div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <div className="relative bg-[#0c1631] backdrop-blur-xl rounded-2xl border border-white/10 p-4 md:p-6 hover:border-white/20 transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
          {/* Left Side - Avatar */}
          <div className="flex flex-col items-center md:items-start">
            <div className="relative">
              <div className="border-2 border-primary-color/20 rounded-full overflow-hidden">
                {mentee.profilePictureUrl && !imageError ? (
                  <img
                    src={`http://localhost:5274/uploads/${mentee.profilePictureUrl}`}
                    alt={`${mentee.firstName} ${mentee.lastName}`}
                    className="w-16 h-16 rounded-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <ProfileAvatar
                    name={`${mentee.firstName} ${mentee.lastName}`}
                    email={mentee.email}
                    size="lg"
                    style="character"
                  />
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#0c1631]" />
            </div>
          </div>

          {/* Middle - Main Content */}
          <div className="flex-1 space-y-4">
            {/* Header */}
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-xl font-semibold text-white">
                {`${mentee.firstName} ${mentee.lastName}`}
              </h3>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-white/60 text-sm">Active Learner</span>
                <span className="text-white/40">•</span>
                <span className="text-white/60 text-sm">
                  {mentee.skills?.map((skill) => skill.name).join(", ")}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Learning Progress</span>
                <span className="text-white/80 text-sm">
                  {mentee.overallProgress}%
                </span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-color to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${mentee.overallProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40">
                  {mentee.completedSessions} assignments completed
                </span>
                <span className="text-white/40">
                  {mentee.totalSessions} total assignments
                </span>
              </div>
            </div>

            {/* Skills Progress */}
            <div className="space-y-2">
              {mentee.skills?.map((skill, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">{skill.name}</span>
                    <span className="text-white/80 text-sm">
                      {skill.progress}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-color to-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${skill.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40">
                      {skill.completedAssignments} completed
                    </span>
                    <span className="text-white/40">
                      {skill.totalAssignments} total
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="flex flex-row md:flex-col gap-2 min-w-[140px] justify-center md:justify-start">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 md:flex-none px-3 md:px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium"
              onClick={() => navigate(`/mentor/mprofile?id=${mentee._id}`)}
            >
              View Profile
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 md:flex-none px-3 md:px-4 py-2 bg-amber-500 text-white rounded-lg hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium"
              onClick={() => onStartChat(mentee._id)}
            >
              Start Chat
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 md:flex-none px-3 md:px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium"
              onClick={() => navigate("/mentor/progress")}
            >
              View Progress
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ActiveMentees = ({ mentees }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const menteesPerPage = 3;
  const totalPages = Math.ceil(mentees.length / menteesPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const indexOfLastMentee = currentPage * menteesPerPage;
  const indexOfFirstMentee = indexOfLastMentee - menteesPerPage;
  const currentMentees = mentees.slice(indexOfFirstMentee, indexOfLastMentee);

  const handleStartChat = async (learnerId) => {
    try {
      const mentorId = localStorage.getItem("userId");
      if (!mentorId) {
        console.error("No mentor ID found");
        return;
      }

      const conversations = await fetchMentorConversations(mentorId);
      const existingConversation = conversations.find(
        (conv) => conv.learnerId._id === learnerId
      );

      if (existingConversation) {
        navigate("/mentor/messages", {
          state: {
            conversationId: existingConversation._id,
            selectedLearnerId: learnerId,
          },
        });
      } else {
        const result = await createConversation(mentorId, learnerId);
        if (result) {
          navigate("/mentor/messages", {
            state: {
              conversationId: result._id,
              selectedLearnerId: learnerId,
            },
          });
        }
      }
    } catch (error) {
      console.error("Error handling conversation:", error);
    }
  };

  return (
    <div className="w-full bg-[#0A1128]">
      <div className="max-w-[1200px] mx-auto px-4 py-5">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1 pl-2">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Active Mentees
            </h2>
            <p className="text-white/60">
              Managing {mentees.length} active mentorship connections
            </p>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  currentPage === 1
                    ? "bg-white/5 text-white/20 cursor-not-allowed"
                    : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
                }`}
              >
                <FiChevronLeft className="w-5 h-5" />
              </motion.button>

              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                <span className="text-white/60 text-sm">Page</span>
                <span className="text-white font-medium">{currentPage}</span>
                <span className="text-white/60 text-sm">of</span>
                <span className="text-white font-medium">{totalPages}</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  currentPage === totalPages
                    ? "bg-white/5 text-white/20 cursor-not-allowed"
                    : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
                }`}
              >
                <FiChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          )}
        </div>

        <div className="relative">
          {totalPages > 1 && (
            <>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    currentPage === 1
                      ? "bg-white/5 text-white/20 cursor-not-allowed"
                      : "bg-gradient-to-r from-primary-color to-blue-500 text-white shadow-lg shadow-primary-color/20"
                  }`}
                >
                  <FiChevronLeft className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    currentPage === totalPages
                      ? "bg-white/5 text-white/20 cursor-not-allowed"
                      : "bg-gradient-to-r from-primary-color to-blue-500 text-white shadow-lg shadow-primary-color/20"
                  }`}
                >
                  <FiChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </>
          )}

          <div className="space-y-4 overflow-hidden">
            <AnimatePresence mode="wait">
              {currentMentees.map((mentee) => (
                <MenteeCard
                  key={mentee._id}
                  mentee={mentee}
                  onStartChat={handleStartChat}
                />
              ))}
            </AnimatePresence>

            {mentees.length === 0 && (
              <div className="text-center py-10">
                <p className="text-white/60">No active mentees found</p>
              </div>
            )}
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-1.5 mt-6">
            {[...Array(totalPages)].map((_, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCurrentPage(index + 1)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentPage === index + 1
                    ? "bg-gradient-to-r from-primary-color to-blue-500 scale-125"
                    : "bg-white/10 hover:bg-white/20"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

MenteeCard.propTypes = {
  mentee: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    image: PropTypes.string,
    skills: PropTypes.arrayOf(PropTypes.string),
    nextSession: PropTypes.string,
  }).isRequired,
  onStartChat: PropTypes.func.isRequired,
};

ActiveMentees.propTypes = {
  mentees: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      image: PropTypes.string,
      skills: PropTypes.arrayOf(PropTypes.string),
      nextSession: PropTypes.string,
    })
  ).isRequired,
};

export default ActiveMentees;
