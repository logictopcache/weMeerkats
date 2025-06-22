import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, BookOpen, Sparkles } from 'lucide-react';
import PropTypes from 'prop-types';
import { fetchMentorProfile } from '../../../services/api/mentorApi';

const StatusCard = ({ skill }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="relative group w-[320px]"
    >
      {/* Ambient Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-color to-blue-500 rounded-2xl opacity-0 group-hover:opacity-15 blur-xl transition-all duration-500" />
      
      {/* Card Container */}
      <div className="relative bg-[#0c1631] backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        {/* Header Section */}
        <div className="relative h-28">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-color/20 via-blue-500/20 to-purple-500/20" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMi01LjM3My0xMi0xMi0xMnptLTExLjk5NyAwYy02LjYyNyAwLTEyIDUuMzczLTEyIDEyczUuMzczIDEyIDEyIDEyIDEyLTUuMzczIDEyLTEyLTUuMzczLTEyLTEyLTEyeiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L2c+PC9zdmc+')] opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c1631] to-transparent" />
        </div>

        {/* Content Section */}
        <div className="px-6 -mt-6 space-y-6 pb-6">
          {/* Skill Title */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-color" />
              <h3 className="font-bold text-xl text-white group-hover:text-primary-color transition-colors">
                {skill}
              </h3>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-3">
            <Link to="/mentor/requests" className="block">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r hover:bg-gradient-to-br from-primary-color/20 to-blue-500/20 backdrop-blur-xl border border-white/10 text-white py-3.5 px-4 rounded-xl transition-all duration-300 hover:border-white/20"
              >
                <Users className="w-4 h-4" />
                <span>View Requests</span>
              </motion.button>
            </Link>
            <Link to="/mentor/progress" className="block">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r hover:bg-gradient-to-br from-primary-color/10 to-blue-500/10 backdrop-blur-xl border border-white/10 text-white py-3.5 px-4 rounded-xl transition-all duration-300 hover:border-white/20"
              >
                <BookOpen className="w-4 h-4" />
                <span>View Assignments</span>
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

StatusCard.propTypes = {
  skill: PropTypes.string.isRequired
};

const MentorshipStatus = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [screenSize, setScreenSize] = useState('md');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [mentorSkills, setMentorSkills] = useState([]);

  useEffect(() => {
    const fetchMentorData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) return;
        
        const response = await fetch(`http://localhost:5274/mentor-availability/${userId}`);
        const data = await response.json();
        
        if (data && data.length > 0) {
          const mentorInfo = data[0];
          setUserName(mentorInfo.fullName);
          setMentorSkills(mentorInfo.skills || []);
        }
      } catch (error) {
        console.error('Error fetching mentor data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentorData();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('sm');
      } else if (width < 1280) {
        setScreenSize('md');
      } else if (width < 1536) {
        setScreenSize('lg');
      } else {
        setScreenSize('xl');
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getCardsToShow = () => {
    switch (screenSize) {
      case 'sm': return 1;
      case 'md': return 2;
      case 'lg': return 3;
      case 'xl': return 4;
      default: return 2;
    }
  };

  const cardsToShow = getCardsToShow();
  const maxIndex = Math.max(0, mentorSkills.length - cardsToShow);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => Math.max(0, prev - 1));
    }
  };

  const handleNext = () => {
    if (currentIndex < maxIndex) {
      setDirection(1);
      setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-[#0A1128] min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-color"></div>
      </div>
    );
  }

  if (mentorSkills.length === 0) {
    return (
      <div className="w-full bg-[#0A1128] min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl text-white mb-2">No Skills Added</h2>
          <p className="text-white/60">Please update your profile to add your skills.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#0A1128]">
      <div className="max-w-[1920px] mx-auto px-4 py-5">
        <div className="my-10 pl-2">
          <h1 className="text-center text-2xl md:text-3xl font-bold text-white">
            Welcome Back,{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
              {userName || 'Mentor'}
            </span>!
          </h1>
          <p className="text-center text-white/60">Manage your mentorship activities</p>
        </div>
        
        <div className="relative w-full">
          <div className="flex flex-col items-center">
            <div className="w-full flex justify-center gap-6 overflow-hidden px-4 md:px-12 mb-4">
              <AnimatePresence mode="wait" initial={false} custom={direction}>
                <motion.div 
                  key={currentIndex}
                  custom={direction}
                  initial={{ opacity: 0, x: direction > 0 ? 200 : -200 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -200 : 200 }}
                  transition={{ 
                    duration: 0.4,
                    ease: [0.4, 0.0, 0.2, 1]
                  }}
                  className="flex gap-6"
                >
                  {mentorSkills
                    .slice(currentIndex, currentIndex + cardsToShow)
                    .map((skill, index) => (
                      <StatusCard key={`${skill}-${index}`} skill={skill} />
                    ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {mentorSkills.length > cardsToShow && (
              <div className="flex items-center gap-4 mb-2">
                <motion.button 
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className={`p-3 bg-white/5 border border-white/10 rounded-full 
                    ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'} 
                    z-10 text-white/60 hover:text-white transition-colors`}
                  whileHover={currentIndex !== 0 ? { scale: 1.1 } : {}}
                  whileTap={currentIndex !== 0 ? { scale: 0.9 } : {}}
                >
                  <FaChevronLeft />
                </motion.button>

                <div className="flex gap-2">
                  {[...Array(maxIndex + 1)].map((_, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => {
                        setDirection(idx > currentIndex ? 1 : -1);
                        setCurrentIndex(idx);
                      }}
                      className={`w-2 h-2 rounded-full transition-all duration-300 
                        ${idx === currentIndex ? 'bg-primary-color w-4' : 'bg-white/20 hover:bg-white/40'}`}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.8 }}
                    />
                  ))}
                </div>

                <motion.button 
                  onClick={handleNext}
                  disabled={currentIndex === maxIndex}
                  className={`p-3 bg-white/5 border border-white/10 rounded-full 
                    ${currentIndex === maxIndex ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'} 
                    z-10 text-white/60 hover:text-white transition-colors`}
                  whileHover={currentIndex !== maxIndex ? { scale: 1.1 } : {}}
                  whileTap={currentIndex !== maxIndex ? { scale: 0.9 } : {}}
                >
                  <FaChevronRight />
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorshipStatus; 