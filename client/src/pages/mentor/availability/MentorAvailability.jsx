import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FiClock, FiCalendar, FiArrowLeft, FiSettings, FiSun, FiMoon } from "react-icons/fi";
import MentorHeader from "../../../components/mentor/home/Header";
import Navigation from "../../../components/mentor/home/Navigation";
import { fetchMentorProfile } from "../../../services/api/mentorApi";

const UpdateAvailability = () => {
  const id = localStorage.getItem("userId");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [mentorSkills, setMentorSkills] = useState([]);
  const [editingSlot, setEditingSlot] = useState(null);
  const [activeDay, setActiveDay] = useState('monday');
  const [availability, setAvailability] = useState({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  });

  useEffect(() => {
    if (id) {
      fetchAvailability();
      loadMentorProfile();
    }
  }, [id]);

  const loadMentorProfile = async () => {
    try {
      const profileData = await fetchMentorProfile(id);
      setMentorSkills(profileData.topSkills || []);
    } catch (error) {
      toast.error("Failed to load mentor profile");
      console.error(error);
    }
  };

  const fetchAvailability = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5274/mentor-availability/${id}`
      );

      const availabilityData = Array.isArray(response.data)
        ? response.data[0]?.availability
        : response.data?.availability;

      if (availabilityData && typeof availabilityData === "object") {
        const processedAvailability = Object.keys(availability).reduce(
          (acc, day) => ({
            ...acc,
            [day]: Array.isArray(availabilityData[day])
              ? availabilityData[day]
              : [],
          }),
          {}
        );

        setAvailability(processedAvailability);
      }
    } catch (error) {
      toast.error("Failed to fetch availability");
      console.error(error);
    }
  };

  const handleSlotToggle = (day, time) => {
    setEditingSlot({ day, time });
  };

  const handleSlotUpdate = async (day, time, selectedSkills, duration, isAvailable) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const existingSlot = getSlotDetails(day, time);

      // Only call toggle API if it's an existing slot
      if (existingSlot?.startTime) {
        const toggleResponse = await fetch(
          `http://localhost:5274/mentor/availability/toggle`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              day: day.toLowerCase(),
              startTime: time,
              skill: selectedSkills[0] // Using the first skill as primary
            })
          }
        );

        const toggleData = await toggleResponse.json();

        if (!toggleResponse.ok) {
          throw new Error(toggleData.error || "Failed to toggle availability");
        }
      }

      // Update the local state
      setAvailability((prev) => {
        const daySlots = Array.isArray(prev[day]) ? prev[day] : [];
        const existingSlotIndex = daySlots.findIndex((slot) => slot.startTime === time);

        const newSlot = {
          startTime: time,
          skills: selectedSkills,
          duration: duration,
          isAvailable: isAvailable
        };

        if (existingSlotIndex !== -1) {
          const updatedSlots = [...daySlots];
          updatedSlots[existingSlotIndex] = newSlot;
          return {
            ...prev,
            [day]: updatedSlots,
          };
        } else {
          return {
            ...prev,
            [day]: [...daySlots, newSlot],
          };
        }
      });
      setEditingSlot(null);
      toast.success("Time slot updated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to update time slot");
      console.error(error);
    }
  };

  const handleSlotDelete = (day, time) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: prev[day].filter((slot) => slot.startTime !== time),
    }));
    setEditingSlot(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5274/mentor-availability/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ availability }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update availability");
      }

      const data = await response.json();
      toast.success(data.message || "Availability updated successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to update availability");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  // Available durations for mentoring sessions in minutes
  const durations = [30, 45, 60];

  const timeSlots = [
    { time: "09:00", label: "9:00 AM", period: "morning" },
    { time: "10:00", label: "10:00 AM", period: "morning" },
    { time: "11:00", label: "11:00 AM", period: "morning" },
    { time: "12:00", label: "12:00 PM", period: "afternoon" },
    { time: "13:00", label: "1:00 PM", period: "afternoon" },
    { time: "14:00", label: "2:00 PM", period: "afternoon" },
    { time: "15:00", label: "3:00 PM", period: "afternoon" },
    { time: "16:00", label: "4:00 PM", period: "afternoon" },
    { time: "17:00", label: "5:00 PM", period: "evening" },
    { time: "18:00", label: "6:00 PM", period: "evening" },
    { time: "19:00", label: "7:00 PM", period: "evening" },
    { time: "20:00", label: "8:00 PM", period: "evening" },
  ];

  const groupedTimeSlots = timeSlots.reduce((acc, slot) => {
    if (!acc[slot.period]) {
      acc[slot.period] = [];
    }
    acc[slot.period].push(slot);
    return acc;
  }, {});

  const getSlotDetails = (day, time) => {
    const daySlots = availability[day];
    return daySlots.find((slot) => slot.startTime === time);
  };

  const SlotEditModal = ({ day, time, onClose }) => {
    const slot = getSlotDetails(day, time) || { skills: [], duration: 60, isAvailable: true };
    const [selectedSkills, setSelectedSkills] = useState(slot.skills || []);
    const [duration, setDuration] = useState(slot.duration || 60);
    const [isAvailable, setIsAvailable] = useState(slot.isAvailable ?? true);

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-[#0c1631] rounded-2xl p-6 w-full max-w-md">
          <h3 className="text-xl font-semibold text-white mb-4">
            Edit Time Slot: {time}
          </h3>
          <div className="space-y-4">
            {slot.startTime && (
              <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-lg">
                <span className="text-white/80">Availability Status</span>
                <button
                  type="button"
                  onClick={() => setIsAvailable(!isAvailable)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isAvailable 
                      ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                      : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                  }`}
                >
                  {isAvailable ? 'Available' : 'Unavailable'}
                </button>
              </div>
            )}

            <div>
              <label className="text-white/80 block mb-2">Your Skills</label>
              {mentorSkills.length === 0 ? (
                <div className="text-white/60 text-sm p-3 bg-white/5 rounded-lg">
                  No skills found in your profile. Please update your profile to add skills.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {mentorSkills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() =>
                        setSelectedSkills((prev) =>
                          prev.includes(skill)
                            ? prev.filter((s) => s !== skill)
                            : [...prev, skill]
                        )
                      }
                      className={`px-3 py-2 rounded-lg text-sm ${
                        selectedSkills.includes(skill)
                          ? "bg-primary-color text-white"
                          : "bg-white/[0.03] text-white/80"
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="text-white/80 block mb-2">Duration (minutes)</label>
              <div className="grid grid-cols-3 gap-2">
                {durations.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      duration === d
                        ? "bg-primary-color text-white"
                        : "bg-white/[0.03] text-white/80"
                    }`}
                  >
                    {d} min
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => handleSlotDelete(day, time)}
                className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"
              >
                Delete
              </button>
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-white/[0.03] text-white/80 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSlotUpdate(day, time, selectedSkills, duration, isAvailable)}
                  className="px-4 py-2 bg-primary-color text-white rounded-lg"
                  disabled={selectedSkills.length === 0}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0A1128]">
      <MentorHeader />
      <Navigation />
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate("/mentor/home")}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>

          <div className="space-y-1 mb-8">
            <h1 className="text-3xl font-bold text-white">Availability Settings</h1>
            <p className="text-white/60">Set your weekly mentoring schedule with skills and duration</p>
          </div>

          <div className="bg-[#0c1631] backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
            {/* Day Tabs */}
            <div className="flex overflow-x-auto border-b border-white/10 scrollbar-hide">
              {days.map((day) => (
                <button
                  key={day.key}
                  onClick={() => setActiveDay(day.key)}
                  className={`flex-none px-6 py-4 text-sm font-medium transition-colors relative ${
                    activeDay === day.key
                      ? 'text-white'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  {day.label}
                  {activeDay === day.key && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-color"
                    />
                  )}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <AnimatePresence mode="wait">
                  <motion.div
                  key={activeDay}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Morning Slots */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <FiSun className="w-5 h-5 text-amber-500" />
                      <h3 className="text-lg font-semibold text-white">Morning</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {groupedTimeSlots.morning.map(({ time, label }) => {
                        const slot = getSlotDetails(activeDay, time);
                        return (
                          <motion.button
                            key={`${activeDay}-${time}`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={() => handleSlotToggle(activeDay, time)}
                            className={`
                              flex flex-col items-center justify-center gap-1 px-4 py-3 rounded-xl
                              transition-all duration-200 border text-sm font-medium
                              ${
                                slot
                                  ? slot.isAvailable
                                    ? "bg-gradient-to-r from-primary-color to-blue-500 text-white border-transparent"
                                    : "bg-red-500/10 text-red-500 border-red-500/20"
                                  : "bg-white/[0.03] border-white/10 text-white/80 hover:bg-white/[0.06]"
                              }
                            `}
                          >
                            <div className="flex items-center gap-2">
                              <FiClock className="w-4 h-4" />
                              <span>{label}</span>
                            </div>
                            {slot && (
                              <>
                                <div className="text-xs opacity-80">{slot.duration}min</div>
                                <div className="text-xs opacity-80 truncate max-w-full">
                                  {slot.skills?.length} skills
                                </div>
                                <div className="text-xs opacity-80">
                                  {slot.isAvailable ? 'Available' : 'Unavailable'}
                                </div>
                              </>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Afternoon Slots */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <FiSun className="w-5 h-5 text-orange-500" />
                      <h3 className="text-lg font-semibold text-white">Afternoon</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {groupedTimeSlots.afternoon.map(({ time, label }) => {
                        const slot = getSlotDetails(activeDay, time);
                        return (
                          <motion.button
                            key={`${activeDay}-${time}`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={() => handleSlotToggle(activeDay, time)}
                            className={`
                              flex flex-col items-center justify-center gap-1 px-4 py-3 rounded-xl
                              transition-all duration-200 border text-sm font-medium
                              ${
                                slot
                                  ? slot.isAvailable
                                    ? "bg-gradient-to-r from-primary-color to-blue-500 text-white border-transparent"
                                    : "bg-red-500/10 text-red-500 border-red-500/20"
                                  : "bg-white/[0.03] border-white/10 text-white/80 hover:bg-white/[0.06]"
                              }
                            `}
                          >
                            <div className="flex items-center gap-2">
                              <FiClock className="w-4 h-4" />
                              <span>{label}</span>
                            </div>
                            {slot && (
                              <>
                                <div className="text-xs opacity-80">{slot.duration}min</div>
                                <div className="text-xs opacity-80 truncate max-w-full">
                                  {slot.skills?.length} skills
                                </div>
                                <div className="text-xs opacity-80">
                                  {slot.isAvailable ? 'Available' : 'Unavailable'}
                                </div>
                              </>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Evening Slots */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <FiMoon className="w-5 h-5 text-blue-400" />
                      <h3 className="text-lg font-semibold text-white">Evening</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {groupedTimeSlots.evening.map(({ time, label }) => {
                        const slot = getSlotDetails(activeDay, time);
                        return (
                          <motion.button
                            key={`${activeDay}-${time}`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={() => handleSlotToggle(activeDay, time)}
                            className={`
                              flex flex-col items-center justify-center gap-1 px-4 py-3 rounded-xl
                              transition-all duration-200 border text-sm font-medium
                              ${
                                slot
                                  ? slot.isAvailable
                                  ? "bg-gradient-to-r from-primary-color to-blue-500 text-white border-transparent"
                                    : "bg-red-500/10 text-red-500 border-red-500/20"
                                  : "bg-white/[0.03] border-white/10 text-white/80 hover:bg-white/[0.06]"
                              }
                            `}
                          >
                            <div className="flex items-center gap-2">
                              <FiClock className="w-4 h-4" />
                              <span>{label}</span>
                            </div>
                            {slot && (
                              <>
                                <div className="text-xs opacity-80">{slot.duration}min</div>
                                <div className="text-xs opacity-80 truncate max-w-full">
                                  {slot.skills?.length} skills
                                </div>
                                <div className="text-xs opacity-80">
                                  {slot.isAvailable ? 'Available' : 'Unavailable'}
                                </div>
                              </>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                    </div>
                  </motion.div>
              </AnimatePresence>

              <div className="flex justify-end pt-6 mt-8 border-t border-white/10">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-primary-color to-blue-500 text-white rounded-xl font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    "Update Availability"
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
      
      {editingSlot && (
        <SlotEditModal
          day={editingSlot.day}
          time={editingSlot.time}
          onClose={() => setEditingSlot(null)}
        />
      )}
    </div>
  );
};

export default UpdateAvailability;
