import { useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { SOCKET_EVENTS } from '../utils/socketUtils';
import { fetchNotifications, markNotificationAsRead } from '../services/api/notificationService';
import { fetchMentorNotifications, markMentorNotificationAsRead } from '../services/api/mentorNotificationService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiBell, FiMessageSquare } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export const useNotifications = (isMentor = false) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [chatNotifications, setChatNotifications] = useState({});  // { roomId: unreadCount }
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { socket, connected } = useSocket();
  const navigate = useNavigate();

  const handleNotificationClick = (notification) => {
    if (notification.type === 'ASSIGNMENT') {
      // Extract skill name from the message
      const match = notification.message.match(/in\s+(\w+)$/);
      if (match && match[1]) {
        const skillName = match[1];
        navigate(`/mentee/progress/skill/${skillName}`);
      }
    } else if (notification.type === 'APPOINTMENT_ACCEPTED') {
      navigate('/mentee/calendar');
    } else if (notification.type === 'NEW_MESSAGE') {
      // Navigate directly to messages without room ID
      navigate(`/${isMentor ? 'mentor' : 'mentee'}/messages`);
    }
  };

  const showNotificationToast = (notification) => {
    const Icon = notification.type === 'NEW_MESSAGE' ? FiMessageSquare : FiBell;
    
    toast.dark(
      <div 
        className="flex items-center gap-3 cursor-pointer" 
        onClick={() => {
          markAsRead(notification._id);
          handleNotificationClick(notification);
        }}
      >
        <div className="w-8 h-8 flex items-center justify-center bg-primary-color rounded-full flex-shrink-0">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="font-medium">
            {notification.type === 'NEW_MESSAGE' ? 'New Message' : 'New Notification'}
          </div>
          <div className="text-sm text-gray-300">{notification.message}</div>
        </div>
      </div>,
      {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: "!bg-[#111936] !text-white",
      }
    );
  };

  const loadNotifications = async () => {
    try {
      const data = await (isMentor ? fetchMentorNotifications() : fetchNotifications());
      setNotifications(data);
      
      // Separate chat notifications and regular notifications
      const chatMsgs = data.filter(n => n.type === 'NEW_MESSAGE' && !n.isRead);
      const regularNotifs = data.filter(n => n.type !== 'NEW_MESSAGE' && !n.isRead);
      
      // Update unread counts
      setUnreadCount(regularNotifs.length);
      setUnreadChatCount(chatMsgs.length);
      
      // Group chat notifications by roomId
      const chatCounts = chatMsgs.reduce((acc, msg) => {
        acc[msg.roomId] = (acc[msg.roomId] || 0) + 1;
        return acc;
      }, {});
      setChatNotifications(chatCounts);
      
      setError(null);
    } catch (err) {
      setError('Failed to load notifications');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [isMentor]);

  useEffect(() => {
    if (!socket || !connected) return;

    const newNotificationEvent = isMentor ? SOCKET_EVENTS.NEW_MENTOR_NOTIFICATION : SOCKET_EVENTS.NEW_NOTIFICATION;
    const updateEvent = isMentor ? SOCKET_EVENTS.MENTOR_NOTIFICATION_UPDATE : SOCKET_EVENTS.NOTIFICATION_UPDATE;
    const deleteEvent = isMentor ? SOCKET_EVENTS.MENTOR_NOTIFICATION_DELETE : SOCKET_EVENTS.NOTIFICATION_DELETE;

    // Listen for new notifications
    socket.on(newNotificationEvent, (notification) => {
      setNotifications(prev => [notification, ...prev]);
      
      if (!notification.isRead) {
        if (notification.type === 'NEW_MESSAGE') {
          setUnreadChatCount(prev => prev + 1);
          setChatNotifications(prev => ({
            ...prev,
            [notification.roomId]: (prev[notification.roomId] || 0) + 1
          }));
        } else {
          setUnreadCount(prev => prev + 1);
        }
      }
      
      showNotificationToast(notification);
    });

    // Listen for chat messages
    socket.on('receiveMessage', ({ roomId, userId, message }) => {
      const notification = {
        _id: Date.now().toString(),
        type: 'NEW_MESSAGE',
        message: message,
        roomId: roomId,
        isRead: false,
        createdAt: new Date().toISOString()
      };
      
      setNotifications(prev => [notification, ...prev]);
      setUnreadChatCount(prev => prev + 1);
      setChatNotifications(prev => ({
        ...prev,
        [roomId]: (prev[roomId] || 0) + 1
      }));
      
      showNotificationToast(notification);
    });

    // Listen for notification updates
    socket.on(updateEvent, ({ notificationId, updates }) => {
      setNotifications(prev => {
        const notification = prev.find(n => n._id === notificationId);
        if (notification && !notification.isRead && updates.isRead) {
          if (notification.type === 'NEW_MESSAGE') {
            setUnreadChatCount(count => Math.max(0, count - 1));
            setChatNotifications(prev => {
              const newCounts = { ...prev };
              newCounts[notification.roomId] = Math.max(0, (newCounts[notification.roomId] || 1) - 1);
              return newCounts;
            });
          } else {
            setUnreadCount(count => Math.max(0, count - 1));
          }
        }
        
        return prev.map(n => 
          n._id === notificationId 
            ? { ...n, ...updates }
            : n
        );
      });
    });

    // Listen for notification deletions
    socket.on(deleteEvent, (notificationId) => {
      setNotifications(prev => {
        const notification = prev.find(n => n._id === notificationId);
        if (notification && !notification.isRead) {
          if (notification.type === 'NEW_MESSAGE') {
            setUnreadChatCount(count => Math.max(0, count - 1));
            setChatNotifications(prev => {
              const newCounts = { ...prev };
              newCounts[notification.roomId] = Math.max(0, (newCounts[notification.roomId] || 1) - 1);
              return newCounts;
            });
          } else {
            setUnreadCount(count => Math.max(0, count - 1));
          }
        }
        return prev.filter(n => n._id !== notificationId);
      });
    });

    return () => {
      socket.off(newNotificationEvent);
      socket.off('receiveMessage');
      socket.off(updateEvent);
      socket.off(deleteEvent);
    };
  }, [socket, connected, isMentor]);

  const markAsRead = async (notificationId) => {
    try {
      await (isMentor ? markMentorNotificationAsRead(notificationId) : markNotificationAsRead(notificationId));
      
      // Find the notification before updating state
      const notification = notifications.find(n => n._id === notificationId);
      
      if (notification && !notification.isRead) {
        if (notification.type === 'NEW_MESSAGE') {
          setUnreadChatCount(count => Math.max(0, count - 1));
          setChatNotifications(prev => {
            const newCounts = { ...prev };
            newCounts[notification.roomId] = Math.max(0, (newCounts[notification.roomId] || 1) - 1);
            return newCounts;
          });
        } else {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }

      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId 
            ? { ...n, isRead: true }
            : n
        )
      );

      // Handle navigation after marking as read
      if (notification) {
        handleNotificationClick(notification);
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  return {
    notifications,
    unreadCount,
    unreadChatCount,
    chatNotifications,
    markAsRead,
    isLoading,
    error,
    refresh: loadNotifications,
    handleNotificationClick
  };
}; 