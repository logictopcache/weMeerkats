import { motion } from 'framer-motion';
import { featuresData } from '../../data';

const Features = () => {
  const { resumeScanner, realTimeCommunication, progressTracking } = featuresData;

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  return (
    <div id="features" className="relative bg-[#0A1128] py-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-l from-primary-color to-[#15B89B] rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Title */}
        <motion.div 
          className="text-center mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Powerful <span className="text-primary-color">Features</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover the tools that will transform your mentorship journey
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Resume Scanner Card */}
          <motion.div 
            className="group relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 hover:bg-white/10 transition-all duration-500"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -10 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-primary-color/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
            <div className="relative z-10">
              <div className="h-64 mb-8 overflow-hidden rounded-2xl flex items-center justify-center">
                <motion.img 
                  src="/illustrations/ai-scanner.png"
                  alt="AI Resume Scanner"
                  className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{resumeScanner.title}</h3>
              <p className="text-gray-300">{resumeScanner.description}</p>
            </div>
          </motion.div>

          {/* Real-Time Communication Card */}
          <motion.div 
            className="group relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 hover:bg-white/10 transition-all duration-500"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -10 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-primary-color/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
            <div className="relative z-10">
              <div className="h-64 mb-8 overflow-hidden rounded-2xl flex items-center justify-center">
                <motion.img 
                  src="/illustrations/video-chat.png"
                  alt="Real-Time Communication"
                  className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{realTimeCommunication.title}</h3>
              <p className="text-gray-300">{realTimeCommunication.description}</p>
            </div>
          </motion.div>

          {/* Progress Tracking Card */}
          <motion.div 
            className="group relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 hover:bg-white/10 transition-all duration-500"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ y: -10 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-primary-color/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
            <div className="relative z-10">
              <div className="h-64 mb-8 overflow-hidden rounded-2xl flex items-center justify-center">
                <motion.img 
                  src="/illustrations/analytics.png"
                  alt="Progress Tracking"
                  className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{progressTracking.title}</h3>
              <p className="text-gray-300">{progressTracking.description}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Features;