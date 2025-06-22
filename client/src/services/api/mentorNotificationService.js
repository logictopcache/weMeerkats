import { API_ENDPOINTS } from './config';

export const fetchMentorNotifications = async () => {
  const token = localStorage.getItem('authToken');
  try {
    const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/notifications/notifications`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    const { data, success } = await response.json();
    if (!success) {
      throw new Error('Failed to fetch notifications');
    }
    return data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

export const markMentorNotificationAsRead = async (notificationId) => {
  const token = localStorage.getItem('authToken');
  try {
    const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/notifications/notifications/${notificationId}/read`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }

    const { success } = await response.json();
    if (!success) {
      throw new Error('Failed to mark notification as read');
    }
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const updateMentorNotificationPreferences = async (preferences) => {
  const token = localStorage.getItem('authToken');
  try {
    const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/notifications/notification-preferences`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferences)
    });

    if (!response.ok) {
      throw new Error('Failed to update notification preferences');
    }

    const { success } = await response.json();
    if (!success) {
      throw new Error('Failed to update notification preferences');
    }
    return true;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
}; 