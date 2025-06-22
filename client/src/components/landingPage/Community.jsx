import { motion } from 'framer-motion';
import { testimonialData } from '../../data';
import { Link } from 'react-router-dom';

const Community = () => {
  const { testimonials, cta } = testimonialData;

  return (
    <div id="community" className="relative bg-[#0A1128] py-20 overflow-hidden">
   

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.h2 
          className="text-4xl md:text-5xl font-bold text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-white">What Our </span>
          <span className="text-primary-color">Community</span>
          <span className="text-white"> Says</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl hover:bg-white/10 transition-all duration-300 h-full">
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary-color/20 rounded-full blur-md"></div>
                    <img 
                      src={testimonial.avatar} 
                      alt={`${testimonial.type} avatar`}
                      className="w-12 h-12 rounded-full relative z-10 object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{testimonial.type}</h3>
                    <p className="text-gray-400 text-sm">@{testimonial.type.toLowerCase().replace(' ', '')}</p>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">{testimonial.text}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="relative overflow-hidden bg-white/5 backdrop-blur-xl p-12 rounded-3xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-color/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#15B89B]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-5xl text-center font-bold mb-6">
                <span className="text-white">Ready to </span>
                <span className="text-primary-color">Level Up</span>
                <span className="text-white"> Your Career?</span>
              </h3>
              <p className="text-xl text-center text-gray-300 mb-8 max-w-2xl mx-auto">
                Join our community of mentors and mentees. Start your journey towards professional growth and success today.
              </p>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-4 sm:px-0"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link to="/signup" className="w-full sm:w-auto">
                <motion.button 
                  className="relative group w-full sm:w-auto"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-color to-blue-600 rounded-lg opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="relative px-8 py-4 bg-primary-color bg-opacity-40 rounded-lg group-hover:bg-opacity-0 transition-all">
                    <span className="text-white font-medium text-lg">Get Started Now</span>
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

            <motion.div
              className="mt-8 flex items-center justify-center gap-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-color" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-300 whitespace-nowrap">Free to Join</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-color" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-300 whitespace-nowrap">Expert Mentors</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-color" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-300 whitespace-nowrap">Grow Together</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Community;