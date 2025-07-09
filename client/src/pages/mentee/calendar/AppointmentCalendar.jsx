import { useState, useEffect } from "react";
import Navigation from "../../../components/mentee/home/Navigation";
import MenteeHeader from "../../../components/mentee/home/Header";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiCalendar,
  FiClock,
  FiX,
  FiAlertCircle,
} from "react-icons/fi";
import { toast } from "react-hot-toast";

const AppointmentCalendar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelModal, setCancelModal] = useState({
    show: false,
    appointmentId: null,
    appointmentDetails: null,
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const learnerid = localStorage.getItem("userId");

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
        mentorName:
          appointment.mentorName ||
          `${appointment.mentorId?.firstName} ${appointment.mentorId?.lastName}`,
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

  const handleCancelAppointment = (appointmentId) => {
    const appointment = appointments.find((app) => app.id === appointmentId);
    setCancelModal({
      show: true,
      appointmentId,
      appointmentDetails: appointment,
    });
  };

  const confirmCancelAppointment = async () => {
    const { appointmentId } = cancelModal;

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
            reason: "Cancelled by mentee",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel appointment");
      }

      setCancelModal({
        show: false,
        appointmentId: null,
        appointmentDetails: null,
      });
      fetchAppointments();

      toast.success("Appointment cancelled successfully");
    } catch (error) {
      console.error("Error cancelling appointment:", error);

      toast.error(error.message || "Failed to cancel appointment");
    }
  };

  const filterAppointments = (appointments) => {
    return appointments.filter(
      (appointment) =>
        appointment.mentorName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        appointment.day.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.time.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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

  return (
    <div className="min-h-screen bg-[#0A1128]">
      <MenteeHeader />
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

            <div className="bg-[#0A1128] border border-white/10 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10">
                  <thead>
                    <tr className="bg-white/[0.03]">
                      <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                        Mentor
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
                      <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                        Actions
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
                                  {appointment.mentorName}
                                </div>
                                {appointment.calendarSynced && (
                                  <span
                                    className="w-2 h-2 bg-green-500 rounded-full"
                                    title="Calendar synced"
                                  ></span>
                                )}
                                {appointment.meetingLink && (
                                  <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20">
                                    Meeting
                                  </span>
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
                            <td className="px-6 py-4 whitespace-nowrap">
                              {![
                                "cancelled",
                                "completed",
                                "accepted",
                                "rejected",
                              ].includes(appointment.status.toLowerCase()) && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() =>
                                    handleCancelAppointment(appointment.id)
                                  }
                                  className="flex items-center gap-2 px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                                >
                                  <FiX size={16} />
                                  <span>Cancel</span>
                                </motion.button>
                              )}
                            </td>
                          </motion.tr>
                        )
                      )}
                    </AnimatePresence>
                    {filterAppointments(appointments).length === 0 && (
                      <tr>
                        <td
                          colSpan="5"
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

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {cancelModal.show && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-[#0c1631] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-auto shadow-2xl"
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/10 mb-4">
                  <FiAlertCircle className="h-6 w-6 text-red-500" />
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">
                  Cancel Appointment
                </h3>

                <p className="text-white/70 mb-6">
                  Are you sure you want to cancel your appointment with{" "}
                  <span className="font-medium text-white">
                    {cancelModal.appointmentDetails?.mentorName}
                  </span>
                  ?
                </p>

                {cancelModal.appointmentDetails && (
                  <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
                    <div className="flex items-center gap-2 text-white/80 mb-2">
                      <FiCalendar size={16} className="text-primary-color" />
                      <span className="text-sm">
                        {cancelModal.appointmentDetails.day}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-white/80">
                      <FiClock size={16} className="text-primary-color" />
                      <span className="text-sm">
                        {cancelModal.appointmentDetails.time}
                      </span>
                    </div>
                  </div>
                )}

                <p className="text-xs text-white/50 mb-6">
                  This action cannot be undone. You'll need to book a new
                  appointment if you change your mind.
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    setCancelModal({
                      show: false,
                      appointmentId: null,
                      appointmentDetails: null,
                    })
                  }
                  className="flex-1 px-4 py-2 bg-white/5 text-white/80 rounded-lg hover:bg-white/10 transition-all duration-300 font-medium border border-white/10"
                >
                  Keep Appointment
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmCancelAppointment}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-300 font-medium"
                >
                  Yes, Cancel
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppointmentCalendar;
