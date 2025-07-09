import { API_ENDPOINTS } from "./config";

const API_BASE_URL = "http://localhost:5274";

export const pdfParserService = {
  // Upload and analyze resume
  uploadResume: async (file) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch(`${API_BASE_URL}/api/pdf/upload-resume`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to upload and analyze resume"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error uploading resume:", error);
      throw error;
    }
  },

  // Get list of uploaded resumes
  getResumes: async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${API_BASE_URL}/api/pdf/resumes`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch resumes");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching resumes:", error);
      throw error;
    }
  },

  // Re-analyze a specific resume
  analyzeResume: async (filename) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/pdf/analyze-resume/${filename}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze resume");
      }

      return await response.json();
    } catch (error) {
      console.error("Error analyzing resume:", error);
      throw error;
    }
  },

  // Delete a resume
  deleteResume: async (filename) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/pdf/resume/${filename}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete resume");
      }

      return await response.json();
    } catch (error) {
      console.error("Error deleting resume:", error);
      throw error;
    }
  },

  // Get profile suggestions based on extracted data
  getProfileSuggestions: async (extractedData) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/pdf/profile-suggestions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ extractedData }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get profile suggestions");
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting profile suggestions:", error);
      throw error;
    }
  },
};
