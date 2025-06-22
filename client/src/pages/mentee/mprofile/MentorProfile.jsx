import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MessageCircle, Star, Clock, Briefcase, Code, ThumbsUp, CheckCircle2, AlertCircle, User } from 'lucide-react';
import Navigation from "../../../components/mentee/home/Navigation";
import MenteeHeader from "../../../components/mentee/home/Header";
// import Footer from "../../../components/landingPage/Footer";
import { fetchMentorProfile } from "../../../services/api/mentorApi";
import { createMenteeConversation } from '../../../services/api/menteeApi';
import { toast } from 'react-hot-toast';
import { fetchMenteeConversations } from '../../../services/api/menteeApi';
import ProfileAvatar from "../../../components/ProfileAvatar";

const staticMentorData = {
  name: "Devin Mia",
  image: "/image2.png",
  role: "Web Developer",
  bio: "Mentoring as a web developer since 3 years. I have done my as senior web developers in different software houses",
  topSkills: ["HTML", "CSS", "Java", "React", "Node Js"],
  experience: [
    {
      position: "Assistant Professor",
      company: "Comsats University, Islamabad",
      period: "2015 - 2020",
    },
    {
      position: "Senior Web Developer",
      company: "Softech Software House, Lahore",
      period: "2020 - 2022",
    },
  ],
  availability: {},
  rating: 4,
};

const MentorProfile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mentorData, setMentorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const getMentorProfile = async () => {
      const mentorId = searchParams.get("id");
      if (!mentorId) {
        setLoading(false);
        return;
      }

      try {
        const data = await fetchMentorProfile(mentorId);
        if (data) {
          console.log(data);
          // Map the data to match our component's structure
          setMentorData({
            ...data,
            fullName: data.name,
            expertise: data.role,
            skills: data.topSkills || [],
            workExperiences: data.experience?.map(exp => ({
              title: exp.position,
              companyName: exp.company,
              duration: exp.period,
              description: ''
            })) || [],
            education: [],
            availability: data.availability || {
              monday: [],
              tuesday: [],
              wednesday: [],
              thursday: [],
              friday: [],
              saturday: [],
              sunday: []
            }
          });
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Failed to load mentor profile");
      } finally {
        setLoading(false);
      }
    };

    getMentorProfile();
  }, [searchParams]);

  const handleChatNow = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const mentorId = searchParams.get("id");
      
      if (!mentorId) {
        console.error('No mentor ID found');
        return;
      }

      const conversations = await fetchMenteeConversations(userId);
      const existingConversation = conversations.find(
        conv => conv.mentorId._id === mentorId
      );

      if (existingConversation) {
        navigate('/mentee/messages', {
          state: { 
            conversationId: existingConversation._id, 
            selectedMentorId: mentorId 
          }
        });
      } else {
        const result = await createMenteeConversation(mentorId, userId);
        if (result.conv) {
          navigate('/mentee/messages', {
            state: { 
              conversationId: result.conv._id, 
              selectedMentorId: mentorId 
            }
          });
        }
      }
    } catch (error) {
      console.error('Error handling conversation:', error);
      toast.error('Failed to start chat');
    }
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

  if (!mentorData) {
    return (
      <div className="min-h-screen bg-[#0A1128]">
        <MenteeHeader />
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-white text-xl">Mentor not found</div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'availability', label: 'Availability', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-[#0A1128]">
      <MenteeHeader />
      <Navigation />
      
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-color/20 to-blue-500/20 opacity-30" />
          
          <div className="relative p-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Profile Image with Verification Badge */}
              <div className="flex-shrink-0">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary-color to-blue-500 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-300" />
                  <div className="relative">
                    <ProfileAvatar
                      name={mentorData?.fullName}
                      email={mentorData?.email}
                    
                      size="lg"
                      style="shape"
                      className="w-44 h-44"
                    />
                    {mentorData?.isVerified ? (
                      <div className="absolute -bottom-2 -right-2 bg-primary-color rounded-full p-1.5 border-2 border-[#0A1128]">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className="absolute -bottom-2 -right-2 bg-yellow-500/90 rounded-full p-1.5 border-2 border-[#0A1128]">
                        <AlertCircle className="w-5 h-5 text-black" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">{mentorData?.fullName || mentorData?.name}</h1>
                  {mentorData?.isVerified ? (
                    <span className="px-3 py-1 bg-primary-color/10 border border-primary-color/20 rounded-full text-xs text-primary-color">
                      Verified Mentor
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-xs text-yellow-500">
                      Verification Pending
                    </span>
                  )}
                </div>
                <p className="text-primary-color text-lg mb-4">{mentorData?.expertise || mentorData?.role}</p>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        className={`w-5 h-5 ${
                          index < (mentorData?.rating || 5)
                            ? "fill-primary-color text-primary-color" 
                            : "text-white/20"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-white/60">|</span>
                  <span className="text-white/80">
                    <Clock className="w-4 h-4 inline mr-2" />
                    {mentorData?.certification || 'Available for Sessions'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  {(mentorData?.skills || mentorData?.topSkills || []).map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-sm text-white/80"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 min-w-[200px]">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleChatNow}
                  disabled={!mentorData?.isVerified}
                  className={`w-full flex items-center justify-center gap-2 ${
                    mentorData?.isVerified
                      ? "bg-gradient-to-r from-primary-color to-primary-color/80 text-white hover:from-primary-color/90 hover:to-primary-color/70"
                      : "bg-white/5 text-white/30 cursor-not-allowed"
                  } py-3 px-6 rounded-xl transition-all duration-300`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{mentorData?.isVerified ? "Start Chat" : "Verification Pending"}</span>
                </motion.button>

                <Link 
                  to={mentorData?.isVerified ? `/mentee/book?id=${searchParams.get("id")}` : "#"}
                  className={`w-full ${!mentorData?.isVerified && 'pointer-events-none'}`}
                >
                  <motion.button
                    whileHover={{ scale: mentorData?.isVerified ? 1.02 : 1 }}
                    whileTap={{ scale: mentorData?.isVerified ? 0.98 : 1 }}
                    className={`w-full flex items-center justify-center gap-2 ${
                      mentorData?.isVerified
                        ? "bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 text-white"
                        : "bg-white/5 text-white/30 cursor-not-allowed border border-white/10"
                    } py-3 px-6 rounded-xl transition-all duration-300`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>{mentorData?.isVerified ? "Book Session" : "Booking Unavailable"}</span>
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs Navigation */}
        <div className="flex gap-4 mb-8 border-b border-white/10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-primary-color'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-color"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {activeTab === 'overview' && (
            <>
              {/* Bio Section */}
              <div className="md:col-span-2 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">About</h2>
                <p className="text-white/80 leading-relaxed">{mentorData?.bio || 'No bio available'}</p>
              </div>

              {/* Skills Section */}
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {(mentorData?.skills || mentorData?.topSkills || []).map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-sm text-white/80"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'experience' && (
            <div className="md:col-span-3 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Professional Experience
              </h2>
              <div className="space-y-6">
                {(mentorData?.workExperiences || mentorData?.experience || []).length > 0 ? (
                  (mentorData?.workExperiences || mentorData?.experience).map((exp, index) => (
                    <div
                      key={index}
                      className="relative pl-6 pb-6 border-l border-white/10 last:pb-0"
                    >
                      <div className="absolute left-0 top-2 w-2 h-2 rounded-full bg-primary-color transform -translate-x-[5px]" />
                      <h3 className="text-lg font-medium text-white">{exp.title || exp.position}</h3>
                      <p className="text-primary-color/90">{exp.companyName || exp.company}</p>
                      <p className="text-sm text-white/60 mt-1">{exp.duration || exp.period}</p>
                      {exp.description && <p className="text-white/70 mt-2">{exp.description}</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-white/40 text-center py-4">No experience information available</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'availability' && (
            <div className="md:col-span-3 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Weekly Availability
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(mentorData?.availability || {})
                  .filter(([key]) => key !== "_id")
                  .map(([day, slots]) => (
                    <div key={day} className="bg-white/5 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-white capitalize mb-3">{day}</h3>
                      {slots?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {slots
                            .filter((slot) => slot.isAvailable)
                            .sort((a, b) => a.startTime.localeCompare(b.startTime))
                            .map((slot) => (
                              <span
                                key={slot._id}
                                className="px-3 py-1 bg-primary-color/10 border border-primary-color/20 rounded-full text-sm text-primary-color"
                              >
                                {slot.startTime}
                              </span>
                            ))}
                        </div>
                      ) : (
                        <p className="text-white/40 text-sm">No available slots</p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default MentorProfile;
