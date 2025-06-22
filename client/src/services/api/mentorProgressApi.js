import { API_ENDPOINTS } from './config';

export const fetchMenteesProgress = async () => {
  const token = localStorage.getItem('authToken');
  try {
    const response = await fetch(API_ENDPOINTS.MENTEES_PROGRESS, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Failed to fetch mentees progress');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching mentees progress:', error);
    throw error;
  }
};

export const createSkillAssignment = async (assignmentData) => {
  const token = localStorage.getItem('authToken');
  try {
    const response = await fetch(API_ENDPOINTS.CREATE_SKILL_ASSIGNMENT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(assignmentData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Failed to create skill assignment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating skill assignment:', error);
    throw error;
  }
};

export const fetchCreatedAssignments = async () => {
  const token = localStorage.getItem('authToken');
  try {
    const response = await fetch(API_ENDPOINTS.CREATED_ASSIGNMENTS, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Failed to fetch created assignments');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching created assignments:', error);
    throw error;
  }
}; 