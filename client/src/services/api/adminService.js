import { API_ENDPOINTS } from "./config";

// Admin authentication
export const adminLogin = async (email, password) => {
  try {
    const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Login failed");
    }

    const data = await response.json();

    // Store admin token
    localStorage.setItem("adminToken", data.token);
    localStorage.setItem("adminData", JSON.stringify(data.admin));

    return data;
  } catch (error) {
    console.error("Admin login error:", error);
    throw error;
  }
};

// Verify admin token
export const verifyAdminToken = async () => {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      throw new Error("No admin token found");
    }

    const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/admin/verify`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Token verification failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Token verification error:", error);
    throw error;
  }
};

// Get dashboard statistics
export const getDashboardStats = async () => {
  try {
    const token = localStorage.getItem("adminToken");
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}/api/admin/dashboard/stats`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch dashboard stats");
    }

    return await response.json();
  } catch (error) {
    console.error("Dashboard stats error:", error);
    throw error;
  }
};

// Get pending mentors
export const getPendingMentors = async () => {
  try {
    const token = localStorage.getItem("adminToken");
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}/api/admin/mentors/pending`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch pending mentors");
    }

    return await response.json();
  } catch (error) {
    console.error("Pending mentors error:", error);
    throw error;
  }
};

// Get pending mentees
export const getPendingMentees = async () => {
  try {
    const token = localStorage.getItem("adminToken");
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}/api/admin/mentees/pending`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch pending mentees");
    }

    return await response.json();
  } catch (error) {
    console.error("Pending mentees error:", error);
    throw error;
  }
};

// Get all mentors with pagination and status filter
export const getMentors = async (status = "", page = 1, limit = 10) => {
  try {
    const token = localStorage.getItem("adminToken");
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) {
      queryParams.append("status", status);
    }

    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}/api/admin/mentors?${queryParams}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch mentors");
    }

    return await response.json();
  } catch (error) {
    console.error("Mentors fetch error:", error);
    throw error;
  }
};

// Get all mentees with pagination and status filter
export const getMentees = async (status = "", page = 1, limit = 10) => {
  try {
    const token = localStorage.getItem("adminToken");
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) {
      queryParams.append("status", status);
    }

    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}/api/admin/mentees?${queryParams}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch mentees");
    }

    return await response.json();
  } catch (error) {
    console.error("Mentees fetch error:", error);
    throw error;
  }
};

// Approve mentor
export const approveMentor = async (mentorId) => {
  try {
    const token = localStorage.getItem("adminToken");
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}/api/admin/mentors/${mentorId}/approve`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to approve mentor");
    }

    return await response.json();
  } catch (error) {
    console.error("Mentor approval error:", error);
    throw error;
  }
};

// Reject mentor
export const rejectMentor = async (mentorId, reason) => {
  try {
    const token = localStorage.getItem("adminToken");
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}/api/admin/mentors/${mentorId}/reject`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to reject mentor");
    }

    return await response.json();
  } catch (error) {
    console.error("Mentor rejection error:", error);
    throw error;
  }
};

// Approve mentee
export const approveMentee = async (menteeId) => {
  try {
    const token = localStorage.getItem("adminToken");
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}/api/admin/mentees/${menteeId}/approve`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to approve mentee");
    }

    return await response.json();
  } catch (error) {
    console.error("Mentee approval error:", error);
    throw error;
  }
};

// Reject mentee
export const rejectMentee = async (menteeId, reason) => {
  try {
    const token = localStorage.getItem("adminToken");
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}/api/admin/mentees/${menteeId}/reject`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to reject mentee");
    }

    return await response.json();
  } catch (error) {
    console.error("Mentee rejection error:", error);
    throw error;
  }
};

// Get mentor details
export const getMentorDetails = async (mentorId) => {
  try {
    const token = localStorage.getItem("adminToken");
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}/api/admin/mentors/${mentorId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch mentor details");
    }

    return await response.json();
  } catch (error) {
    console.error("Mentor details error:", error);
    throw error;
  }
};

// Get mentee details
export const getMenteeDetails = async (menteeId) => {
  try {
    const token = localStorage.getItem("adminToken");
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}/api/admin/mentees/${menteeId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch mentee details");
    }

    return await response.json();
  } catch (error) {
    console.error("Mentee details error:", error);
    throw error;
  }
};

// Admin logout
export const adminLogout = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminData");
};
