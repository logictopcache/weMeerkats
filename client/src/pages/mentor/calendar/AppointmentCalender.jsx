import { useState, useEffect, useRef } from "react";
import MentorHeader from "../../../components/mentor/home/Header";
import Navigation from "../../../components/mentor/home/Navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiCalendar,
  FiClock,
  FiX,
  FiAlertCircle,
  FiCheck,
  FiMessageSquare,
  FiRefreshCw,
  FiChevronDown,
  FiMoreVertical,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

const AppointmentCalender = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completeModal, setCompleteModal] = useState({
    show: false,
    appointmentId: null,
  });
  const [feedback, setFeedback] = useState("");
  const [rescheduleModal, setRescheduleModal] = useState({
    show: false,
    appointmentId: null,
  });
  const [proposedDateTime, setProposedDateTime] = useState(new Date());
  const [reason, setReason] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const [warningMessage, setWarningMessage] = useState("");
  const [showWarning, setShowWarning] = useState(true);

  // Add durations array
  const durations = [30, 45, 60];

  useEffect(() => {
    fetchAppointments();

    // Add click outside listener
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const mentorId = localStorage.getItem("userId");

      const response = await fetch(
        `http://localhost:5274/api/appointments/my-appointments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch appointments");
      }

      // The new API returns appointments in data.appointments array
      const appointmentsList = data.appointments || [];

      const formattedAppointments = appointmentsList.map((appointment) => ({
        id: appointment._id,
        menteeName:
          appointment.learnerName ||
          `${appointment.learnerId?.firstName} ${appointment.learnerId?.lastName}`,
        day: new Date(appointment.appointmentDateTime).toLocaleDateString(
          "en-US",
          {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        ),
        time: new Date(appointment.appointmentDateTime).toLocaleTimeString(
          "en-US",
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        ),
        status: appointment.status,
        dateTime: new Date(appointment.appointmentDateTime),
        skill: appointment.skill,
        duration: appointment.duration,
        calendarSynced: appointment.googleCalendar?.calendarSynced || false,
        meetingLink: appointment.googleCalendar?.meetingLink || null,
      }));

      // Sort appointments by date
      formattedAppointments.sort((a, b) => a.dateTime - b.dateTime);
      setAppointments(formattedAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (appointmentId) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      // Get the appointment details before completing it
      const appointment = appointments.find((app) => app.id === appointmentId);
      if (!appointment) {
        throw new Error("Appointment not found");
      }

      setCompleteModal({ show: false, appointmentId: null });
      setFeedback("");
      fetchAppointments();
      toast.success("Appointment completed successfully");
    } catch (error) {
      console.error("Error completing appointment:", error);
      toast.error(error.message || "Failed to complete appointment");
    }
  };

  const handleReject = async (appointmentId) => {
    if (
      !window.confirm(
        "Are you sure you want to reject this appointment request?"
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `http://localhost:5274/api/appointments/${appointmentId}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: "Appointment rejected by mentor",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reject appointment");
      }

      fetchAppointments();
      toast.success("Appointment rejected successfully");
    } catch (error) {
      console.error("Error rejecting appointment:", error);
      toast.error(error.message || "Failed to reject appointment");
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `http://localhost:5274/api/appointments/${appointmentId}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: "Appointment cancelled by mentor",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel appointment");
      }

      fetchAppointments();
      toast.success("Appointment cancelled successfully");
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error(error.message || "Failed to cancel appointment");
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleModal.appointmentId || !proposedDateTime) return;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      // Simulate success for now
      const response = { ok: true };
      const data = { success: true };

      if (!response.ok) {
        throw new Error(data.error || "Failed to reschedule appointment");
      }

      setRescheduleModal({ show: false, appointmentId: null });
      setReason("");
      fetchAppointments();
      toast.success("Appointment rescheduled successfully");
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      toast.error(error.message || "Failed to reschedule appointment");
    }
  };

  const handleAccept = async (appointmentId) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `http://localhost:5274/api/appointments/${appointmentId}/accept`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to accept appointment");
      }

      fetchAppointments();
      toast.success("Appointment accepted successfully");
    } catch (error) {
      console.error("Error accepting appointment:", error);
      toast.error(error.message || "Failed to accept appointment");
    }
  };

  const filterAppointments = (appointments) => {
    return appointments.filter(
      (appointment) =>
        appointment.menteeName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        appointment.day.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.time.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rescheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const ActionDropdown = ({ appointment }) => {
    // Hide actions for accepted or rejected appointments
    if (["accepted", "rejected"].includes(appointment.status.toLowerCase())) {
      return null;
    }

    // Check if appointment time has passed
    const hasAppointmentTimePassed =
      new Date(appointment.dateTime) < new Date();

    return (
      <div className="relative">
        <button
          onClick={() => {
            const newDropdownState =
              openDropdown === appointment.id ? null : appointment.id;
            setOpenDropdown(newDropdownState);
          }}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 text-white/80 rounded-lg hover:bg-white/10 transition-colors border border-white/10"
        >
          <FiMoreVertical size={16} />
          <span className="text-sm">Actions</span>
          <FiChevronDown
            size={16}
            className={`transition-transform ${
              openDropdown === appointment.id ? "rotate-180" : ""
            }`}
          />
        </button>

        {openDropdown === appointment.id && (
          <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#0c1631] border border-white/10 shadow-lg overflow-visible z-[100]">
            {appointment.status.toLowerCase() === "pending" && (
              <div className="py-1">
                <button
                  onClick={() => {
                    handleAccept(appointment.id);
                    setOpenDropdown(null);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white/80 hover:bg-white/5"
                >
                  <FiCheck size={16} className="text-green-500" />
                  <span>Accept</span>
                </button>
                <button
                  onClick={() => {
                    handleReject(appointment.id);
                    setOpenDropdown(null);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white/80 hover:bg-white/5"
                >
                  <FiX size={16} className="text-red-500" />
                  <span>Reject</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1128]">
        <MentorHeader />
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-color"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1128]">
      <MentorHeader />
      <Navigation />
      <div className="relative">
        <div className="max-w-[1200px] mx-auto px-5 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Upcoming Appointments
                </h1>
                <p className="text-white/60">
                  Manage your scheduled mentoring sessions
                </p>
              </div>
              <div className="relative w-full md:w-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search appointments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-64 pl-10 pr-4 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary-color/50 focus:ring-1 focus:ring-primary-color/50"
                  />
                  <FiSearch
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40"
                    size={18}
                  />
                </div>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-white"
              >
                <FiAlertCircle className="text-red-500" size={20} />
                <p>{error}</p>
              </motion.div>
            )}

            <AnimatePresence>
              {showWarning && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-yellow-500/10 border border-yellow-400/20 rounded-xl flex items-center justify-between text-yellow-400"
                >
                  <div className="flex items-center gap-3">
                    <FiAlertCircle size={20} />
                    <p>
                      Appointments can only be marked as complete after their
                      scheduled time has passed
                    </p>
                  </div>
                  <button
                    onClick={() => setShowWarning(false)}
                    className="p-1 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <FiX size={20} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-[#0A1128] border border-white/10 rounded-xl overflow-hidden">
              <div className="overflow-x-auto relative">
                <table className="min-w-full divide-y divide-white/10">
                  <thead>
                    <tr className="bg-white/[0.03]">
                      <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                        Mentee
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                        Day
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    <AnimatePresence>
                      {filterAppointments(appointments).map(
                        (appointment, index) => (
                          <motion.tr
                            key={appointment.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="text-white">
                                  {appointment.menteeName}
                                </div>
                                {appointment.calendarSynced && (
                                  <span
                                    className="w-2 h-2 bg-green-500 rounded-full"
                                    title="Calendar synced"
                                  ></span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2 text-white/80">
                                <FiCalendar
                                  size={16}
                                  className="text-primary-color"
                                />
                                {appointment.day}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2 text-white/80">
                                <FiClock
                                  size={16}
                                  className="text-primary-color"
                                />
                                {appointment.time}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  appointment.status
                                )}`}
                              >
                                {appointment.status}
                              </span>
                            </td>
                          </motion.tr>
                        )
                      )}
                    </AnimatePresence>
                    {filterAppointments(appointments).length === 0 && (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-6 py-8 text-center text-white/60"
                        >
                          No appointments found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Complete Modal */}
      {completeModal.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#0c1631] border border-white/10 p-4 md:p-6 rounded-2xl w-full max-w-[400px] shadow-xl"
          >
            <h3 className="text-lg md:text-xl font-bold text-white mb-4">
              Complete Appointment
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-xs md:text-sm mb-2">
                  Feedback (Optional)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full bg-[#0A1128] border border-white/10 rounded-lg p-2 text-white text-sm resize-none"
                  rows="3"
                  placeholder="Enter feedback about the session..."
                />
              </div>
            </div>

            <div className="flex flex-col-reverse md:flex-row justify-end gap-2 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setCompleteModal({ show: false, appointmentId: null });
                  setFeedback("");
                }}
                className="w-full md:w-auto px-4 py-2 bg-white/5 text-white/80 rounded-lg hover:bg-white/10 transition-all duration-300 text-xs md:text-sm font-medium border border-white/10"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleComplete(completeModal.appointmentId)}
                className="w-full md:w-auto px-4 py-2 bg-gradient-to-r from-primary-color to-blue-500 text-white rounded-lg hover:opacity-90 transition-all duration-300 text-xs md:text-sm font-medium"
              >
                Complete Appointment
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModal.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#0c1631] border border-white/10 p-4 md:p-6 rounded-2xl w-full max-w-[400px] shadow-xl"
          >
            <h3 className="text-lg md:text-xl font-bold text-white mb-4">
              Reschedule Appointment
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-xs md:text-sm mb-2">
                  New Date and Time
                </label>
                <input
                  type="datetime-local"
                  value={proposedDateTime.toISOString().slice(0, 16)}
                  onChange={(e) =>
                    setProposedDateTime(new Date(e.target.value))
                  }
                  className="w-full bg-[#0A1128] border border-white/10 rounded-lg p-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-white/80 text-xs md:text-sm mb-2">
                  Reason (Optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-[#0A1128] border border-white/10 rounded-lg p-2 text-white text-sm resize-none"
                  rows="3"
                  placeholder="Enter reason for rescheduling..."
                />
              </div>
            </div>

            <div className="flex flex-col-reverse md:flex-row justify-end gap-2 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setRescheduleModal({ show: false, appointmentId: null });
                  setReason("");
                }}
                className="w-full md:w-auto px-4 py-2 bg-white/5 text-white/80 rounded-lg hover:bg-white/10 transition-all duration-300 text-xs md:text-sm font-medium border border-white/10"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReschedule}
                className="w-full md:w-auto px-4 py-2 bg-gradient-to-r from-primary-color to-blue-500 text-white rounded-lg hover:opacity-90 transition-all duration-300 text-xs md:text-sm font-medium"
              >
                Confirm Reschedule
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AppointmentCalender;
