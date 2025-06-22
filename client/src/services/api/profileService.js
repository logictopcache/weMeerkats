import { API_ENDPOINTS } from "./config";

export const submitMentorProfile = async (profileData) => {
  const token = localStorage.getItem("authToken");
  const response = await fetch(API_ENDPOINTS.MENTOR_PROFILE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: profileData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to save mentor profile");
  }

  return await response.json();
};

export const submitLearnerProfile = async (profileData) => {
  const token = localStorage.getItem("authToken");

  const response = await fetch(API_ENDPOINTS.LEARNER_PROFILE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: profileData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to save learner profile");
  }

  return await response.json();
};

export const fetchUserProfile = async (isMentor = false) => {
  const token = localStorage.getItem("authToken");
  const userId = localStorage.getItem("userId"); // We need to store userId during login

  if (!userId) {
    throw new Error("User ID not found");
  }

  try {
    const endpoint = isMentor
      ? `${API_ENDPOINTS.MENTOR_PROFILE}/${userId}`
      : `${API_ENDPOINTS.LEARNER_PROFILE}/${userId}`;

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch ${isMentor ? "mentor" : "learner"} profile`
      );
    }

    const data = await response.json();

    // The response is the profile object directly, not wrapped in data/success
    if (isMentor) {
      return {
        email: data.email || "",
        fullName: data.fullName || "",
        profilePictureUrl: data.profilePictureUrl || null,
        bio: data.bio || "",
        phone: data.phone || "",
        skills: data.skills || [],
        education: data.education || [],
        workExperiences: data.workExperiences || [],
        certification: data.certification || "",
        expertise: data.expertise || "",
        designation: data.designation || "",
        availability: data.availability || {},
        isVerified: data.isVerified || false,
        createdAt: data.createdAt || new Date(),
      };
    } else {
      return {
        email: data.email || "",
        fullName: data.fullName || "",
        profilePictureUrl: data.profilePictureUrl || null,
        bio: data.bio || "",
        skills: data.skills || [],
        education: data.education || [],
        createdAt: data.createdAt || new Date(),
      };
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};
