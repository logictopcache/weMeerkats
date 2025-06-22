import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const Counter = ({ value, prefix }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setCount(Math.round((value * currentStep) / steps));
      
      if (currentStep === steps) {
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className="text-2xl sm:text-3xl font-bold text-primary-color">
      {count}{prefix}
    </span>
  );
};

const Hero = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A1128]">
      {/* Abstract Shapes Background */}
      <div className="absolute inset-0 overflow-hidden">
        <svg 
          className="absolute w-full h-full md:ml-[-20%] transform scale-y-[1.2] md:scale-y-100" 
          viewBox="0 0 1200 800" 
          preserveAspectRatio="xMidYMid slice"
        >
          <motion.path
            d="M 0 300 Q 300 150 600 300 T 1200 300 V 800 H 0 Z"
            fill="url(#gradient1)"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 0.6, y: 0 }}
            transition={{ duration: 1.5 }}
          />
          <motion.path
            d="M 0 400 Q 300 250 600 400 T 1200 400 V 800 H 0 Z"
            fill="url(#gradient2)"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 0.4, y: 0 }}
            transition={{ duration: 2 }}
          />
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#119D84', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: '#0A1128', stopOpacity: 0.4 }} />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#119D84', stopOpacity: 0.6 }} />
              <stop offset="100%" style={{ stopColor: '#0A1128', stopOpacity: 0.2 }} />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-12 md:pb-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-16 items-center">
          {/* Left Content Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6 md:space-y-8"
          >
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight text-white max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Empowering Growth Through{" "}
              <span className="text-primary-color">Mentorship</span>
            </motion.h1>

            <motion.p 
              className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Connect with industry experts, accelerate your career growth, and unlock your full potential through personalized mentorship experiences.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-6 sm:pt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <Link to="/signup" className="w-full sm:w-auto">
                <motion.button 
                  className="relative group w-full sm:w-auto"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-color to-blue-600 rounded-lg opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="relative px-8 py-4 bg-primary-color bg-opacity-40 rounded-lg group-hover:bg-opacity-0 transition-all">
                    <span className="text-white font-medium text-lg">Start Your Journey</span>
                  </div>
                </motion.button>
              </Link>
              {/* <Link to="/about" className="w-full sm:w-auto">
                <motion.button 
                  className="relative group w-full sm:w-auto"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-color/20 to-blue-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative px-8 py-4 bg-white/[0.03] border border-white/10 rounded-lg text-white group-hover:bg-white/[0.06] transition-all">
                    <span className="font-medium text-lg">Learn More</span>
                  </div>
                </motion.button>
              </Link> */}
            </motion.div>

            {/* Stats Section */}
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-8 pt-8 sm:pt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <AnimatePresence>
                {[
                  { number: 500, label: "Active Mentors", prefix: "+" },
                  { number: 1000, label: "Success Stories", prefix: "+" },
                  { number: 50, label: "Industries", prefix: "+" }
                ].map((stat, index) => (
                  <motion.div 
                    key={index} 
                    className="text-center p-3 sm:p-4 bg-white/5 backdrop-blur-sm rounded-xl"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ 
                        duration: 0.8,
                        delay: 0.1 * index,
                        ease: "easeOut"
                      }}
                    >
                      <Counter value={stat.number} prefix={stat.prefix} />
                      <motion.p 
                        className="text-sm sm:text-base text-gray-300"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ 
                          duration: 0.5,
                          delay: 0.3 * index
                        }}
                      >
                        {stat.label}
                      </motion.p>
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Right Image Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative mt-8 lg:mt-0"
          >
            <div className="relative">
              <motion.div 
                className="relative z-10 overflow-visible"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <motion.img 
                  src="/LandingPage/3d-rocket.png"
                  alt="3D Rocket Illustration" 
                  className="w-full h-auto"
                  animate={{
                    y: [0, -20, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
              
              {/* Floating Elements */}
              <motion.div 
                className="absolute top-4 right-4 bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-xl shadow-lg hidden sm:flex z-20"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500 animate-pulse"></div>
                  <p className="text-xs sm:text-sm font-medium text-white">500+ Online Mentors</p>
                </div>
              </motion.div>

              <motion.div 
                className="absolute bottom-40 left-4 bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-xl shadow-lg hidden sm:flex z-20"
                animate={{
                  y: [0, 10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-primary-color animate-pulse"></div>
                  <p className="text-xs sm:text-sm font-medium text-white">24/7 Support Available</p>
                </div>
              </motion.div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -z-10 w-full h-full top-0 right-0">
              <motion.div 
                className="absolute top-1/4 right-1/4 w-24 sm:w-32 h-24 sm:h-32 bg-primary-color/20 rounded-full blur-2xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Hero;