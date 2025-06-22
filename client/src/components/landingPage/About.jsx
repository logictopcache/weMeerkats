import { motion } from 'framer-motion';
import { useState } from 'react';

const About = () => {
  const [items, setItems] = useState([
    {
      id: 1,
      type: 'mission',
      content: (
        <div className="bg-white/[0.02] backdrop-blur-xl p-8 rounded-3xl border border-white/[0.05] hover:bg-white/[0.04] transition-all duration-300 h-full">
          <h3 className="inline-flex items-center text-2xl font-bold text-white mb-4">
            <span className="mr-3 w-8 h-8 flex items-center justify-center rounded-lg bg-primary-color text-white text-lg">M</span>
            Our Mission
          </h3>
          <p className="text-gray-300 leading-relaxed text-lg pl-11">
            At MeerKats, we believe in the power of mentorship to transform careers and lives. Our platform connects aspiring professionals with experienced mentors who can guide them through their professional journey, fostering growth and success through meaningful relationships.
          </p>
        </div>
      )
    },
    {
      id: 2,
      type: 'vision',
      content: (
        <div className="bg-white/[0.02] backdrop-blur-xl p-8 rounded-3xl border border-white/[0.05] hover:bg-white/[0.04] transition-all duration-300 h-full">
          <h3 className="inline-flex items-center text-2xl font-bold text-white mb-4">
            <span className="mr-3 w-8 h-8 flex items-center justify-center rounded-lg bg-primary-color text-white text-lg">V</span>
            Our Vision
          </h3>
          <p className="text-gray-300 leading-relaxed text-lg pl-11">
            We envision a world where everyone has access to quality mentorship, breaking down barriers to professional growth and creating opportunities for meaningful connections that drive success. Our platform is designed to make this vision a reality.
          </p>
        </div>
      )
    },
    {
      id: 3,
      type: 'mentees',
      content: (
        <div className="bg-primary-color/10 backdrop-blur-xl p-8 rounded-3xl border border-primary-color/20 h-full">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-4xl font-bold text-white">2000+</h4>
            <span className="text-primary-color font-medium">Active Mentees</span>
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="w-[80%] h-full bg-primary-color"></div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      type: 'mentors',
      content: (
        <div className="bg-white/[0.02] backdrop-blur-xl p-6 rounded-2xl border border-white/[0.05] hover:bg-white/[0.04] transition-all duration-300 h-full">
          <p className="text-gray-400 text-sm mb-1">Active Mentors</p>
          <h4 className="text-3xl font-bold text-white">500+</h4>
        </div>
      )
    }
  ]);

  const handleDragEnd = (event, info, itemId) => {
    const draggedItem = items.find(item => item.id === itemId);
    if (!draggedItem) return;

    const mousePosition = { x: info.point.x, y: info.point.y };
    const droppedOnItem = items.find((item, index) => {
      const element = document.getElementById(`item-${item.id}`);
      if (!element) return false;
      const rect = element.getBoundingClientRect();
      return (
        mousePosition.x >= rect.left &&
        mousePosition.x <= rect.right &&
        mousePosition.y >= rect.top &&
        mousePosition.y <= rect.bottom &&
        item.id !== itemId
      );
    });

    if (droppedOnItem) {
      const newItems = [...items];
      const draggedIndex = items.findIndex(item => item.id === itemId);
      const droppedIndex = items.findIndex(item => item.id === droppedOnItem.id);
      
      // Swap the items
      [newItems[draggedIndex], newItems[droppedIndex]] = [newItems[droppedIndex], newItems[draggedIndex]];
      setItems(newItems);
    }
  };

  return (
    <div id="about" className="relative bg-[#0A1128] min-h-screen flex items-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-l from-primary-color to-[#15B89B] rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            About <span className="text-primary-color">MeerKats</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Transforming professional growth through meaningful mentorship connections
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {items.map((item) => (
            <motion.div
              key={item.id}
              id={`item-${item.id}`}
              className="cursor-move"
              drag
              dragSnapToOrigin
              dragElastic={0.3}
              whileHover={{ scale: 1.02 }}
              whileDrag={{
                scale: 1.05,
                zIndex: 50,
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
              }}
              onDragEnd={(e, info) => handleDragEnd(e, info, item.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                layout: { duration: 0.3 },
                opacity: { duration: 0.3 }
              }}
            >
              {item.content}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About; 