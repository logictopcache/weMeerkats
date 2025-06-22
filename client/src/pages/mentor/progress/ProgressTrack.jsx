import { useState, useEffect } from 'react';
import MentorHeader from "../../../components/mentor/home/Header";
import Navigation from "../../../components/mentor/home/Navigation";
import CreateAssignmentModal from '../../../components/mentor/progress/CreateAssignmentModal';
import { motion } from "framer-motion";
import { FiBook, FiCheckCircle, FiClock, FiPlus, FiUser, FiCalendar, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { fetchMenteesProgress, fetchCreatedAssignments } from '../../../services/api/mentorProgressApi';
import { fetchMentorProfile } from '../../../services/api/mentorApi';

const ProgressTrack = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [menteesProgress, setMenteesProgress] = useState([]);
  const [createdAssignments, setCreatedAssignments] = useState([]);
  const [expandedSkills, setExpandedSkills] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [mentorSkills, setMentorSkills] = useState([]);

  const loadData = async () => {
    try {
      const mentorId = localStorage.getItem('userId');
      const [progressData, assignmentsData, mentorData] = await Promise.all([
        fetchMenteesProgress(),
        fetchCreatedAssignments(),
        fetchMentorProfile(mentorId)
      ]);

      if (!progressData.menteeProgress) {
        throw new Error('No progress data available');
      }

      setMenteesProgress(progressData.menteeProgress);
      setCreatedAssignments(assignmentsData);
      setMentorSkills(mentorData.topSkills || []);
    } catch (err) {
      setError(err.message || 'Failed to load data. Please try again later.');
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssignmentCreated = async () => {
    await loadData(); // Reload all data to update both assignments and progress
  };

  const handleCreateAssignment = (skill, mentee) => {
    setSelectedSkill(skill);
    setSelectedMentee(mentee);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedSkill('');
    setSelectedMentee(null);
    handleAssignmentCreated();
  };

  const toggleSkillExpansion = (skillName) => {
    setExpandedSkills(prev => ({
      ...prev,
      [skillName]: !prev[skillName]
    }));
  };

  // Group assignments by skill
  const assignmentsBySkill = createdAssignments.reduce((acc, assignment) => {
    if (!acc[assignment.skillName]) {
      acc[assignment.skillName] = [];
    }
    acc[assignment.skillName].push(assignment);
    return acc;
  }, {});

  // Sort assignments by creation date (newest first)
  Object.values(assignmentsBySkill).forEach(assignments => {
    assignments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  });

  const renderSkillsTable = () => {
    // Calculate assignments and progress data for each skill
    const skillProgressMap = {};
    Object.entries(assignmentsBySkill).forEach(([skillName, assignments]) => {
      const totalAssignments = assignments.length;
      const completedAssignments = assignments.reduce((sum, assignment) => 
        sum + (assignment.isCompleted ? 1 : 0), 0
      );
      const totalCompletions = assignments.reduce((sum, assignment) => 
        sum + (assignment.totalCompletions || 0), 0
      );
      
      // Safely collect all mentees who completed assignments
      const completedByMentees = assignments.reduce((mentees, assignment) => {
        if (assignment.completedBy && Array.isArray(assignment.completedBy)) {
          assignment.completedBy.forEach(student => {
            if (student && student.id) {
              mentees.add(JSON.stringify(student));
            }
          });
        }
        return mentees;
      }, new Set());

      skillProgressMap[skillName] = {
        totalAssignments,
        completedAssignments,
        mentees: Array.from(completedByMentees).map(menteeStr => JSON.parse(menteeStr))
      };
    });

    // Combine mentor skills with progress data
    const allSkills = mentorSkills.map(skillName => ({
      name: skillName,
      ...skillProgressMap[skillName] || {
        totalAssignments: 0,
        completedAssignments: 0,
        mentees: []
      }
    }));

    return (
      <table className="min-w-full">
        <thead>
          <tr className="bg-white/[0.02]">
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Skill Name</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <FiBook size={14} />
                <span>Total Assignments</span>
              </div>
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <FiCheckCircle size={14} />
                <span>Completed</span>
              </div>
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.03]">
          {allSkills.map((skill, index) => (
            <motion.tr 
              key={skill.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group hover:bg-white/[0.02] transition-colors"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-color/10 flex items-center justify-center">
                    <FiBook size={20} className="text-primary-color" />
                  </div>
                  <div>
                    <div className="text-white font-medium">{skill.name}</div>
                    <div className="text-gray-400 text-sm">
                      {skill.mentees.length > 0 
                        ? `${skill.mentees.length} mentee(s) completed assignments` 
                        : 'No completed assignments yet'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-white">{skill.totalAssignments}</td>
              <td className="px-6 py-4 text-white">{skill.completedAssignments}</td>
              <td className="px-6 py-4">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCreateAssignment(skill.name, null)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-color hover:bg-primary-color/90 text-white transition-colors"
                >
                  <FiPlus size={16} />
                  <span>Create</span>
                </motion.button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A1128]">
        <MentorHeader />
        <Navigation />
        <div className="max-w-[1200px] mx-auto px-5 py-10">
          <div className="flex items-center justify-center h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-color"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1128]">
      <MentorHeader />
      <Navigation />
      <div className="relative">
        <div className="max-w-[1200px] mx-auto px-5 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
                {error}
              </div>
            )}

            <div className="mb-12">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary-color/10">
                    <FiBook size={24} className="text-primary-color" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">Created Assignments</h2>
                    <p className="text-gray-400 mt-1">View and manage your created assignments by skill</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                {Object.entries(assignmentsBySkill).map(([skillName, assignments]) => (
                  <motion.div
                    key={skillName}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#111936] border border-white/10 rounded-xl overflow-hidden"
                  >
                    <div 
                      className="p-6 cursor-pointer hover:bg-white/[0.02] transition-colors"
                      onClick={() => toggleSkillExpansion(skillName)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary-color/20 flex items-center justify-center">
                            <FiBook size={20} className="text-primary-color" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">{skillName}</h3>
                            <p className="text-gray-400">{assignments.length} assignments</p>
                          </div>
                        </div>
                        <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
                          {expandedSkills[skillName] ? (
                            <FiChevronUp className="text-gray-400" size={20} />
                          ) : (
                            <FiChevronDown className="text-gray-400" size={20} />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {expandedSkills[skillName] && (
                      <div className="border-t border-white/10">
                        {assignments.map((assignment, index) => (
                          <motion.div
                            key={assignment._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-6 border-b border-white/10 last:border-b-0 hover:bg-white/[0.02] transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-lg font-semibold text-white">{assignment.title}</h4>
                                <p className="text-gray-400 mt-1">{assignment.description}</p>
                                <div className="mt-3 flex items-center gap-4">
                                  <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <FiCalendar size={14} />
                                    <span>{new Date(assignment.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-primary-color">
                                    <FiCheckCircle size={14} />
                                    <span>Weightage: {assignment.weightage}%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mb-12">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-primary-color/10">
                  <FiUser size={24} className="text-primary-color" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Mentees Progress</h2>
                  <p className="text-gray-400 mt-1">Monitor your mentees' progress and achievements</p>
                </div>
              </div>

              <div className="grid gap-4">
                {menteesProgress.map((mentee, index) => (
                  <motion.div
                    key={mentee.learner._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-[#111936] border border-white/10 rounded-xl overflow-hidden hover:border-primary-color/50 transition-colors"
                  >
                    <div className="p-6">
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full bg-primary-color/20 flex items-center justify-center">
                            <span className="text-2xl font-bold text-primary-color">
                              {mentee.learner.firstName[0]}{mentee.learner.lastName[0]}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white">
                            {mentee.learner.firstName} {mentee.learner.lastName}
                          </h3>
                          <p className="text-gray-400">{mentee.learner.email}</p>
                          <div className="mt-4 space-y-4">
                            <div>
                              <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-gray-400">Overall Progress</span>
                                <span className="text-white font-medium">{mentee.overallProgress}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-white/[0.03] overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                  animate={{ width: `${mentee.overallProgress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                  className="h-full rounded-full bg-gradient-to-r from-primary-color to-blue-500"
                                />
                              </div>
                            </div>
                            {mentee.skills.map(skill => (
                              <div key={skill.name}>
                                <div className="flex items-center justify-between text-sm mb-2">
                                  <span className="text-gray-400">{skill.name}</span>
                                  <span className="text-white font-medium">{skill.progress}%</span>
                                </div>
                                <div className="h-2 rounded-full bg-white/[0.03] overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${skill.progress}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full rounded-full bg-gradient-to-r from-primary-color/70 to-blue-500/70"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-primary-color/10">
                  <FiBook size={24} className="text-primary-color" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Skills Progress</h2>
                  <p className="text-gray-400 mt-1">Manage skills and assignments</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-white/10">
                {renderSkillsTable()}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <CreateAssignmentModal 
        isOpen={isModalOpen}
        onClose={handleModalClose}
        skillName={selectedSkill}
        mentee={selectedMentee}
      />
    </div>
  );
};

export default ProgressTrack;