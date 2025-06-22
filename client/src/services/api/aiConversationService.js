import { API_ENDPOINTS, AI_CONVERSATION_ENDPOINTS } from './config';
import { handleApiError } from '../../utils/errorUtils';

/**
 * Start or continue an AI conversation
 * @param {Object} params
 * @param {string} params.message - The user's message
 * @param {string} params.topic - The conversation topic
 * @param {string} params.skill - The related skill
 * @returns {Promise<Object>} The conversation data
 */
export const startAIConversation = async ({ message, topic, skill }) => {
  try {
    const token = localStorage.getItem('authToken');
    // Get AI response and create conversation in one call
    const response = await fetch('http://localhost:5274/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        messages: [{
          role: "user",
          content: message
        }],
        topic: topic || "Programming Basics",
        skill: skill || "Programming"
      })
    });

    if (!response.ok) {
      throw await handleApiError(response);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error starting AI conversation:', error);
    throw error;
  }
};

/**
 * Save user's message and get AI's response
 * @param {string} conversationId - The conversation ID
 * @param {string} message - The user's message
 * @param {Array} previousMessages - Previous messages in the conversation
 * @param {Object} conversationDetails - The conversation topic and skill
 * @returns {Promise<Object>} The updated conversation data
 */
export const saveAIResponse = async (conversationId, message, previousMessages = [], conversationDetails = {}) => {
  try {
    const token = localStorage.getItem('authToken');
    // Get AI response and save to conversation in one call
    const response = await fetch('http://localhost:5274/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        messages: [
          ...previousMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          {
            role: "user",
            content: message
          }
        ],
        conversationId: conversationId,
        topic: conversationDetails.topic || "Programming Basics",
        skill: conversationDetails.skill || "Programming"
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in conversation:', error);
    throw error;
  }
};

/**
 * Get all AI conversations for the current user
 * @returns {Promise<Array>} Array of conversation objects
 */
export const getAllAIConversations = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}${AI_CONVERSATION_ENDPOINTS.GET_ALL_CONVERSATIONS}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw await handleApiError(response);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching AI conversations:', error);
    throw error;
  }
};

/**
 * Get a specific AI conversation by ID
 * @param {string} conversationId - The conversation ID
 * @returns {Promise<Object>} The conversation data
 */
export const getAIConversation = async (conversationId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}${AI_CONVERSATION_ENDPOINTS.GET_CONVERSATION(conversationId)}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw await handleApiError(response);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching AI conversation:', error);
    throw error;
  }
};

/**
 * Delete an AI conversation
 * @param {string} conversationId - The conversation ID to delete
 * @returns {Promise<void>}
 */
export const deleteAIConversation = async (conversationId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(
      `${API_ENDPOINTS.BASE_URL}${AI_CONVERSATION_ENDPOINTS.DELETE_CONVERSATION(conversationId)}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw await handleApiError(response);
    }

    return true;
  } catch (error) {
    console.error('Error deleting AI conversation:', error);
    throw error;
  }
}; 