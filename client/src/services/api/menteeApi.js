import axios from "axios";
import { API_ENDPOINTS } from "./config";

export const fetchMenteeConversations = async (userId) => {
  const token = localStorage.getItem("authToken");
  try {
    const response = await axios.get(
      `${API_ENDPOINTS.BASE_URL}/learner/conversations/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data || [];
  } catch (error) {
    console.error("Error fetching mentee conversations:", error);
    throw error;
  }
};

export const fetchMenteeConversation = async () => {
  try {
    const response = await axios.get(
      `${API_ENDPOINTS.BASE_URL}/learner/conversation`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching mentee conversation:", error);
    throw error;
  }
};

export const createMenteeConversation = async (mentorId, learnerId) => {
  const token = localStorage.getItem("authToken");
  try {
    const response = await axios.post(
      `${API_ENDPOINTS.BASE_URL}/learner/conversation`,
      {
        mentorId,
        learnerId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error creating mentee conversation:", error);
    throw error;
  }
};
