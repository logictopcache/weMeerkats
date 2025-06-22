export const SOCKET_SERVER_URL = 'http://localhost:5274';

export const socketConfig = {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
};

export const SOCKET_EVENTS = {
  // Common events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  
  // Notification events
  NEW_NOTIFICATION: 'newNotification',
  NEW_MENTOR_NOTIFICATION: 'newMentorNotification',
  NOTIFICATION_UPDATE: 'notificationUpdate',
  MENTOR_NOTIFICATION_UPDATE: 'mentorNotificationUpdate',
  NOTIFICATION_DELETE: 'notificationDelete',
  MENTOR_NOTIFICATION_DELETE: 'mentorNotificationDelete',
  
  // User status events
  USER_ONLINE: 'userOnline',
  USER_OFFLINE: 'userOffline'
}; 