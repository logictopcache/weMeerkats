import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion, AnimatePresence } from "framer-motion";
import { FiCalendar, FiClock, FiX, FiCheck, FiRefreshCw } from "react-icons/fi";
import {
  fetchMentorRequests,
  acceptMentorRequest,
  rejectMentorRequest,
  rescheduleMentorRequest,
} from "../../../services/api/mentorRequestApi";

const MeetingRequestList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rescheduleModal, setRescheduleModal] = useState({
    show: false,
    appointmentId: null,
  });
  const [proposedDateTime, setProposedDateTime] = useState(new Date());
  const [reason, setReason] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await fetchMentorRequests();
      setRequests(Array.isArray(data) ? data : [data]);
    } catch (error) {
      toast.error("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (appointmentId, appointmentDateTime, skill) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      // First accept the meeting request
      const acceptResponse = await fetch(
        `http://localhost:5274/mentor-requests/${appointmentId}/accept`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const acceptData = await acceptResponse.json();

      if (!acceptResponse.ok) {
        throw new Error(acceptData.error || "Failed to accept request");
      }

      // Then toggle the availability for that time slot
      const appointmentDate = new Date(appointmentDateTime);
      const day = appointmentDate
        .toLocaleDateString("en-US", { weekday: "long" })
        .toLowerCase();
      const hours = appointmentDate.getHours().toString().padStart(2, "0");
      const minutes = appointmentDate.getMinutes().toString().padStart(2, "0");
      const startTime = `${hours}:${minutes}`;

      const toggleResponse = await fetch(
        `http://localhost:5274/mentor/availability/toggle`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            day,
            startTime,
            skill,
          }),
        }
      );

      const toggleData = await toggleResponse.json();

      if (!toggleResponse.ok) {
        console.error("Failed to toggle availability:", toggleData.error);
        // Still show success for accepting since that worked
        toast.success("Request accepted successfully");
        // But notify about availability issue
        toast.warning("Note: Failed to update availability schedule");
      } else {
        toast.success("Request accepted and availability updated");
      }

      fetchRequests();
    } catch (error) {
      console.error("Error in handleAccept:", error);
      toast.error(error.message || "Failed to accept request");
    }
  };

  const handleReject = async (appointmentId) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `http://localhost:5274/mentor-requests/${appointmentId}/reject`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: "Request rejected by mentor",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reject request");
      }

      toast.success("Request rejected successfully");
      fetchRequests();
    } catch (error) {
      toast.error("Failed to reject request");
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleModal.appointmentId || !proposedDateTime) return;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `http://localhost:5274/mentor-requests/${rescheduleModal.appointmentId}/reschedule`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            proposedDateTime: proposedDateTime.toISOString(),
            reason: reason || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reschedule request");
      }

      toast.success("Request rescheduled successfully");
      setRescheduleModal({ show: false, appointmentId: null });
      setReason("");
      fetchRequests();
    } catch (error) {
      toast.error("Failed to reschedule request");
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center bg-[#0A1128]">
        <div className="text-white/60">Loading requests...</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#0A1128] min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4 py-5 pb-10">
        <div className="space-y-1 mb-6 pl-2">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Meeting Requests
          </h2>
          <p className="text-white/60">
            Manage your pending mentorship meeting requests
          </p>
        </div>

        <div className="space-y-4 min-h-[200px]">
          <AnimatePresence mode="wait">
            {requests.map((request) => (
              <motion.div
                key={request._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="relative bg-[#0c1631] backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-6 flex-col md:flex-row">
                  {/* Left side - Avatar & Basic Info */}
                  <div className="flex items-start gap-4 w-full md:w-auto">
                    <div className="relative w-12 h-12 md:w-16 md:h-16">
                      <img
                        src={request.learnerImage || "/mentee1.png"}
                        alt={request.learnerName}
                        className="w-full h-full rounded-full object-cover border-2 border-primary-color/20"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 md:w-3.5 md:h-3.5 bg-amber-500 rounded-full border-2 border-[#0c1631]" />
                    </div>

                    {/* Meeting Details */}
                    <div className="space-y-2 md:space-y-3 flex-1">
                      <div>
                        <h3 className="text-lg md:text-xl font-semibold text-white">
                          {request.learnerName}
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-amber-500" />
                          <span className="text-white/60 text-xs md:text-sm">
                            Pending Request
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-white/80">
                          <FiCalendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary-color" />
                          <span className="text-xs md:text-sm">
                            {new Date(
                              request.appointmentDateTime
                            ).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-white/60">
                          <FiClock className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-400" />
                          <span className="text-xs md:text-sm">
                            {new Date(
                              request.appointmentDateTime
                            ).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right side - Actions */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        handleAccept(
                          request._id,
                          request.appointmentDateTime,
                          request.skill
                        )
                      }
                      className="flex-1 md:flex-none px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2 text-xs md:text-sm font-medium min-w-[100px]"
                    >
                      <FiCheck className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span>Accept</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleReject(request._id)}
                      className="flex-1 md:flex-none px-4 py-2 bg-white/5 text-white/80 rounded-lg hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2 text-xs md:text-sm font-medium border border-white/10 min-w-[100px]"
                    >
                      <FiX className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span>Reject</span>
                    </motion.button>

                    {/* <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setRescheduleModal({ show: true, appointmentId: request._id })}
                      className="flex-1 md:flex-none px-4 py-2 bg-gradient-to-r from-primary-color to-blue-500 text-white rounded-lg hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2 text-xs md:text-sm font-medium min-w-[100px]"
                    >
                      <FiRefreshCw className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span>Reschedule</span>
                    </motion.button> */}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {requests.length === 0 && (
            <div className="text-center py-10">
              <p className="text-white/60">No pending meeting requests</p>
            </div>
          )}
        </div>

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
                  <DatePicker
                    selected={proposedDateTime}
                    onChange={(date) => setProposedDateTime(date)}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
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
                  onClick={() =>
                    setRescheduleModal({ show: false, appointmentId: null })
                  }
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
                  Confirm
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingRequestList;
