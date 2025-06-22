import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser,
  FiMail,
  FiCalendar,
  FiAward,
  FiTrendingUp,
  FiClock,
  FiTarget,
  FiBarChart,
  FiRefreshCw,
} from "react-icons/fi";
import { Trophy, Medal, Star, BookOpen, Brain, Clock } from "lucide-react";
import Navigation from "../../../components/mentee/home/Navigation";
import MenteeHeader from "../../../components/mentee/home/Header";
import { fetchUserProfile } from "../../../services/api/profileService";
import { quizService } from "../../../services/api/quizService";
import { toast } from "react-hot-toast";
import ProfileAvatar from "../../../components/ProfileAvatar";

const MenteeProfile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [quizStats, setQuizStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    totalTimeTaken: 0,
    bestCategory: null,
    recentActivity: [],
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);

      // Load user profile and quiz results in parallel
      const [profileResponse, quizResponse] = await Promise.all([
        fetchUserProfile(false),
        quizService.getAllQuizResults(),
      ]);

      setUserProfile(profileResponse);
      setQuizResults(quizResponse.results || []);

      // Debug log to check profile data

      // Calculate quiz statistics
      const results = quizResponse.results || [];
      const stats = calculateQuizStats(results);
      setQuizStats(stats);
    } catch (error) {
      console.error("Error loading profile data:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const calculateQuizStats = (results) => {
    if (!results || results.length === 0) {
      return {
        totalQuizzes: 0,
        averageScore: 0,
        totalTimeTaken: 0,
        bestCategory: null,
        recentActivity: [],
      };
    }

    const totalQuizzes = results.length;
    const averageScore = Math.round(
      results.reduce((sum, result) => sum + result.percentage, 0) / totalQuizzes
    );
    const totalTimeTaken = results.reduce(
      (sum, result) => sum + (result.timeTaken || 0),
      0
    );

    // Find best performing category
    const bestCategory = results.reduce((best, current) =>
      !best || current.percentage > best.percentage ? current : best
    );

    // Get recent activity (last 5 quizzes)
    const recentActivity = results
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 5);

    return {
      totalQuizzes,
      averageScore,
      totalTimeTaken,
      bestCategory,
      recentActivity,
    };
  };

  const getPerformanceColor = (percentage) => {
    if (percentage >= 80) return "text-green-500";
    if (percentage >= 60) return "text-blue-500";
    if (percentage >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  const getPerformanceBadgeColor = (percentage) => {
    if (percentage >= 80)
      return "bg-green-500/10 border-green-500/20 text-green-500";
    if (percentage >= 60)
      return "bg-blue-500/10 border-blue-500/20 text-blue-500";
    if (percentage >= 40)
      return "bg-yellow-500/10 border-yellow-500/20 text-yellow-500";
    return "bg-red-500/10 border-red-500/20 text-red-500";
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1128]">
        <MenteeHeader />
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-color"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1128]">
      <MenteeHeader />
      <Navigation />

      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Profile Header */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-color to-blue-500 rounded-full blur opacity-30"></div>
                <div className="relative">
                  <ProfileAvatar
                    name={userProfile?.fullName}
                    email={userProfile?.email}
                    image={userProfile?.profilePictureUrl}
                    size="xl"
                    style="shape"
                    className="w-32 h-32"
                  />
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {userProfile?.fullName || "User"}
                </h1>
                <div className="flex flex-col md:flex-row gap-4 text-white/60 mb-4">
                  <div className="flex items-center gap-2">
                    <FiMail size={16} />
                    <span>{userProfile?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCalendar size={16} />
                    <span>
                      Member since{" "}
                      {formatDate(userProfile?.createdAt || new Date())}
                    </span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-primary-color">
                      {quizStats.totalQuizzes}
                    </div>
                    <div className="text-sm text-white/60">Quizzes Taken</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {quizStats.averageScore}%
                    </div>
                    <div className="text-sm text-white/60">Average Score</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      {formatTime(quizStats.totalTimeTaken)}
                    </div>
                    <div className="text-sm text-white/60">Total Time</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-yellow-500">
                      {quizStats.bestCategory
                        ? quizStats.bestCategory.percentage
                        : 0}
                      %
                    </div>
                    <div className="text-sm text-white/60">Best Score</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-white/10">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === "overview"
                  ? "text-primary-color"
                  : "text-white/60 hover:text-white/80"
              }`}
            >
              <FiUser className="w-4 h-4" />
              Overview
              {activeTab === "overview" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-color"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("quiz-history")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === "quiz-history"
                  ? "text-primary-color"
                  : "text-white/60 hover:text-white/80"
              }`}
            >
              <FiAward className="w-4 h-4" />
              Quiz History
              {activeTab === "quiz-history" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-color"
                />
              )}
            </button>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Profile Information Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Bio Section */}
                  <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                      <FiUser className="text-primary-color" />
                      About Me
                    </h3>

                    {userProfile?.bio ? (
                      <div className="text-white/80 leading-relaxed">
                        {userProfile.bio}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FiUser className="w-12 h-12 text-white/20 mx-auto mb-4" />
                        <p className="text-white/60">No bio available</p>
                        <p className="text-white/40 text-sm">
                          Add a bio to tell others about yourself
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Skills Section */}
                  <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                      <FiTarget className="text-primary-color" />
                      Skills
                    </h3>

                    {userProfile?.skills && userProfile.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {userProfile.skills.map((skill, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="px-3 py-1 bg-primary-color/10 border border-primary-color/20 rounded-full text-primary-color text-sm"
                          >
                            {skill}
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FiTarget className="w-12 h-12 text-white/20 mx-auto mb-4" />
                        <p className="text-white/60">No skills listed</p>
                        <p className="text-white/40 text-sm">
                          Add skills to showcase your expertise
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Education Section */}
                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <FiAward className="text-primary-color" />
                    Education
                  </h3>

                  {userProfile?.education &&
                  userProfile.education.length > 0 ? (
                    <div className="space-y-4">
                      {userProfile.education.map((edu, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white/5 rounded-lg p-4 border border-white/5"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary-color/10 flex items-center justify-center flex-shrink-0">
                              <FiAward className="w-5 h-5 text-primary-color" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-white font-semibold text-lg">
                                {edu.degree || "Degree"}
                              </h4>
                              <p className="text-primary-color font-medium">
                                {edu.universityName || "Institution"}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-white/60">
                                {edu.location && (
                                  <span className="flex items-center gap-1">
                                    <FiCalendar size={14} />
                                    {edu.location}
                                  </span>
                                )}
                                {edu.duration && (
                                  <span className="flex items-center gap-1">
                                    <FiClock size={14} />
                                    {edu.duration}
                                  </span>
                                )}
                              </div>
                              {edu.description && (
                                <p className="text-white/70 text-sm mt-2">
                                  {edu.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FiAward className="w-12 h-12 text-white/20 mx-auto mb-4" />
                      <p className="text-white/60">No education information</p>
                      <p className="text-white/40 text-sm">
                        Add your educational background
                      </p>
                    </div>
                  )}
                </div>

                {/* Performance and Activity Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Performance Overview */}
                  <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                      <FiBarChart className="text-primary-color" />
                      Performance Overview
                    </h3>

                    {quizStats.bestCategory ? (
                      <div className="space-y-4">
                        <div className="bg-white/5 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white/80">Best Category</span>
                            <Trophy className="w-5 h-5 text-yellow-500" />
                          </div>
                          <div className="text-lg font-semibold text-white">
                            {quizStats.bestCategory.category}
                          </div>
                          <div
                            className={`text-sm ${getPerformanceColor(
                              quizStats.bestCategory.percentage
                            )}`}
                          >
                            {quizStats.bestCategory.percentage}% (
                            {quizStats.bestCategory.score}/5)
                          </div>
                        </div>

                        <div className="bg-white/5 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white/80">
                              Learning Streak
                            </span>
                            <Star className="w-5 h-5 text-primary-color" />
                          </div>
                          <div className="text-lg font-semibold text-white">
                            {quizStats.totalQuizzes} Quiz
                            {quizStats.totalQuizzes !== 1 ? "es" : ""}
                          </div>
                          <div className="text-sm text-white/60">
                            Keep up the great work!
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <BookOpen className="w-12 h-12 text-white/20 mx-auto mb-4" />
                        <p className="text-white/60">
                          No quiz data available yet
                        </p>
                        <p className="text-white/40 text-sm">
                          Take your first quiz to see your performance
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                      <FiClock className="text-primary-color" />
                      Recent Activity
                    </h3>

                    {quizStats.recentActivity.length > 0 ? (
                      <div className="space-y-3">
                        {quizStats.recentActivity.map((activity, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  activity.percentage >= 80
                                    ? "bg-green-500/20"
                                    : activity.percentage >= 60
                                    ? "bg-blue-500/20"
                                    : "bg-yellow-500/20"
                                }`}
                              >
                                {activity.percentage >= 80 ? (
                                  <Trophy className="w-4 h-4 text-green-500" />
                                ) : activity.percentage >= 60 ? (
                                  <Medal className="w-4 h-4 text-blue-500" />
                                ) : (
                                  <Star className="w-4 h-4 text-yellow-500" />
                                )}
                              </div>
                              <div>
                                <div className="text-white font-medium text-sm">
                                  {activity.category}
                                </div>
                                <div className="text-white/60 text-xs">
                                  {formatDate(activity.completedAt)}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div
                                className={`font-semibold ${getPerformanceColor(
                                  activity.percentage
                                )}`}
                              >
                                {activity.percentage}%
                              </div>
                              <div className="text-white/60 text-xs">
                                {activity.score}/5
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="w-12 h-12 text-white/20 mx-auto mb-4" />
                        <p className="text-white/60">No recent activity</p>
                        <p className="text-white/40 text-sm">
                          Your quiz history will appear here
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "quiz-history" && (
              <motion.div
                key="quiz-history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <FiAward className="text-primary-color" />
                      Quiz History
                    </h3>
                    <button
                      onClick={loadProfileData}
                      className="flex items-center gap-2 px-3 py-2 bg-primary-color/10 text-primary-color rounded-lg hover:bg-primary-color/20 transition-colors"
                    >
                      <FiRefreshCw size={16} />
                      Refresh
                    </button>
                  </div>

                  {quizResults.length > 0 ? (
                    <div className="space-y-4">
                      {quizResults.map((result, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white/5 rounded-lg p-4 border border-white/5 hover:border-primary-color/20 transition-colors"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    result.percentage >= 80
                                      ? "bg-green-500/20"
                                      : result.percentage >= 60
                                      ? "bg-blue-500/20"
                                      : "bg-yellow-500/20"
                                  }`}
                                >
                                  {result.percentage >= 80 ? (
                                    <Trophy className="w-5 h-5 text-green-500" />
                                  ) : result.percentage >= 60 ? (
                                    <Medal className="w-5 h-5 text-blue-500" />
                                  ) : (
                                    <Brain className="w-5 h-5 text-yellow-500" />
                                  )}
                                </div>
                                <div>
                                  <h4 className="text-white font-semibold">
                                    {result.category}
                                  </h4>
                                  <div className="flex items-center gap-4 text-sm text-white/60">
                                    <span>
                                      Completed:{" "}
                                      {formatDate(result.completedAt)}
                                    </span>
                                    <span>
                                      Time: {formatTime(result.timeTaken || 0)}
                                    </span>
                                    {result.retakeCount > 0 && (
                                      <span>Retakes: {result.retakeCount}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div
                                  className={`text-2xl font-bold ${getPerformanceColor(
                                    result.percentage
                                  )}`}
                                >
                                  {result.percentage}%
                                </div>
                                <div className="text-white/60 text-sm">
                                  {result.score}/5 correct
                                </div>
                              </div>

                              <div
                                className={`px-3 py-1 rounded-full text-xs font-medium border ${getPerformanceBadgeColor(
                                  result.percentage
                                )}`}
                              >
                                {result.performanceLevel}
                              </div>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-4">
                            <div className="w-full bg-white/10 rounded-full h-2">
                              <motion.div
                                className={`h-2 rounded-full ${
                                  result.percentage >= 80
                                    ? "bg-green-500"
                                    : result.percentage >= 60
                                    ? "bg-blue-500"
                                    : "bg-yellow-500"
                                }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${result.percentage}%` }}
                                transition={{ duration: 1, delay: index * 0.1 }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 text-white/20 mx-auto mb-4" />
                      <h4 className="text-xl font-semibold text-white mb-2">
                        No Quiz History
                      </h4>
                      <p className="text-white/60 mb-4">
                        You haven't taken any quizzes yet
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => (window.location.href = "/mentee/quiz")}
                        className="px-6 py-3 bg-primary-color text-white rounded-lg hover:bg-primary-color/90 transition-colors"
                      >
                        Take Your First Quiz
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default MenteeProfile;
