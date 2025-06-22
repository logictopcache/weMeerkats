import axios from 'axios';
import { API_ENDPOINTS } from './config';

// Get all skill categories
export const fetchSkillCategories = async () => {
  try {
    const response = await axios.get(API_ENDPOINTS.SKILL_CATEGORIES);
    return response.data.categories;
  } catch (error) {
    console.error('Error fetching skill categories:', error);
    throw error;
  }
};

// Get learner's learning path
export const fetchLearnerPath = async (learnerId) => {
  const token = localStorage.getItem('authToken');
  try {
    const response = await axios.get(
      `${API_ENDPOINTS.BASE_URL}/api/learner/learning-path/${learnerId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching learner path:', error);
    throw error;
  }
};

// Get assignments and progress for a specific skill
export const fetchSkillAssignments = async (skillName) => {
  const token = localStorage.getItem('authToken');
  try {
    const response = await axios.get(
      `${API_ENDPOINTS.SKILL_ASSIGNMENTS}/${skillName}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching skill assignments:', error);
    throw error;
  }
};

// Get all completed assignments
export const fetchAllCompletedAssignments = async () => {
  const token = localStorage.getItem('authToken');
  try {
    const response = await axios.get(
      API_ENDPOINTS.COMPLETED_ASSIGNMENTS,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching completed assignments:', error);
    throw error;
  }
};

// Get completed assignments for a specific skill
export const fetchSkillCompletedAssignments = async (skillName) => {
  const token = localStorage.getItem('authToken');
  try {
    const response = await axios.get(
      `${API_ENDPOINTS.COMPLETED_ASSIGNMENTS}/${skillName}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching skill completed assignments:', error);
    throw error;
  }
};

// Mark an assignment as completed
export const completeAssignment = async (assignmentId) => {
  const token = localStorage.getItem('authToken');
  try {
    const response = await axios.post(
      `${API_ENDPOINTS.COMPLETE_ASSIGNMENT}/${assignmentId}`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error completing assignment:', error);
    throw error;
  }
};

// Add or update learning path
export const updateLearningPath = async (learningPathData) => {
  const token = localStorage.getItem('authToken');
  try {
    const response = await axios.post(
      API_ENDPOINTS.LEARNING_PATH,
      learningPathData,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating learning path:', error);
    throw error;
  }
};

// Get notifications for upcoming deadlines and assignments
export const fetchNotifications = async () => {
  const token = localStorage.getItem('authToken');
  try {
    const response = await axios.get(
      `${API_ENDPOINTS.BASE_URL}/api/learner/notifications`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  const token = localStorage.getItem('authToken');
  try {
    const response = await axios.post(
      `${API_ENDPOINTS.BASE_URL}/api/learner/notifications/${notificationId}/read`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (preferences) => {
  const token = localStorage.getItem('authToken');
  try {
    const response = await axios.put(
      `${API_ENDPOINTS.BASE_URL}/api/learner/notification-preferences`,
      preferences,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
}; 

