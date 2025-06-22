import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, Star, User } from "lucide-react";
import {
  createMenteeConversation,
  fetchMenteeConversations,
} from "../../../services/api/menteeApi";
import { toast } from "react-toastify";

const MentorCard = ({ mentor }) => {
  const navigate = useNavigate();

  const handleSendMessage = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const mentorId = mentor._id || mentor.id;

      if (!mentorId) {
        console.error("No mentor ID found:", mentor);
        toast.error("Could not find mentor information. Please try again.");
        return;
      }

      if (!userId) {
        console.error("No user ID found");
        toast.error("Please sign in to send messages");
        return;
      }

      // First check if conversation already exists
      const conversations = await fetchMenteeConversations(userId);
      const existingConversation = conversations.find(
        (conv) => conv.mentorId._id === mentorId
      );

      if (existingConversation) {
        // If conversation exists, navigate to it
        navigate("/mentee/messages", {
          state: {
            conversationId: existingConversation._id,
            selectedMentorId: mentorId,
          },
        });
      } else {
        // If no conversation exists, create one
        const result = await createMenteeConversation(mentorId, userId);
        if (result.conversation) {
          navigate("/mentee/messages", {
            state: {
              conversationId: result.conversation._id,
              selectedMentorId: mentorId,
            },
          });
        }
      }
    } catch (error) {
      console.error("Error handling conversation:", error);
      if (error.response?.data?.error === "conversation already exists") {
        toast.error(
          "A conversation with this mentor already exists. Please check your messages."
        );
      } else {
        toast.error("Failed to start conversation");
      }
    }
  };

  const handleViewProfile = () => {
    navigate(`/mentee/mprofile?id=${mentor._id || mentor.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="relative group"
    >
      {/* Gradient Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-color/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Card Content */}
      <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        <div className="relative">
          <img
            src={mentor.image}
            alt={mentor.name}
            className="w-full h-50 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1128]/90 to-transparent" />
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-bold text-xl text-white mb-1 group-hover:text-primary-color transition-colors">
              {mentor.name}
            </h3>
            <p className="text-primary-color/90 font-medium">
              {mentor.specialty}
            </p>
          </div>

          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, index) => (
              <Star
                key={index}
                className={`w-4 h-4 ${
                  index < mentor.rating
                    ? "fill-primary-color text-primary-color"
                    : "text-white/20"
                }`}
              />
            ))}
            <span className="text-white/60 text-sm ml-2">
              {mentor.rating}.0
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {mentor.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-white/5 backdrop-blur-sm border border-white/5 rounded-full text-xs text-white/80 hover:border-primary-color/50 transition-colors"
              >
                {skill}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleViewProfile}
              className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 text-white py-3 px-4 rounded-xl transition-all duration-300"
            >
              <User className="w-4 h-4" />
              <span>View Profile</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSendMessage}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary-color/20 to-blue-500/20 hover:from-primary-color/30 hover:to-blue-500/30 backdrop-blur-xl border border-white/10 text-white py-3 px-4 rounded-xl transition-all duration-300"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Message</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

MentorCard.propTypes = {
  mentor: PropTypes.shape({
    _id: PropTypes.string,
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    specialty: PropTypes.string.isRequired,
    skills: PropTypes.arrayOf(PropTypes.string).isRequired,
    image: PropTypes.string.isRequired,
    rating: PropTypes.number.isRequired,
  }).isRequired,
};

export default MentorCard;
