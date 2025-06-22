import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  startAIConversation,
  saveAIResponse,
  getAllAIConversations,
  getAIConversation,
  deleteAIConversation
} from '../services/api/aiConversationService';

const useAIConversation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);

  // Load all conversations
  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllAIConversations();
      // Check for success and conversations array in the response
      const conversationsData = Array.isArray(response?.conversations) ? response.conversations : [];
      setConversations(conversationsData);
      return conversationsData;
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to load conversations');
      // Set empty array on error
      setConversations([]);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load a specific conversation
  const loadConversation = useCallback(async (conversationId) => {
    if (!conversationId) {
      console.warn('No conversation ID provided to loadConversation');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await getAIConversation(conversationId);
      if (!response?.success || !response?.conversation) {
        throw new Error('Conversation not found');
      }
      setCurrentConversation(response.conversation);
      return response.conversation;
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to load conversation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Start or continue a conversation
  const startConversation = useCallback(async ({ message, topic, skill }) => {
    if (!message?.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await startAIConversation({ 
        message: message.trim(), 
        topic: topic?.trim() || 'General',
        skill: skill?.trim() || 'Programming'
      });
      
      // Create a conversation object if we only got an AI response
      const newConversation = response.conversation || {
        _id: Date.now().toString(), // Temporary ID
        messages: [
          {
            role: 'user',
            content: message.trim(),
            timestamp: new Date().toISOString()
          },
          {
            role: 'assistant',
            content: response.response,
            timestamp: new Date().toISOString()
          }
        ],
        topic: topic?.trim() || 'General',
        skill: skill?.trim() || 'Programming',
        createdAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString()
      };

      setCurrentConversation(newConversation);
      // Add new conversation to the list
      setConversations(prev => [newConversation, ...prev]);
      return newConversation;
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to start conversation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save AI's response
  const saveResponse = useCallback(async (conversationId, message) => {
    if (!conversationId) {
      console.error('No conversation ID provided to saveResponse');
      toast.error('Invalid conversation. Please try starting a new one.');
      return;
    }

    if (!message?.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Get previous messages and conversation details
      const previousMessages = currentConversation?.messages || [];
      const conversationDetails = {
        topic: currentConversation?.topic || "Programming Basics",
        skill: currentConversation?.skill || "Programming"
      };
      
      const result = await saveAIResponse(
        conversationId, 
        message.trim(),
        previousMessages,
        conversationDetails
      );
      
      // If we only got an AI response, update the conversation manually
      if (!result.conversation && result.response) {
        const updatedConversation = {
          ...currentConversation,
          messages: [
            ...previousMessages,
            {
              role: 'user',
              content: message.trim(),
              timestamp: new Date().toISOString()
            },
            {
              role: 'assistant',
              content: result.response,
              timestamp: new Date().toISOString()
            }
          ],
          lastUpdatedAt: new Date().toISOString(),
          topic: conversationDetails.topic,
          skill: conversationDetails.skill
        };

        setCurrentConversation(updatedConversation);
        // Update the conversation in the list
        setConversations(prev => 
          prev.map(conv => 
            conv._id === conversationId ? updatedConversation : conv
          )
        );
        return updatedConversation;
      }

      // If we got a full conversation object, use that
      if (result.conversation) {
        setCurrentConversation(result.conversation);
        // Update the conversation in the list
        setConversations(prev => 
          prev.map(conv => 
            conv._id === conversationId ? result.conversation : conv
          )
        );
        return result.conversation;
      }

      throw new Error('Invalid response format from server');
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to save response');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentConversation]);

  // Delete a conversation
  const deleteConversation = useCallback(async (conversationId) => {
    if (!conversationId) {
      console.error('No conversation ID provided to deleteConversation');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await deleteAIConversation(conversationId);
      setConversations(prev => prev.filter(conv => conv._id !== conversationId));
      if (currentConversation?._id === conversationId) {
        setCurrentConversation(null);
      }
      toast.success('Conversation deleted successfully');
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to delete conversation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentConversation]);

  // Clear current conversation
  const clearCurrentConversation = useCallback(() => {
    setCurrentConversation(null);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    conversations,
    currentConversation,
    startConversation,
    saveResponse,
    loadConversations,
    loadConversation,
    deleteConversation,
    clearCurrentConversation
  };
};

export default useAIConversation; 