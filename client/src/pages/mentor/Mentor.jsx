import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { motion } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';
import CreateHeader from "../../components/create/CreateHeader";
import MentorSection from "../../components/create/MentorSection";

const Mentor = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.showSuccessToast) {
      toast.success(location.state.message || 'Email verified successfully! Please complete your profile details.', {
        autoClose: 5000,
        position: 'top-center'
      });
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-[#0A1128] overflow-hidden">
      <ToastContainer />
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 1.5 }}
          className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-to-r from-primary-color/20 to-blue-500/20 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 2 }}
          className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-l from-primary-color/20 to-blue-500/20 rounded-full blur-[100px] translate-y-1/2 translate-x-1/2"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12"
        >
          {/* Content Sections */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/10"
          >
            <CreateHeader />
            <div className="mt-8">
              <MentorSection 
                title="Complete Your Mentor Profile"
                subtitle="Share your expertise and start making an impact in others' lives"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Mentor;
