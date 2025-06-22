import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { FiHome, FiUsers, FiCalendar, FiTrendingUp, FiClock } from "react-icons/fi";

const Navigation = () => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);

  const navItems = [
    { path: "/mentor/home", icon: FiHome, label: "Home" },
    { path: "/mentor/requests", icon: FiUsers, label: "Meeting Requests" },
    { path: "/mentor/calendar", icon: FiCalendar, label: "Appointment Calendar" },
    { path: "/mentor/progress", icon: FiTrendingUp, label: "Progress Tracking" },
    { path: "/mentor/availability", icon: FiClock, label: "Availability" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#0A1128] border-b border-white/10 sticky top-0 z-40"
    >
      <div className="max-w-[1200px] mx-auto">
        <nav className="flex items-center justify-between sm:justify-start p-4">
          <div className="flex items-center justify-start w-full max-w-2xl mx-auto sm:mx-0 sm:justify-start gap-1 sm:gap-2 md:gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onMouseEnter={() => setHoveredItem(item.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="relative group flex-1 sm:flex-none"
                >
                  <motion.div
                    className={`flex items-center justify-center sm:justify-start gap-2 px-2 sm:px-4 py-2 rounded-xl transition-colors ${
                      active
                        ? "text-primary-color"
                        : "text-white/60 hover:text-white"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon size={20} />
                    <span className="hidden sm:block text-sm font-medium">
                      {item.label}
                    </span>
                    
                    {active && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute inset-0 bg-white/[0.03] border border-primary-color/20 rounded-xl -z-10"
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30
                        }}
                      />
                    )}
                  </motion.div>

                  {hoveredItem === item.path && !active && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute left-1/2 -bottom-8 transform -translate-x-1/2 px-2 py-1 bg-[#1A2138] text-white text-xs rounded whitespace-nowrap border border-white/10 z-50"
                    >
                      {item.label}
                    </motion.div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </motion.div>
  );
};

export default Navigation;
