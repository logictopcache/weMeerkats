import { API_ENDPOINTS } from "./config";

const API_BASE_URL = "http://localhost:5274";

export const quizService = {
  // Save quiz result (handles both new and retake)
  saveQuizResult: async (quizData) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/api/quiz-result`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(quizData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save quiz result");
      }

      return await response.json();
    } catch (error) {
      console.error("Error saving quiz result:", error);
      throw error;
    }
  },

  // Get quiz result for specific category
  getQuizResult: async (category) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/quiz-result/${encodeURIComponent(category)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 404) {
        return null; // No result found for this category
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch quiz result");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching quiz result:", error);
      throw error;
    }
  },

  // Get all quiz results for the learner
  getAllQuizResults: async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/api/quiz-results`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch quiz results");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching all quiz results:", error);
      throw error;
    }
  },

  // Delete quiz result (for testing or admin purposes)
  deleteQuizResult: async (category) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/quiz-result/${encodeURIComponent(category)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete quiz result");
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting quiz result:", error);
      throw error;
    }
  },
};
