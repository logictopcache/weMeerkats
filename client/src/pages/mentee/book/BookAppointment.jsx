import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Calendar.css";
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  Loader2,
  Star,
} from "lucide-react";
import Navigation from "../../../components/mentee/home/Navigation";
import MenteeHeader from "../../../components/mentee/home/Header";
import { toast } from "react-hot-toast";
import { API_ENDPOINTS } from "../../../services/api/config";

const BookAppointment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [mentorData, setMentorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [date, setDate] = useState(new Date());
  const [error, setError] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    const getMentorData = async () => {
      const mentorId = searchParams.get("id");
      if (!mentorId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch mentor profile data (same as profile page)
        const profileResponse = await fetch(
          `${API_ENDPOINTS.BASE_URL}/mentor-profile/${mentorId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!profileResponse.ok) {
          throw new Error("Failed to fetch mentor profile");
        }

        const profileData = await profileResponse.json();

        // Fetch mentor availability data
        const availabilityResponse = await fetch(
          `http://localhost:5274/mentor-availability/${mentorId}`
        );
        const availabilityData = await availabilityResponse.json();

        if (profileData) {
          setMentorData({
            name:
              profileData.fullName ||
              `${profileData.firstName} ${profileData.lastName}`,
            image: profileData.profilePictureUrl
              ? `${API_ENDPOINTS.BASE_URL}/uploads/${profileData.profilePictureUrl}`
              : "/media.png",
            role: profileData.expertise || "Mentor",
            bio: profileData.bio || "",
            topSkills: profileData.skills || [],
            isVerified: profileData.isVerified || false,
            availability: availabilityData?.[0]?.availability || {},
          });

          // Set the first skill as default if available
          if (profileData.skills?.length > 0) {
            setSelectedSkill(profileData.skills[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch mentor data");
      } finally {
        setLoading(false);
      }
    };

    getMentorData();
  }, [searchParams]);

  // Update available slots when date or skill changes
  useEffect(() => {
    if (!mentorData?.availability || !selectedSkill) {
      setAvailableSlots([]);
      return;
    }

    const dayName = getDayName(date);
    const daySlots = mentorData.availability[dayName] || [];

    // Filter slots by selected skill AND availability
    const filteredSlots = daySlots
      .filter(
        (slot) =>
          slot.skills.includes(selectedSkill) && slot.isAvailable !== false
      )
      .map((slot) => ({
        startTime: slot.startTime,
        duration: slot.duration || 60,
        skills: slot.skills,
      }))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    setAvailableSlots(filteredSlots);
  }, [date, selectedSkill, mentorData]);

  const handleDateChange = (newDate) => {
    setDate(newDate);
    setSelectedTime(null);
  };

  const handleBookAppointment = async () => {
    if (!selectedTime || !date || !mentorData || !selectedSkill) {
      toast.error("Please select both a time slot and skill before booking");
      return;
    }

    setIsBooking(true);
    setError(null);

    try {
      const [hours, minutes] = selectedTime.split(":");
      const appointmentDateTime = new Date(date);
      appointmentDateTime.setHours(parseInt(hours, 10));
      appointmentDateTime.setMinutes(parseInt(minutes, 10));
      const mentorId = searchParams.get("id");

      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Please sign in to book an appointment");
        return;
      }

      // Show loading toast
      const loadingToastId = toast.loading("Sending booking request...");

      const response = await fetch(
        "http://localhost:5274/api/appointments/book",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            mentorId: mentorId,
            appointmentDateTime: appointmentDateTime.toISOString(),
            skill: selectedSkill,
          }),
        }
      );

      const data = await response.json();

      // Dismiss loading toast
      toast.dismiss(loadingToastId);

      if (!response.ok) {
        // Handle specific error cases
        switch (response.status) {
          case 400:
            throw new Error(
              data.error ||
                "Invalid booking request. Please check your selections."
            );
          case 401:
            throw new Error("Your session has expired. Please sign in again.");
          case 409:
            throw new Error(
              "This time slot is no longer available. Please select another time."
            );
          case 422:
            throw new Error(
              "The mentor is not available at this time. Please choose another slot."
            );
          case 429:
            throw new Error(
              "Too many booking attempts. Please wait a moment and try again."
            );
          default:
            throw new Error(data.error || "Failed to book appointment");
        }
      }

      // Success message with appointment details
      const successMessage = data.calendarIntegrated
        ? "Appointment booked successfully! 📅 Added to mentor's calendar with meeting link."
        : "Appointment request sent successfully! The mentor will be notified.";

      toast.success(
        <div>
          <p>{successMessage}</p>
          <p className="text-sm mt-1">
            {`With ${mentorData.name} for ${selectedSkill}`}
            <br />
            {`${appointmentDateTime.toLocaleDateString()} at ${selectedTime}`}
          </p>
          {data.calendar?.meetingLink && (
            <p className="text-xs mt-2 text-green-600">
              Meeting link will be available after mentor accepts
            </p>
          )}
        </div>,
        { duration: 6000 }
      );

      // Navigate after a short delay to allow user to see the success message
      setTimeout(() => {
        navigate("/mentee/home");
      }, 2000);
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(error.message || "Failed to book appointment", {
        duration: 4000,
      });
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1128]">
        <MenteeHeader />
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-color"></div>
        </div>
      </div>
    );
  }

  if (!mentorData) {
    return (
      <div className="min-h-screen bg-[#0A1128]">
        <MenteeHeader />
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-white text-xl">Mentor not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1128]">
      <MenteeHeader />
      <Navigation />

      <div className="max-w-[1200px] mx-auto px-4 py-12">
        {/* Back Button */}
        <motion.button
          whileHover={{ x: -5 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-8 group"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Profile</span>
        </motion.button>

        {/* Mentor Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden mb-8 p-6"
        >
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex items-start gap-6">
              <div className="relative">
                <img
                  src={mentorData.image || "/media.png"}
                  alt={mentorData.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-white/10"
                />
                {mentorData.isVerified ? (
                  <div className="absolute -bottom-1 -right-1 bg-primary-color rounded-full p-1 border-2 border-[#0A1128]">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <div className="absolute -bottom-1 -right-1 bg-yellow-500/90 rounded-full p-1 border-2 border-[#0A1128]">
                    <AlertCircle className="w-4 h-4 text-black" />
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  {mentorData.name}
                  {mentorData.isVerified && (
                    <span className="text-xs font-normal px-2 py-1 bg-primary-color/20 text-primary-color rounded-full">
                      Verified Mentor
                    </span>
                  )}
                </h2>
                <p className="text-primary-color font-medium">
                  {mentorData.role}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  {mentorData.topSkills?.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-white/20"></span>
                      <div className="flex gap-2">
                        {mentorData.topSkills
                          .slice(0, 3)
                          .map((skill, index) => (
                            <span
                              key={index}
                              className="text-xs px-2 py-1 bg-white/5 rounded-full text-white/60"
                            >
                              {skill}
                            </span>
                          ))}
                        {mentorData.topSkills.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-white/5 rounded-full text-white/60">
                            +{mentorData.topSkills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="md:ml-auto flex items-center">
              <div className="text-sm text-white/60">
                <p className="mb-1">About to book a session with</p>
                <p className="font-medium text-white">{mentorData.name}</p>
              </div>
            </div>
          </div>

          {mentorData.bio && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-white/60 text-sm leading-relaxed">
                {mentorData.bio}
              </p>
            </div>
          )}
        </motion.div>

        {/* Booking Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Calendar Section */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary-color" />
              Select Date
            </h3>

            <Calendar
              onChange={handleDateChange}
              value={date}
              className="custom-calendar !bg-transparent !border-white/10 !text-white"
              minDate={new Date()}
              view="month"
              next2Label={null}
              prev2Label={null}
              showWeekNumbers={false}
              locale="en-US"
            />
          </div>

          {/* Skills and Time Slots Section */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h3 className="text-xl font-semibold text-white mb-6">
              Select Skill
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {mentorData?.topSkills?.map((skill) => (
                <motion.button
                  key={skill}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedSkill(skill);
                    setSelectedTime(null);
                  }}
                  className={`p-3 rounded-xl text-sm transition-all duration-200 ${
                    selectedSkill === skill
                      ? "bg-primary-color text-white"
                      : "bg-white/5 text-white/80 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  {skill}
                </motion.button>
              ))}
            </div>

            {/* Time Slots Section */}
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-color" />
              Available Time Slots
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableSlots.length > 0 ? (
                availableSlots.map((slot, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-3 rounded-xl text-sm transition-all duration-200 ${
                      selectedTime === slot.startTime
                        ? "bg-primary-color text-white"
                        : "bg-white/5 text-white/80 hover:bg-white/10 border border-white/10"
                    }`}
                    onClick={() => setSelectedTime(slot.startTime)}
                  >
                    <div>{slot.startTime}</div>
                    <div className="text-xs text-white/60">
                      {slot.duration} min
                    </div>
                  </motion.button>
                ))
              ) : (
                <div className="col-span-full text-center text-white/40 py-8">
                  <p>No available slots for this day</p>
                  <p className="text-xs mt-2">
                    Try selecting a different date or skill
                  </p>
                </div>
              )}
            </div>

            {/* Booking Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBookAppointment}
              disabled={!selectedTime || !selectedSkill || isBooking}
              className={`w-full mt-8 flex items-center justify-center gap-2 py-3 px-6 rounded-xl transition-all duration-300 ${
                selectedTime && selectedSkill && !isBooking
                  ? "bg-gradient-to-r from-primary-color to-primary-color/80 text-white hover:from-primary-color/90 hover:to-primary-color/70"
                  : "bg-white/5 text-white/30 cursor-not-allowed"
              }`}
            >
              {isBooking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Booking...</span>
                </>
              ) : (
                <>
                  <CalendarIcon className="w-4 h-4" />
                  <span>Book Appointment</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Helper function to get day name
const getDayName = (date) => {
  const dayIndex = date.getDay();
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return days[dayIndex];
};

export default BookAppointment;
