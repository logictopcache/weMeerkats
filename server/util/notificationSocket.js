const { Notification } = require('../models/notification');

class NotificationSocket {
    constructor(io) {
        this.io = io;
        this.userSockets = new Map(); // Map to store user socket connections
    }

    // Initialize socket handlers for notifications
    initialize() {
        this.io.on('connection', (socket) => {
            if (socket.user) {
                // Store user's socket connection
                this.userSockets.set(socket.user._id.toString(), socket);
                
                // Join a personal room for notifications
                socket.join(`notifications:${socket.user._id}`);

                // Handle disconnection
                socket.on('disconnect', () => {
                    this.userSockets.delete(socket.user._id.toString());
                });

                // Handle notification read status
                socket.on('markNotificationRead', async (notificationId) => {
                    try {
                        const notification = await Notification.findByIdAndUpdate(
                            notificationId,
                            { isRead: true },
                            { new: true }
                        );
                        if (notification) {
                            socket.emit('notificationUpdated', notification);
                        }
                    } catch (error) {
                        console.error('Error marking notification as read:', error);
                    }
                });
            }
        });
    }

    // Send notification to specific user
    sendNotification(userId, notification) {
        this.io.to(`notifications:${userId}`).emit('newNotification', notification);
    }

    // Send notification to multiple users
    broadcastNotification(userIds, notification) {
        userIds.forEach(userId => {
            this.sendNotification(userId, notification);
        });
    }
}

module.exports = NotificationSocket; 