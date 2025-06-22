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
  FiPhone,
  FiBriefcase,
} from "react-icons/fi";
import { Trophy, Medal, Star, BookOpen, Brain, Clock } from "lucide-react";
import Navigation from "../../../components/mentor/home/Navigation";
import MentorHeader from "../../../components/mentor/home/Header";
import { fetchUserProfile } from "../../../services/api/profileService";
import { toast } from "react-hot-toast";
import ProfileAvatar from "../../../components/ProfileAvatar";

const MentorProfile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);

      // Load mentor profile
      const profileResponse = await fetchUserProfile(true);
      setUserProfile(profileResponse);

      // Debug log to check profile data
      console.log("Mentor profile data loaded:", profileResponse);
    } catch (error) {
      console.error("Error loading profile data:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
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
        <MentorHeader />
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-color"></div>
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
                  {userProfile?.fullName || "Mentor"}
                </h1>
                <div className="flex flex-col md:flex-row gap-4 text-white/60 mb-4">
                  <div className="flex items-center gap-2">
                    <FiMail size={16} />
                    <span>{userProfile?.email}</span>
                  </div>
                  {userProfile?.phone && (
                    <div className="flex items-center gap-2">
                      <FiPhone size={16} />
                      <span>{userProfile.phone}</span>
                    </div>
                  )}
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
                      {userProfile?.skills?.length || 0}
                    </div>
                    <div className="text-white/60 text-sm">Skills</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      {userProfile?.workExperiences?.length || 0}
                    </div>
                    <div className="text-white/60 text-sm">Experience</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {userProfile?.education?.length || 0}
                    </div>
                    <div className="text-white/60 text-sm">Education</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-yellow-500">
                      {userProfile?.isVerified ? "Verified" : "Pending"}
                    </div>
                    <div className="text-white/60 text-sm">Status</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 bg-white/5 backdrop-blur-xl rounded-xl p-2 mb-8 border border-white/10">
            <button
              onClick={() => setActiveTab("overview")}
              className={`relative flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === "overview"
                  ? "text-white bg-white/10"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              Overview
              {activeTab === "overview" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-color"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("experience")}
              className={`relative flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === "experience"
                  ? "text-white bg-white/10"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              Experience
              {activeTab === "experience" && (
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

                {/* Expertise and Certifications */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Expertise Section */}
                  <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                      <FiTrendingUp className="text-primary-color" />
                      Expertise
                    </h3>

                    {userProfile?.expertise ? (
                      <div className="text-white/80 leading-relaxed">
                        {userProfile.expertise}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FiTrendingUp className="w-12 h-12 text-white/20 mx-auto mb-4" />
                        <p className="text-white/60">No expertise listed</p>
                        <p className="text-white/40 text-sm">
                          Add your areas of expertise
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Certifications Section */}
                  <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                      <FiAward className="text-primary-color" />
                      Certifications
                    </h3>

                    {userProfile?.certification ? (
                      <div className="text-white/80 leading-relaxed">
                        {userProfile.certification}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FiAward className="w-12 h-12 text-white/20 mx-auto mb-4" />
                        <p className="text-white/60">
                          No certifications listed
                        </p>
                        <p className="text-white/40 text-sm">
                          Add your professional certifications
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
              </motion.div>
            )}

            {activeTab === "experience" && (
              <motion.div
                key="experience"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Work Experience Section */}
                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <FiBriefcase className="text-primary-color" />
                      Work Experience
                    </h3>
                    <button
                      onClick={loadProfileData}
                      className="flex items-center gap-2 px-3 py-2 bg-primary-color/10 text-primary-color rounded-lg hover:bg-primary-color/20 transition-colors"
                    >
                      <FiRefreshCw size={16} />
                      Refresh
                    </button>
                  </div>

                  {userProfile?.workExperiences &&
                  userProfile.workExperiences.length > 0 ? (
                    <div className="space-y-4">
                      {userProfile.workExperiences.map((work, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white/5 rounded-lg p-4 border border-white/5 hover:border-primary-color/20 transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary-color/10 flex items-center justify-center flex-shrink-0">
                              <FiBriefcase className="w-5 h-5 text-primary-color" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-white font-semibold text-lg">
                                {work.title || "Position"}
                              </h4>
                              <p className="text-primary-color font-medium">
                                {work.companyName || "Company"}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-white/60">
                                {work.location && (
                                  <span className="flex items-center gap-1">
                                    <FiCalendar size={14} />
                                    {work.location}
                                  </span>
                                )}
                                {work.duration && (
                                  <span className="flex items-center gap-1">
                                    <FiClock size={14} />
                                    {work.duration}
                                  </span>
                                )}
                              </div>
                              {work.description && (
                                <p className="text-white/70 text-sm mt-2">
                                  {work.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FiBriefcase className="w-12 h-12 text-white/20 mx-auto mb-4" />
                      <p className="text-white/60">No work experience listed</p>
                      <p className="text-white/40 text-sm">
                        Add your professional experience
                      </p>
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

export default MentorProfile;
