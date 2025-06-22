import React from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';

const ProgressSummary = ({ learningPath }) => {
  if (!learningPath) return null;

  const totalSkills = learningPath.selectedSkills.length;
  const completedSkills = learningPath.selectedSkills.filter(skill => skill.progress === 100).length;
  const averageProgress = learningPath.selectedSkills.reduce((acc, skill) => acc + skill.progress, 0) / totalSkills;

  const stats = [
    {
      icon: FiAward,
      label: 'Total Skills',
      value: totalSkills,
      color: 'text-blue-400'
    },
    {
      icon: FiCheckCircle,
      label: 'Completed',
      value: completedSkills,
      color: 'text-green-400'
    },
    {
      icon: FiTrendingUp,
      label: 'Avg. Progress',
      value: `${Math.round(averageProgress)}%`,
      color: 'text-primary-color'
    }
  ];

  // Calculate the circumference of the progress circle
  const size = 160; // SVG size
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (learningPath.completedProgress / 100) * circumference;
  const center = size / 2;

  return (
    <div className="mb-12">
      {/* Progress Circle */}
      <div className="flex justify-center mb-8">
        <div className="relative w-40 h-40">
          <svg 
            className="transform -rotate-90 w-full h-full" 
            viewBox={`0 0 ${size} ${size}`}
          >
            {/* Background circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={progressOffset}
              strokeLinecap="round"
              fill="none"
              className="text-primary-color transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span className="text-3xl font-bold text-white">{learningPath.completedProgress}%</span>
              <span className="block text-sm text-gray-400 mt-1">Overall Progress</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#111936] border border-primary-color/20 rounded-xl p-6"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg bg-white/5 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-white text-xl font-semibold mt-1">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProgressSummary; 