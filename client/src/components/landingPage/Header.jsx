import logo from "/logo.png";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const LandingHeader = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-[#0A1128]/80 backdrop-blur-md z-50">
      <div className="flex justify-between items-center max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link to="/">
          <img 
            src={logo} 
            alt="WeMeerkats" 
            className="w-[150px] md:w-[180px] hover:opacity-90 transition-opacity" 
          />
        </Link>
        
        <div className="flex items-center gap-6">
          <Link 
            to="/signup" 
            className="hidden md:block text-gray-200 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary-color hover:after:w-full after:transition-all after:duration-300"
          >
            Get Started
          </Link>
          <Link to="/signin">
            <motion.button 
              className="relative group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-color to-blue-600 rounded-lg opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="relative px-6 py-2 bg-primary-color bg-opacity-40 rounded-lg group-hover:bg-opacity-0 transition-all">
                <span className="text-white font-medium">Sign in</span>
              </div>
            </motion.button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;
