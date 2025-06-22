import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Avvvatars from 'avvvatars-react';
import logo from "/logo.png";

const CreateHeader = ({ title, subtitle }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any stored tokens/data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Navigate to sign in page
    navigate('/signin');
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img 
            src={logo} 
            alt="WeMeerkats Logo" 
            className="logo w-[180px] md:w-[250px] hover:opacity-90 transition-opacity cursor-pointer" 
            onClick={() => navigate('/')}
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative group focus:outline-none"
          >
            <div className="absolute inset-0 bg-primary-color/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="rounded-full overflow-hidden border-2 border-primary-color/30 hover:border-primary-color transition-colors relative z-10">
              <Avvvatars
                value={localStorage.getItem('email') || 'user@example.com'}
                style="shape"
                size={48}
              />
            </div>
          </button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-48 bg-[#0A1128] border border-white/10 rounded-xl shadow-lg overflow-hidden z-50"
              >
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-white/90 hover:bg-white/[0.03] transition-colors flex items-center gap-2"
                >
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {(title || subtitle) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default CreateHeader;
