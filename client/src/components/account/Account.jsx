/* eslint-disable react/prop-types */
import { motion } from "framer-motion";

const Account = ({
  greet,
  greet_text,
  btn,
  acc_heading,
  acc_subheading,
  form,
}) => {
  return (
    <div className="min-h-screen bg-[#0A1128] overflow-hidden relative flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-color/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Main content container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-[1200px] mx-auto"
      >
        <div className="grid lg:grid-cols-[1fr,1.5fr] gap-8 items-center">
          {/* Left side - Welcome message */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative"
          >
            <div className="lg:sticky lg:top-8 space-y-8 text-center lg:text-left p-8 lg:p-0">
              <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white to-gray-400 text-transparent bg-clip-text">
                {greet}
              </h1>
              <p className="text-gray-400 text-lg lg:text-xl leading-relaxed">
                {greet_text}
              </p>
              <div className="flex justify-center lg:justify-start space-x-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button className="group relative px-8 py-3 bg-gradient-to-r from-primary-color to-primary-color/80 rounded-xl overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                    <span className="relative text-white font-medium text-lg">
                      {btn}
                    </span>
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Right side - Form container */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="p-8 lg:p-12">
              <div className="max-w-md mx-auto">
                <div className="space-y-4 text-center mb-10">
                  <h2 className="text-3xl lg:text-4xl font-bold text-white">
                    {acc_heading}
                  </h2>
                  {acc_subheading && (
                    <p className="text-gray-400">
                      {acc_subheading}
                    </p>
                  )}
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  {form}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Account;
