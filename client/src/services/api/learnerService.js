import { API_ENDPOINTS } from './config';

export const fetchLearnerProfile = async (learnerId) => {
  const response = await fetch(`${API_ENDPOINTS.BASE_URL}/learner-profile/${learnerId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // Add any auth headers if needed
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch learner profile');
  }

  const data = await response.json();
  return data;
  }; 