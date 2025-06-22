import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, Loader } from 'lucide-react';
import Navigation from "../../../components/mentee/home/Navigation";
import MenteeHeader from "../../../components/mentee/home/Header";
// import Footer from "../../../components/landingPage/Footer";
import MentorCard from '../../../components/mentee/search/MentorCard';
import { searchMentors } from '../../../services/api/mentorApi';

const Search_Mentors = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (query) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await searchMentors(query);
      console.log('Search response:', response);
      if (response) {
        setMentors(response);
        setSearchParams({ query });
      } else {
        setMentors([]);
        setError('No mentors found');
      }
    } catch (error) {
      setError('Failed to search mentors. Please try again.');
      console.error('Search error:', error);
      setMentors([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle URL query parameter
  useEffect(() => {
    const query = searchParams.get('query');
    if (query) {
      setSearchQuery(query);
      handleSearch(query);
    }
  }, [searchParams]);

  // Handle local search input
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim()) {
      handleSearch(value);
    } else {
      setMentors([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1128]">
      <MenteeHeader />
      <Navigation />
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Hero Section */}
          <div className="text-center space-y-4 mb-12">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Find Your Perfect <span className="text-primary-color">Mentor</span>
            </motion.h1>
            <motion.p 
              className="text-gray-400 text-lg max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Connect with experienced professionals who can guide you through your learning journey
            </motion.p>
          </div>

          {/* Search Section */}
          <motion.div 
            className="max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-color/20 to-blue-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleInputChange}
                  placeholder="Search mentors by name, specialty, or skills..."
                  className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-lg focus:outline-none focus:border-primary-color text-white placeholder-gray-400 transition-all pr-12"
                />
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </motion.div>

          {/* Results Section */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <Loader className="w-8 h-8 text-primary-color animate-spin mb-4" />
                <p className="text-gray-400">Searching for mentors...</p>
              </motion.div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-red-400 text-center p-4 bg-red-500/10 rounded-lg max-w-md mx-auto"
              >
                {error}
              </motion.div>
            ) : (
              <>
                {searchQuery && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-between mb-8"
                  >
                    <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
                      <Users className="text-primary-color" />
                      Results for "{searchQuery}"
                    </h2>
                    <span className="text-gray-400">
                      {mentors.length} {mentors.length === 1 ? 'mentor' : 'mentors'} found
                    </span>
                  </motion.div>
                )}

                {mentors.length > 0 ? (
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {mentors.map((mentor, index) => (
                      <motion.div
                        key={mentor._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <MentorCard 
                          mentor={{
                            _id: mentor.id,
                            id: mentor.id,
                            name: mentor.name,
                            specialty: mentor.specialty || 'Development',
                            skills: mentor.skills || [],
                            image: "/3d_teacher.jpg",
                            rating: 4,
                            verified: mentor.isVerified,
                            bio: mentor.bio
                          }} 
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : searchQuery && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Mentors Found</h3>
                    <p className="text-gray-400">
                      Try adjusting your search terms or browse our featured mentors
                    </p>
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default Search_Mentors;