import { API_ENDPOINTS } from './config';

export const fetchMentorRequests = async () => {
  const token = localStorage.getItem('authToken');
  try {
    const response = await fetch(`${API_ENDPOINTS.BASE_URL}/mentor-requests`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch mentor requests');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching mentor requests:', error);
    throw error;
  }
};

export const acceptMentorRequest = async (appointmentId) => {
  const token = localStorage.getItem('authToken');
  try {
    const response = await fetch(`${API_ENDPOINTS.BASE_URL}/mentor-requests/${appointmentId}/accept`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to accept request');
    }

    return await response.json();
  } catch (error) {
    console.error('Error accepting request:', error);
    throw error;
  }
};

export const rejectMentorRequest = async (appointmentId) => {
  const token = localStorage.getItem('authToken');
  try {
    const response = await fetch(`${API_ENDPOINTS.BASE_URL}/mentor-requests/${appointmentId}/reject`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to reject request');
    }

    return await response.json();
  } catch (error) {
    console.error('Error rejecting request:', error);
    throw error;
  }
};

export const rescheduleMentorRequest = async (appointmentId, proposedDateTime, reason) => {
  const token = localStorage.getItem('authToken');
  try {
    const response = await fetch(`${API_ENDPOINTS.BASE_URL}/mentor-requests/${appointmentId}/reschedule`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        proposedDateTime,
        reason
      })
    });

    if (!response.ok) {
      throw new Error('Failed to reschedule request');
    }

    return await response.json();
  } catch (error) {
    console.error('Error rescheduling request:', error);
    throw error;
  }
}; 