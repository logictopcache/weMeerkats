import { API_ENDPOINTS } from "./config";

export const fetchLearners = async () => {
  try {
    const response = await fetch(`${API_ENDPOINTS.LEARNERS}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch learners");
    }

    const data = await response.json();

    // Filter only verified learners and map to required format
    return data
      .filter((learner) => learner.verified)
      .map((learner) => ({
        _id: learner._id,
        firstName: learner.firstName,
        lastName: learner.lastName,
        email: learner.email,
        image: learner.image || "/mentee1.png",
      }));
  } catch (error) {
    console.error("Error fetching learners:", error);
    throw error;
  }
};

export const createConversation = async (mentorId, learnerId) => {
  const token = localStorage.getItem("authToken");
  try {
    const response = await fetch(`${API_ENDPOINTS.CONVERSATION}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        learnerId,
        mentorId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create conversation");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
};

export const fetchMentors = async () => {
  try {
    // Use the mentor-profiles endpoint to get combined mentor and profile data
    const response = await fetch(`${API_ENDPOINTS.BASE_URL}/mentor-profiles`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch mentors");
    }

    const data = await response.json();

    // Map combined mentor data to the format expected by the component
    return data.map((mentor) => ({
      _id: mentor.mentorId, // Use mentorId as the main ID for profile navigation
      firstName: mentor.firstName, // From Mentor collection
      lastName: mentor.lastName, // From Mentor collection
      fullName: mentor.fullName, // From MentorProfile collection
      email: mentor.email, // From both collections, prioritize profile email
      verified: mentor.verified, // From Mentor collection
      bio: mentor.bio, // From MentorProfile collection
      skills: mentor.skills || [], // From MentorProfile collection
      expertise: mentor.expertise, // From MentorProfile collection
      certification: mentor.certification, // From MentorProfile collection
      education: mentor.education || [], // From MentorProfile collection
      workExperiences: mentor.workExperiences || [], // From MentorProfile collection
      profilePictureUrl: mentor.profilePictureUrl, // From MentorProfile collection
      phone: mentor.phone, // From MentorProfile collection
      designation: mentor.designation, // From MentorProfile collection
      image: mentor.profilePictureUrl
        ? `${API_ENDPOINTS.BASE_URL}/uploads/${mentor.profilePictureUrl}`
        : null, // Only set image if profile picture exists
    }));
  } catch (error) {
    console.error("Error fetching mentors:", error);
    throw error;
  }
};

export const searchMentors = async (searchQuery) => {
  try {
    const response = await fetch(
      `${API_ENDPOINTS.MENTORS}/search?key=${searchQuery}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to search mentors");
    }

    const data = await response.json();

    // Extract mentors array from the response
    const mentorsArray = data.mentors || [];

    // Map the data to match our component's requirements
    return mentorsArray.map((mentor) => ({
      id: mentor.mentorId,
      name: mentor.fullName,
      specialty: mentor.expertise || "Development",
      skills: mentor.skills || [],
      mentor: mentor.mentorId,
      image: "/media.png", // Default image since API doesn't provide one
      rating: 4, // Default rating since API doesn't provide one
      bio: mentor.bio,
      certification: mentor.certification,
      education: mentor.education,
      workExperiences: mentor.workExperiences,
      email: mentor.email,
      phone: mentor.phone,
    }));
  } catch (error) {
    console.error("Error searching mentors:", error);
    throw error;
  }
};

export const fetchMentorProfile = async (mentorId) => {
  try {
    const response = await fetch(
      `${API_ENDPOINTS.MENTOR_PROFILE}/${mentorId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch mentor profile");
    }

    const data = await response.json();

    return {
      name: data.fullName,
      image: data.image || "/image2.png",
      role: data.expertise || "Web Developer",
      bio: data.bio,
      topSkills: data.skills || [],
      experience:
        data.workExperiences?.map((exp) => ({
          position: exp.title,
          company: exp.companyName,
          period: exp.duration,
        })) || [],
      availability: data.availability,
      rating: 4,
      isVerified: data.isVerified,
    };
  } catch (error) {
    console.error("Error fetching mentor profile:", error);
    throw error;
  }
};

export const fetchMentorConversations = async (mentorId) => {
  const token = localStorage.getItem("authToken");
  try {
    const response = await fetch(`${API_ENDPOINTS.CONVERSATIONS}/${mentorId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch conversations");
    }

    const data = await response.json();
    return data.conversations;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
};
