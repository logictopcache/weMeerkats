import { API_ENDPOINTS, API_HEADERS } from "./config";

export const signUpMentor = async (userData) => {
  const response = await fetch(API_ENDPOINTS.MENTOR_SIGNUP, {
    method: "POST",
    headers: API_HEADERS,
    credentials: "include",
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Signup failed");
  }

  const data = await response.json();

  // Set the JWT token cookie
  const jwtToken = response.headers.get("jwtToken");
  if (jwtToken) {
    document.cookie = `jwtToken=${jwtToken}; path=/`;
  }

  return data;
};

export const verifyOTP = async (userId, otp, role) => {
  // Convert mentee role to learner for backend compatibility
  const type = role === "mentee" ? "learner" : "mentor";
  const endpoint =
    type === "mentor"
      ? API_ENDPOINTS.MENTOR_VERIFY_OTP
      : API_ENDPOINTS.MENTEE_VERIFY_OTP;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: API_HEADERS,
    credentials: "include",
    body: JSON.stringify({ userId, otp }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "OTP verification failed");
  }

  return await response.json();
};

export const resendOTP = async (userId, email, role) => {
  const type = role === "mentee" ? "learner" : "mentor";
  const endpoint =
    type === "mentor"
      ? API_ENDPOINTS.MENTOR_RESEND_OTP
      : API_ENDPOINTS.MENTEE_RESEND_OTP;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: API_HEADERS,
    credentials: "include",
    body: JSON.stringify({ userId, email }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to resend OTP");
  }

  return await response.json();
};

export const signUpMentee = async (userData) => {
  const response = await fetch(API_ENDPOINTS.MENTEE_SIGNUP, {
    method: "POST",
    headers: API_HEADERS,
    credentials: "include",
    body: JSON.stringify({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Signup failed");
  }

  const data = await response.json();

  // Set cookie if token exists in response data
  if (data.token) {
    // Set cookie with necessary attributes
    document.cookie = `jwtToken=${data.token}; path=/; secure; samesite=strict`;
  } else {
    console.log("No token in response data:", data);
  }

  return data;
};

export const signIn = async (credentials, role) => {
  const endpoint =
    role === "mentor"
      ? API_ENDPOINTS.MENTOR_SIGNIN
      : API_ENDPOINTS.MENTEE_SIGNIN;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: API_HEADERS,
      credentials: "include",
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      // Throw error with the message from the API
      throw new Error(data.error || "Sign in failed");
    }

    // Store token from response
    if (data.token) {
      localStorage.setItem("authToken", data.token);
    }

    localStorage.setItem("userRole", role);
    localStorage.setItem("userId", data.id);
    return data;
  } catch (error) {
    // If it's already an Error object with our custom message, throw it as is
    if (
      error.message === "Learner Not Found" ||
      error.message === "Invalid Credentials"
    ) {
      throw error;
    }
    // Otherwise, throw a new error with a generic message
    throw new Error("Sign in failed. Please try again.");
  }
};
