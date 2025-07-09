const API_BASE_URL = "http://localhost:5274";
const AI_CHAT_URL = "http://localhost:5274";

export const API_ENDPOINTS = {
  BASE_URL: API_BASE_URL,
  MENTOR_SIGNUP: `${API_BASE_URL}/mentor/signup`,
  MENTEE_SIGNUP: `${API_BASE_URL}/learner/signup`,
  MENTOR_VERIFY_OTP: `${API_BASE_URL}/mentor/verifyOTP`,
  MENTEE_VERIFY_OTP: `${API_BASE_URL}/learner/verifyOTP`,
  MENTOR_RESEND_OTP: `${API_BASE_URL}/mentor/resendOTPVerificationCode`,
  MENTEE_RESEND_OTP: `${API_BASE_URL}/learner/resendOTPVerificationCode`,
  DEV_GET_OTP: `${API_BASE_URL}/dev/get-otp`,
  MENTOR_SIGNIN: `${API_BASE_URL}/mentor/signin`,
  MENTEE_SIGNIN: `${API_BASE_URL}/learner/signin`,
  MENTOR_PROFILE: `${API_BASE_URL}/mentor-profile`,
  LEARNER_PROFILE: `${API_BASE_URL}/learner-profile`,
  LEARNERS: `${API_BASE_URL}/learners`,
  MENTORS: `${API_BASE_URL}/mentors`,
  CONVERSATION: `${API_BASE_URL}/mentor/conversation`,
  CONVERSATIONS: `${API_BASE_URL}/mentor/conversations`,

  // Progress Tracking Endpoints
  SKILL_CATEGORIES: `${API_BASE_URL}/api/skill-categories`,
  SKILL_ASSIGNMENTS: `${API_BASE_URL}/api/learner/skill-assignments-status`,
  COMPLETED_ASSIGNMENTS: `${API_BASE_URL}/api/learner/completed-assignments`,
  COMPLETE_ASSIGNMENT: `${API_BASE_URL}/api/learner/complete-assignment`,
  LEARNING_PATH: `${API_BASE_URL}/api/learner/learning-path`,

  // Mentor Progress Endpoints
  MENTEES_PROGRESS: `${API_BASE_URL}/api/mentor/mentees-progress`,
  CREATE_SKILL_ASSIGNMENT: `${API_BASE_URL}/api/mentor/skill/create-assignment`,
  CREATED_ASSIGNMENTS: `${API_BASE_URL}/api/mentor/created-assignments`,

  // PDF Parser Endpoints
  PDF_UPLOAD_RESUME: `${API_BASE_URL}/api/pdf/upload-resume`,
  PDF_GET_RESUMES: `${API_BASE_URL}/api/pdf/resumes`,
  PDF_ANALYZE_RESUME: `${API_BASE_URL}/api/pdf/analyze-resume`,
  PDF_DELETE_RESUME: `${API_BASE_URL}/api/pdf/resume`,
  PDF_PROFILE_SUGGESTIONS: `${API_BASE_URL}/api/pdf/profile-suggestions`,
};

export const API_HEADERS = {
  "Content-Type": "application/json",
};

// AI Conversation Endpoints
export const AI_CONVERSATION_ENDPOINTS = {
  START_CONVERSATION: "/api/ai/ai-conversation",
  SAVE_RESPONSE: (conversationId) =>
    `/api/ai/ai-conversation/${conversationId}/response`,
  GET_ALL_CONVERSATIONS: "/api/ai/ai-conversations",
  GET_CONVERSATION: (conversationId) =>
    `/api/ai/ai-conversation/${conversationId}`,
  DELETE_CONVERSATION: (conversationId) =>
    `/api/ai/ai-conversation/${conversationId}`,
  CHAT: `${AI_CHAT_URL}/api/chat`,
};
