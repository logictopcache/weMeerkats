import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMessageSquare,
  FiArrowLeft,
  FiUser,
  FiSend,
  FiAward,
  FiCalendar,
  FiClock,
} from "react-icons/fi";
import MentorHeader from "../../../components/mentor/home/Header";
import Navigation from "../../../components/mentor/home/Navigation";
import { API_ENDPOINTS } from "../../../services/api/config";
import ProfileAvatar from "../../../components/ProfileAvatar";

const MenteeProfile = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [learnerProfile, setLearnerProfile] = useState(null);
  const [recommendation, setRecommendation] = useState("");

  const handleStartChat = () => {
    const learnerId = searchParams.get("id");
    if (learnerId) {
      navigate(`/mentor/messages`);
    }
  };

  useEffect(() => {
    const fetchLearnerProfile = async () => {
      const learnerId = searchParams.get("id");
      if (!learnerId) {
        setError("No learner ID provided");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_ENDPOINTS.BASE_URL}/api/mentor/mentee-profile/${learnerId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch learner profile");
        }
        const data = await response.json();
        setLearnerProfile(data);
      } catch (error) {
        console.error("Error fetching learner profile:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLearnerProfile();
  }, [searchParams]);

  const handleSendRecommendation = async () => {
    if (!recommendation.trim()) return;

    // TODO: Implement send recommendation API call
    console.log("Sending recommendation:", recommendation);
    setRecommendation("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1128]">
        <MentorHeader />
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-color"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A1128]">
        <MentorHeader />
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-white bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1128]">
      <MentorHeader />
      <Navigation />
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-1">
              <div className="bg-[#0c1631] backdrop-blur-xl rounded-2xl border border-white/10 p-6 space-y-6">
                <div className="flex flex-col items-center">
                  <ProfileAvatar
                    name={learnerProfile?.profile?.fullName}
                    email={learnerProfile?.profile?.email}
                    image={learnerProfile?.profile?.profilePicture}
                    size="lg"
                    style="shape"
                    className="w-24 h-24"
                  />
                  <h2 className="text-xl font-semibold text-white mt-4">
                    {learnerProfile?.profile?.fullName}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-white/60 text-sm">
                      {learnerProfile?.profile?.status}
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartChat}
                    className="mt-6 w-full px-4 py-2 bg-gradient-to-r from-primary-color to-blue-500 text-white rounded-xl flex items-center gap-2 hover:opacity-90 transition-all duration-200"
                  >
                    <FiMessageSquare className="w-4 h-4" />
                    <span>Start Chat</span>
                  </motion.button>
                </div>

                <div className="space-y-4 pt-6 border-t border-white/10">
                  <h3 className="text-lg font-semibold text-white">
                    Skills to Learn
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {learnerProfile?.skillsToLearn?.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-white/[0.03] border border-white/10 rounded-full text-white/80 text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Bio Section */}
              <div className="bg-[#0c1631] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h3 className="text-xl font-semibold text-white mb-4">About</h3>
                <p className="text-white/80">
                  {learnerProfile?.profile?.bio || "No bio available"}
                </p>
              </div>

              {/* Progress Status */}
              <div className="bg-[#0c1631] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h3 className="text-xl font-semibold text-white mb-6">
                  Learning Progress
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {learnerProfile?.learningProgress?.map((status) => (
                    <div
                      key={status.name}
                      className="bg-white/[0.03] rounded-xl p-4 border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">
                          {status.name}
                        </span>
                        <span className="text-primary-color font-semibold">
                          {status.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-white/[0.03] rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary-color to-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${status.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Sessions */}
              <div className="bg-[#0c1631] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h3 className="text-xl font-semibold text-white mb-6">
                  Upcoming Sessions
                </h3>
                <div className="space-y-4">
                  {learnerProfile?.upcomingSessions?.map((session, index) => (
                    <div
                      key={index}
                      className="bg-white/[0.03] rounded-xl p-4 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary-color/10 flex items-center justify-center">
                          <FiUser className="w-5 h-5 text-primary-color" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">
                            {session.title}
                          </h4>
                          <p className="text-white/60 text-sm">
                            {session.skill}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-white/80">
                          <FiCalendar className="w-4 h-4 text-primary-color" />
                          <span className="text-sm">
                            {new Date(session.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-white/80">
                          <FiClock className="w-4 h-4 text-primary-color" />
                          <span className="text-sm">{session.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!learnerProfile?.upcomingSessions ||
                    learnerProfile.upcomingSessions.length === 0) && (
                    <div className="text-center py-6 text-white/60">
                      No upcoming sessions scheduled
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MenteeProfile;
