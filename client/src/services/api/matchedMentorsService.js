import { API_ENDPOINTS } from "./config";

export const fetchMatchedMentors = async (options = {}) => {
  const token = localStorage.getItem("authToken");
  const userId = localStorage.getItem("userId");

  if (!token) {
    throw new Error("No authentication token found");
  }

  if (!userId) {
    throw new Error("User ID not found");
  }

  try {
    // Build query parameters
    const params = new URLSearchParams();
    params.append("learnerId", userId);
    if (options.minScore !== undefined) {
      params.append("minScore", options.minScore.toString());
    }
    if (options.maxResults !== undefined) {
      params.append("maxResults", options.maxResults.toString());
    }

    const url = `${
      API_ENDPOINTS.BASE_URL
    }/learner/matched-mentors?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message ||
          errorData.error ||
          "Failed to fetch matched mentors"
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching matched mentors:", error);
    throw error;
  }
};

export const getMentorMatchingScore = async (mentorId) => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}/learner/matched-mentors?maxResults=1`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message ||
          errorData.error ||
          "Failed to get mentor matching score"
      );
    }

    const data = await response.json();
    const mentor = data.data.matched_mentors.find((m) => m._id === mentorId);
    return mentor || null;
  } catch (error) {
    console.error("Error getting mentor matching score:", error);
    throw error;
  }
};
