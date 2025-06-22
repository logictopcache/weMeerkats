import React, { useEffect } from "react";
import Navigation from "../../../components/mentee/home/Navigation";
import MenteeHeader from "../../../components/mentee/home/Header";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowLeft,
  FiCheck,
  FiAward,
  FiCode,
  FiSmartphone,
  FiPlay,
  FiCpu,
  FiCloud,
  FiShield,
  FiCalendar,
  FiClock,
  FiRefreshCw,
} from "react-icons/fi";
import {
  fetchSkillCategories,
  updateLearningPath,
  fetchLearnerPath,
} from "../../../services/api/progressTrackingService";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import ProgressSummary from "../../../components/mentee/progress/ProgressSummary";

const ProgressTracking = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [learningPath, setLearningPath] = React.useState(null);
  const [skillCategories, setSkillCategories] = React.useState({});
  const [showWarningModal, setShowWarningModal] = React.useState(false);

  // States for path selection
  const [selectedCategory, setSelectedCategory] = React.useState(null);
  const [selectedSkills, setSelectedSkills] = React.useState([]);
  const [selectedSkillDates, setSelectedSkillDates] = React.useState({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [previousPath, setPreviousPath] = React.useState(null);

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Web Development":
        return FiCode;
      case "Mobile Development":
        return FiSmartphone;
      case "Game Development":
        return FiPlay;
      case "AI & ML":
        return FiCpu;
      case "Cloud Computing":
        return FiCloud;
      case "Cyber Security":
        return FiShield;
      default:
        return FiCode;
    }
  };

  // Load initial data - First check if user has a learning path
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const learnerId = localStorage.getItem("userId");

        // First try to fetch existing learning path
        if (learnerId) {
          try {
            const path = await fetchLearnerPath(learnerId);
            setLearningPath(path);
            // Store the path for reference when changing
            setPreviousPath(path);
            // If path exists, we don't need to load categories yet
            if (path) {
              setLoading(false);
              return;
            }
          } catch (pathError) {
            // If 404, it means no path exists, continue to load categories
            if (pathError.response?.status !== 404) {
              throw pathError;
            }
          }
        }

        // Only load categories if no path exists
        await loadCategories();
      } catch (err) {
        setError("Failed to load data. Please try again later.");
        toast.error("Failed to load data");
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const handleStartLearningPath = async () => {
    if (selectedSkills.length === 0) {
      toast.error(
        "Please select at least one skill to start your learning path"
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const requestBody = {
        selectedCategory,
        selectedSkills: selectedSkills.map((skillName) => ({
          name: skillName,
          targetDate: selectedSkillDates[skillName],
        })),
      };

      const response = await updateLearningPath(requestBody);
      // Extract the learningPath from the response object
      setLearningPath(response.learningPath);
      toast.success("Learning path started successfully!");

      // Reset selection states after successful path creation
      setSelectedCategory(null);
      setSelectedSkills([]);
      setSelectedSkillDates({});
    } catch (err) {
      toast.error("Failed to start learning path");
      console.error("Error starting learning path:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePath = () => {
    setShowWarningModal(true);
  };

  const handleConfirmChangePath = async () => {
    try {
      setLoading(true);
      // Keep the previous path data for reference
      setPreviousPath(learningPath);
      setLearningPath(null);
      // Set the previous category as selected
      setSelectedCategory(learningPath.selectedCategory);
      // Pre-select skills that had progress
      const skillsWithProgress = learningPath.selectedSkills
        .filter((skill) => skill.progress > 0)
        .map((skill) => skill.name);
      setSelectedSkills(skillsWithProgress);
      // Set target dates for pre-selected skills
      const dates = {};
      learningPath.selectedSkills.forEach((skill) => {
        if (skill.progress > 0) {
          dates[skill.name] = new Date(skill.targetDate)
            .toISOString()
            .split("T")[0];
        }
      });
      setSelectedSkillDates(dates);
      setShowWarningModal(false);
      await loadCategories();
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categories = await fetchSkillCategories();
      const transformedCategories = categories.reduce((acc, category) => {
        acc[category.name] = category.skills.map((skill) => ({
          name: skill.name,
          progress: skill.baseProgress,
          icon: getCategoryIcon(category.name),
        }));
        return acc;
      }, {});
      setSkillCategories(transformedCategories);
    } catch (err) {
      toast.error("Failed to load categories");
      console.error("Error loading categories:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1128] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A1128] flex items-center justify-center">
        <div className="text-white">{error}</div>
      </div>
    );
  }

  // If learning path exists, show the path details view
  if (learningPath && learningPath.selectedSkills) {
    return (
      <div className="min-h-screen bg-[#0A1128]">
        <MenteeHeader />
        <Navigation />
        <div className="max-w-[1200px] mx-auto px-5 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Your Learning Path
                </h1>
                <p className="text-gray-400">
                  Category: {learningPath.selectedCategory}
                </p>
              </div>
              <button
                onClick={handleChangePath}
                className="flex items-center gap-2 px-4 py-2 bg-primary-color/10 text-primary-color rounded-lg hover:bg-primary-color/20 transition-colors"
              >
                <FiRefreshCw size={18} />
                <span>Change Path</span>
              </button>
            </div>

            <ProgressSummary learningPath={learningPath} />

            <div className="grid gap-6">
              {learningPath.selectedSkills.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#111936] border border-primary-color/20 rounded-xl p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {skill.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                        <span className="flex items-center gap-2">
                          <FiCalendar size={16} />
                          Started:{" "}
                          {new Date(skill.startDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-2">
                          <FiClock size={16} />
                          Target:{" "}
                          {new Date(skill.targetDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-2 rounded-full bg-[#1a2547]">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${skill.progress}%` }}
                            className="h-full rounded-full bg-primary-color"
                          />
                        </div>
                        <span className="text-white font-medium">
                          {skill.progress}%
                        </span>
                      </div>
                    </div>
                    <Link
                      to={`/mentee/progress/skill/${encodeURIComponent(
                        skill.name
                      )}`}
                      className="px-4 py-2 bg-primary-color text-white rounded-lg hover:bg-primary-color/90 transition-colors"
                    >
                      View Assignments
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Warning Modal */}
        <AnimatePresence>
          {showWarningModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#111936] border border-primary-color/20 rounded-xl p-6 max-w-md w-full"
              >
                <h3 className="text-xl font-semibold text-white mb-4">
                  Change Learning Path?
                </h3>
                <p className="text-gray-400 mb-6">
                  Are you sure you want to change your learning path? Your
                  current progress will be saved, but you'll need to select new
                  skills for your new path.
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowWarningModal(false)}
                    className="px-4 py-2 text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmChangePath}
                    className="px-4 py-2 bg-primary-color text-white rounded-lg hover:bg-primary-color/90 transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // If no learning path exists or we're choosing a new one, show the path selection view
  return (
    <div className="min-h-screen bg-[#0A1128]">
      <MenteeHeader />
      <Navigation />
      <div className="max-w-[1200px] mx-auto px-5 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {selectedCategory
                ? selectedCategory
                : "Choose Your Learning Path"}
            </h1>
            <p className="text-gray-400">
              {selectedCategory
                ? "Select the skills you want to learn"
                : "Select a category to get started"}
            </p>
            {previousPath && (
              <p className="text-primary-color mt-2">
                Your previous category: {previousPath.selectedCategory}
              </p>
            )}
          </div>

          <AnimatePresence mode="wait">
            {!selectedCategory ? (
              // Category Selection View
              <motion.div
                key="categories"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {Object.keys(skillCategories || {}).map((category, index) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedCategory(category)}
                    className="group cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-color/20 to-blue-500/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <div
                      className={`relative bg-[#111936] border p-6 rounded-xl transition-colors ${
                        previousPath?.selectedCategory === category
                          ? "border-primary-color border-2"
                          : "border-primary-color/20 hover:border-primary-color"
                      }`}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div
                          className={`p-3 rounded-lg ${
                            previousPath?.selectedCategory === category
                              ? "bg-primary-color/20"
                              : "bg-primary-color/10"
                          }`}
                        >
                          {getCategoryIcon(category)({
                            size: 24,
                            className: "text-primary-color",
                          })}
                        </div>
                        <h3 className="text-xl font-semibold text-white">
                          {category}
                        </h3>
                      </div>
                      <p className="text-gray-400">
                        {skillCategories[category].length} skills available
                      </p>
                      {previousPath?.selectedCategory === category && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-primary-color text-sm">
                            Current Path
                          </span>
                          <FiCheck size={16} className="text-primary-color" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              // Skill Selection View
              <motion.div
                key="skills"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4 mb-8">
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedSkills([]);
                      setSelectedSkillDates({});
                    }}
                    className="p-2 rounded-xl bg-primary-color/10 border border-primary-color/20 text-primary-color hover:bg-primary-color/20 transition-colors"
                  >
                    <FiArrowLeft size={20} />
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(skillCategories[selectedCategory] || []).map(
                    (skill, index) => {
                      const previousSkill = previousPath?.selectedSkills.find(
                        (s) => s.name === skill.name
                      );
                      return (
                        <motion.div
                          key={skill.name}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => {
                            if (selectedSkills.includes(skill.name)) {
                              setSelectedSkills((prev) =>
                                prev.filter((s) => s !== skill.name)
                              );
                              setSelectedSkillDates((prev) => {
                                const newDates = { ...prev };
                                delete newDates[skill.name];
                                return newDates;
                              });
                            } else {
                              const targetDate = previousSkill?.targetDate
                                ? new Date(previousSkill.targetDate)
                                    .toISOString()
                                    .split("T")[0]
                                : new Date(
                                    Date.now() + 30 * 24 * 60 * 60 * 1000
                                  )
                                    .toISOString()
                                    .split("T")[0];
                              setSelectedSkills((prev) => [
                                ...prev,
                                skill.name,
                              ]);
                              setSelectedSkillDates((prev) => ({
                                ...prev,
                                [skill.name]: targetDate,
                              }));
                            }
                          }}
                          className={`cursor-pointer relative overflow-hidden rounded-xl border transition-all ${
                            selectedSkills.includes(skill.name)
                              ? "border-primary-color bg-primary-color/10"
                              : previousSkill?.progress > 0
                              ? "border-green-500/50 bg-green-500/5 hover:border-green-500"
                              : "border-primary-color/20 bg-[#111936] hover:border-primary-color/50"
                          }`}
                        >
                          <div className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <skill.icon
                                  size={20}
                                  className={
                                    selectedSkills.includes(skill.name)
                                      ? "text-primary-color"
                                      : previousSkill?.progress > 0
                                      ? "text-green-500"
                                      : "text-gray-400"
                                  }
                                />
                                <span className="text-white font-medium">
                                  {skill.name}
                                </span>
                              </div>
                              <div
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                  selectedSkills.includes(skill.name)
                                    ? "border-primary-color bg-primary-color"
                                    : previousSkill?.progress > 0
                                    ? "border-green-500 bg-green-500/10"
                                    : "border-gray-600"
                                }`}
                              >
                                {(selectedSkills.includes(skill.name) ||
                                  previousSkill?.progress > 0) && (
                                  <FiCheck
                                    size={14}
                                    className={
                                      selectedSkills.includes(skill.name)
                                        ? "text-white"
                                        : "text-green-500"
                                    }
                                  />
                                )}
                              </div>
                            </div>
                            {previousSkill?.progress > 0 && (
                              <div className="mt-2 text-sm text-green-500">
                                Current Progress: {previousSkill.progress}%
                              </div>
                            )}
                          </div>
                          {selectedSkills.includes(skill.name) && (
                            <div className="p-4 border-t border-primary-color/20">
                              <div className="flex items-center gap-3 mb-2">
                                <FiCalendar
                                  size={16}
                                  className="text-primary-color"
                                />
                                <span className="text-sm text-gray-400">
                                  Target Completion Date:
                                </span>
                              </div>
                              <input
                                type="date"
                                value={selectedSkillDates[skill.name]}
                                onChange={(e) => {
                                  setSelectedSkillDates((prev) => ({
                                    ...prev,
                                    [skill.name]: e.target.value,
                                  }));
                                }}
                                min={new Date().toISOString().split("T")[0]}
                                className="w-full px-3 py-2 rounded-lg bg-[#1a2547] border border-primary-color/20 text-white focus:outline-none focus:border-primary-color"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          )}
                        </motion.div>
                      );
                    }
                  )}
                </div>

                {selectedSkills.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center mt-8"
                  >
                    <button
                      onClick={handleStartLearningPath}
                      disabled={isSubmitting}
                      className={`px-8 py-3 bg-primary-color text-white rounded-lg transition-colors ${
                        isSubmitting
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-primary-color/90"
                      }`}
                    >
                      {isSubmitting ? "Starting..." : "Start Learning Path"}
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default ProgressTracking;
