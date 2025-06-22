import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCheck, FiClock, FiLock } from 'react-icons/fi';
import { fetchSkillAssignments, completeAssignment } from '../../../services/api/progressTrackingService';
import { toast } from 'react-hot-toast';
import MenteeHeader from '../../../components/mentee/home/Header';
import Navigation from '../../../components/mentee/home/Navigation';

const SkillDetails = () => {
  const { skillName } = useParams();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [skillProgress, setSkillProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        setLoading(true);
        const data = await fetchSkillAssignments(skillName);
        setAssignments(data.assignments);
        setSkillProgress(data.progress);
        setError(null);
      } catch (err) {
        setError('Failed to load assignments. Please try again later.');
        toast.error('Failed to load assignments');
      } finally {
        setLoading(false);
      }
    };

    loadAssignments();
  }, [skillName]);

  const handleCompleteAssignment = async (assignmentId) => {
    try {
      await completeAssignment(assignmentId);
      // Update the local assignments state to reflect completion
      setAssignments(prevAssignments =>
        prevAssignments.map(assignment =>
          assignment._id === assignmentId
            ? { ...assignment, status: 'completed' }
            : assignment
        )
      );
      toast.success('Assignment completed successfully!');
    } catch (err) {
      toast.error('Failed to complete assignment');
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
          <div className="flex items-center gap-4 mb-8">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-primary-color/10 border border-primary-color/20 text-primary-color hover:bg-primary-color/20 transition-colors"
            >
              <FiArrowLeft size={20} />
            </motion.button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{skillName}</h1>
              <div className="flex items-center gap-4">
                <p className="text-gray-400">Complete assignments to track your progress</p>
                <span className="text-primary-color font-medium">{skillProgress}% Complete</span>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            {assignments.map((assignment, index) => (
              <motion.div
                key={assignment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-[#111936] border ${
                  assignment.status === 'completed'
                    ? 'border-green-500/50 bg-green-500/5'
                    : assignment.locked
                    ? 'border-gray-700/50 bg-gray-900/50'
                    : 'border-primary-color/20'
                } rounded-xl p-6`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {assignment.title}
                    </h3>
                    <p className="text-gray-400 mb-4">{assignment.description}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-400 flex items-center gap-2">
                        <FiClock size={16} />
                        Weightage: {assignment.weightage}%
                      </span>
                      {assignment.status === 'completed' && (
                        <span className="text-sm text-green-500 flex items-center gap-2">
                          <FiCheck size={16} />
                          Completed
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-sm text-gray-400">
                      Created by: {assignment.createdBy.firstName} {assignment.createdBy.lastName}
                    </div>
                  </div>
                  {!assignment.locked ? (
                    assignment.status === 'completed' ? (
                      <div className="px-4 py-2 rounded-lg bg-green-500/20 text-green-500 flex items-center gap-2">
                        <FiCheck size={16} />
                        Completed
                      </div>
                    ) : (
                      <button
                        onClick={() => handleCompleteAssignment(assignment._id)}
                        className="px-4 py-2 rounded-lg bg-primary-color text-white hover:bg-primary-color/80 transition-colors"
                      >
                        Mark as Complete
                      </button>
                    )
                  ) : (
                    <div className="flex items-center gap-2 text-gray-500">
                      <FiLock size={16} />
                      <span>Locked</span>
                    </div>
                  )}
                </div>
                {assignment.prerequisites && assignment.prerequisites.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-sm text-gray-400 mb-2">Prerequisites:</p>
                    <div className="flex flex-wrap gap-2">
                      {assignment.prerequisites.map((prereq) => (
                        <span
                          key={prereq}
                          className="px-3 py-1 rounded-full bg-gray-800 text-gray-400 text-sm"
                        >
                          {prereq}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SkillDetails; 