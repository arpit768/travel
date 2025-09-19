/**
 * WebSocket Manager
 * Production-ready real-time communication system
 */

const { Server } = require('socket.io');
const Redis = require('ioredis');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class SocketManager {
    constructor() {
        this.io = null;
        this.redis = null;
        this.redisSubscriber = null;
        this.connectedUsers = new Map();
        this.rooms = new Map();
        this.messageHandlers = new Map();
    }

    /**
     * Initialize WebSocket server
     */
    initialize(server, options = {}) {
        // Initialize Socket.IO
        this.io = new Server(server, {
            cors: {
                origin: process.env.FRONTEND_URL || 'http://localhost:9000',
                credentials: true
            },
            pingTimeout: 60000,
            pingInterval: 25000,
            transports: ['websocket', 'polling'],
            ...options
        });

        // Initialize Redis for scaling across multiple servers
        if (process.env.REDIS_URL) {
            this.redis = new Redis(process.env.REDIS_URL);
            this.redisSubscriber = new Redis(process.env.REDIS_URL);

            // Subscribe to Redis channels
            this.setupRedisSubscriptions();
        }

        // Setup middleware
        this.setupMiddleware();

        // Setup connection handlers
        this.setupConnectionHandlers();

        // Setup message handlers
        this.setupMessageHandlers();

        console.log('✅ WebSocket server initialized');
        return this.io;
    }

    /**
     * Setup authentication middleware
     */
    setupMiddleware() {
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

                if (!token) {
                    return next(new Error('Authentication required'));
                }

                // Verify JWT token
                const decoded = jwt.verify(token, process.env.JWT_SECRET);

                // Get user from database
                const user = await User.findById(decoded.userId).select('-password');

                if (!user) {
                    return next(new Error('User not found'));
                }

                if (!user.isActive) {
                    return next(new Error('Account is deactivated'));
                }

                // Attach user to socket
                socket.userId = user._id.toString();
                socket.user = user;

                next();
            } catch (error) {
                console.error('Socket authentication error:', error);
                next(new Error('Authentication failed'));
            }
        });
    }

    /**
     * Setup Redis subscriptions for multi-server support
     */
    setupRedisSubscriptions() {
        // Subscribe to broadcast channel
        this.redisSubscriber.subscribe('broadcast');
        this.redisSubscriber.subscribe('notifications');
        this.redisSubscriber.subscribe('messages');

        this.redisSubscriber.on('message', (channel, message) => {
            try {
                const data = JSON.parse(message);

                switch (channel) {
                    case 'broadcast':
                        this.handleRedisBroadcast(data);
                        break;
                    case 'notifications':
                        this.handleRedisNotification(data);
                        break;
                    case 'messages':
                        this.handleRedisMessage(data);
                        break;
                }
            } catch (error) {
                console.error('Redis message handling error:', error);
            }
        });
    }

    /**
     * Setup connection event handlers
     */
    setupConnectionHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`User connected: ${socket.userId}`);

            // Add user to connected users map
            this.connectedUsers.set(socket.userId, {
                socketId: socket.id,
                user: socket.user,
                connectedAt: new Date()
            });

            // Join user to their personal room
            socket.join(`user:${socket.userId}`);

            // Join role-based room
            socket.join(`role:${socket.user.role}`);

            // Emit connection success
            socket.emit('connected', {
                userId: socket.userId,
                socketId: socket.id
            });

            // Broadcast user online status
            this.broadcastUserStatus(socket.userId, 'online');

            // Handle disconnection
            socket.on('disconnect', (reason) => {
                console.log(`User disconnected: ${socket.userId} - ${reason}`);

                // Remove from connected users
                this.connectedUsers.delete(socket.userId);

                // Broadcast user offline status
                this.broadcastUserStatus(socket.userId, 'offline');

                // Clean up rooms
                this.cleanupUserRooms(socket);
            });

            // Handle errors
            socket.on('error', (error) => {
                console.error(`Socket error for user ${socket.userId}:`, error);
            });

            // Setup custom event handlers
            this.setupSocketEventHandlers(socket);
        });
    }

    /**
     * Setup message handlers for different events
     */
    setupMessageHandlers() {
        // Real-time chat messages
        this.registerHandler('chat:message', this.handleChatMessage.bind(this));

        // Booking notifications
        this.registerHandler('booking:update', this.handleBookingUpdate.bind(this));

        // Guide/Porter location updates
        this.registerHandler('location:update', this.handleLocationUpdate.bind(this));

        // Live support
        this.registerHandler('support:message', this.handleSupportMessage.bind(this));

        // Activity tracking
        this.registerHandler('activity:track', this.handleActivityTracking.bind(this));
    }

    /**
     * Setup socket-specific event handlers
     */
    setupSocketEventHandlers(socket) {
        // Join/leave rooms
        socket.on('join:room', (roomName) => this.handleJoinRoom(socket, roomName));
        socket.on('leave:room', (roomName) => this.handleLeaveRoom(socket, roomName));

        // Handle custom events
        this.messageHandlers.forEach((handler, event) => {
            socket.on(event, (data) => handler(socket, data));
        });

        // Typing indicators
        socket.on('typing:start', (data) => this.handleTypingStart(socket, data));
        socket.on('typing:stop', (data) => this.handleTypingStop(socket, data));

        // Presence updates
        socket.on('presence:update', (data) => this.handlePresenceUpdate(socket, data));

        // WebRTC signaling for video calls
        socket.on('webrtc:offer', (data) => this.handleWebRTCOffer(socket, data));
        socket.on('webrtc:answer', (data) => this.handleWebRTCAnswer(socket, data));
        socket.on('webrtc:ice-candidate', (data) => this.handleICECandidate(socket, data));
    }

    /**
     * Register a message handler
     */
    registerHandler(event, handler) {
        this.messageHandlers.set(event, handler);
    }

    /**
     * Handle chat messages
     */
    async handleChatMessage(socket, data) {
        try {
            const { recipientId, message, type = 'text' } = data;

            // Validate message
            if (!recipientId || !message) {
                return socket.emit('error', { message: 'Invalid message data' });
            }

            // Save message to database (implement Message model)
            const savedMessage = {
                id: Date.now().toString(),
                senderId: socket.userId,
                recipientId,
                message,
                type,
                timestamp: new Date(),
                read: false
            };

            // Send to recipient if online
            this.io.to(`user:${recipientId}`).emit('chat:message', savedMessage);

            // Send confirmation to sender
            socket.emit('chat:message:sent', savedMessage);

            // Publish to Redis for multi-server support
            if (this.redis) {
                this.redis.publish('messages', JSON.stringify({
                    type: 'chat',
                    data: savedMessage
                }));
            }
        } catch (error) {
            console.error('Chat message error:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    }

    /**
     * Handle booking updates
     */
    async handleBookingUpdate(socket, data) {
        try {
            const { bookingId, status, details } = data;

            // Emit to relevant users
            const notification = {
                type: 'booking:update',
                bookingId,
                status,
                details,
                timestamp: new Date()
            };

            // Notify customer
            if (details.customerId) {
                this.io.to(`user:${details.customerId}`).emit('notification', notification);
            }

            // Notify guide/porter
            if (details.guideId) {
                this.io.to(`user:${details.guideId}`).emit('notification', notification);
            }

            // Notify admins
            this.io.to('role:admin').emit('notification', notification);
        } catch (error) {
            console.error('Booking update error:', error);
            socket.emit('error', { message: 'Failed to update booking' });
        }
    }

    /**
     * Handle location updates
     */
    async handleLocationUpdate(socket, data) {
        try {
            const { latitude, longitude, altitude, accuracy } = data;

            // Validate location data
            if (!latitude || !longitude) {
                return socket.emit('error', { message: 'Invalid location data' });
            }

            // Update user's location in Redis
            if (this.redis) {
                await this.redis.setex(
                    `location:${socket.userId}`,
                    300, // 5 minutes TTL
                    JSON.stringify({
                        latitude,
                        longitude,
                        altitude,
                        accuracy,
                        timestamp: new Date()
                    })
                );
            }

            // Broadcast to relevant parties (e.g., customers tracking their guide)
            const trackingRooms = await this.getTrackingRooms(socket.userId);
            trackingRooms.forEach(room => {
                this.io.to(room).emit('location:update', {
                    userId: socket.userId,
                    latitude,
                    longitude,
                    altitude,
                    accuracy,
                    timestamp: new Date()
                });
            });
        } catch (error) {
            console.error('Location update error:', error);
            socket.emit('error', { message: 'Failed to update location' });
        }
    }

    /**
     * Handle support messages
     */
    async handleSupportMessage(socket, data) {
        try {
            const { message, priority = 'normal' } = data;

            const supportMessage = {
                id: Date.now().toString(),
                userId: socket.userId,
                userInfo: {
                    name: socket.user.fullName,
                    email: socket.user.email
                },
                message,
                priority,
                timestamp: new Date()
            };

            // Send to support team
            this.io.to('role:support').emit('support:new-message', supportMessage);
            this.io.to('role:admin').emit('support:new-message', supportMessage);

            // Confirm to user
            socket.emit('support:message:received', {
                messageId: supportMessage.id,
                status: 'received'
            });
        } catch (error) {
            console.error('Support message error:', error);
            socket.emit('error', { message: 'Failed to send support message' });
        }
    }

    /**
     * Handle activity tracking
     */
    async handleActivityTracking(socket, data) {
        try {
            const { action, details } = data;

            // Store activity in Redis for analytics
            if (this.redis) {
                const activity = {
                    userId: socket.userId,
                    action,
                    details,
                    timestamp: new Date()
                };

                await this.redis.lpush(
                    'activities',
                    JSON.stringify(activity)
                );

                // Trim to keep last 1000 activities
                await this.redis.ltrim('activities', 0, 999);
            }
        } catch (error) {
            console.error('Activity tracking error:', error);
        }
    }

    /**
     * Handle typing indicators
     */
    handleTypingStart(socket, data) {
        const { recipientId, conversationId } = data;

        if (recipientId) {
            this.io.to(`user:${recipientId}`).emit('typing:start', {
                userId: socket.userId,
                conversationId
            });
        }
    }

    handleTypingStop(socket, data) {
        const { recipientId, conversationId } = data;

        if (recipientId) {
            this.io.to(`user:${recipientId}`).emit('typing:stop', {
                userId: socket.userId,
                conversationId
            });
        }
    }

    /**
     * Handle presence updates
     */
    handlePresenceUpdate(socket, data) {
        const { status, customMessage } = data;

        // Update user's presence
        const userInfo = this.connectedUsers.get(socket.userId);
        if (userInfo) {
            userInfo.status = status;
            userInfo.customMessage = customMessage;
        }

        // Broadcast to relevant users
        socket.broadcast.emit('presence:update', {
            userId: socket.userId,
            status,
            customMessage,
            timestamp: new Date()
        });
    }

    /**
     * WebRTC handlers for video calls
     */
    handleWebRTCOffer(socket, data) {
        const { targetUserId, offer, callType } = data;

        this.io.to(`user:${targetUserId}`).emit('webrtc:offer', {
            callerId: socket.userId,
            callerInfo: {
                name: socket.user.fullName,
                profileImage: socket.user.profileImage
            },
            offer,
            callType
        });
    }

    handleWebRTCAnswer(socket, data) {
        const { targetUserId, answer } = data;

        this.io.to(`user:${targetUserId}`).emit('webrtc:answer', {
            answererId: socket.userId,
            answer
        });
    }

    handleICECandidate(socket, data) {
        const { targetUserId, candidate } = data;

        this.io.to(`user:${targetUserId}`).emit('webrtc:ice-candidate', {
            senderId: socket.userId,
            candidate
        });
    }

    /**
     * Handle room management
     */
    handleJoinRoom(socket, roomName) {
        // Validate room access
        if (this.canJoinRoom(socket, roomName)) {
            socket.join(roomName);

            // Track room membership
            if (!this.rooms.has(roomName)) {
                this.rooms.set(roomName, new Set());
            }
            this.rooms.get(roomName).add(socket.userId);

            // Notify room members
            socket.to(roomName).emit('room:user-joined', {
                userId: socket.userId,
                userInfo: {
                    name: socket.user.fullName,
                    profileImage: socket.user.profileImage
                }
            });

            socket.emit('room:joined', { roomName });
        } else {
            socket.emit('error', { message: 'Access denied to room' });
        }
    }

    handleLeaveRoom(socket, roomName) {
        socket.leave(roomName);

        // Update room membership
        if (this.rooms.has(roomName)) {
            this.rooms.get(roomName).delete(socket.userId);

            if (this.rooms.get(roomName).size === 0) {
                this.rooms.delete(roomName);
            }
        }

        // Notify room members
        socket.to(roomName).emit('room:user-left', {
            userId: socket.userId
        });

        socket.emit('room:left', { roomName });
    }

    /**
     * Utility methods
     */
    canJoinRoom(socket, roomName) {
        // Implement room access control logic
        // For now, allow all authenticated users
        return true;
    }

    async getTrackingRooms(userId) {
        // Get rooms where this user's location is being tracked
        // This would query the database for active tracking sessions
        return [`tracking:${userId}`];
    }

    broadcastUserStatus(userId, status) {
        this.io.emit('user:status', {
            userId,
            status,
            timestamp: new Date()
        });
    }

    cleanupUserRooms(socket) {
        // Clean up room memberships
        this.rooms.forEach((members, roomName) => {
            if (members.has(socket.userId)) {
                members.delete(socket.userId);

                if (members.size === 0) {
                    this.rooms.delete(roomName);
                }

                // Notify room members
                socket.to(roomName).emit('room:user-left', {
                    userId: socket.userId
                });
            }
        });
    }

    /**
     * Redis broadcast handlers
     */
    handleRedisBroadcast(data) {
        this.io.emit(data.event, data.payload);
    }

    handleRedisNotification(data) {
        if (data.targetUserId) {
            this.io.to(`user:${data.targetUserId}`).emit('notification', data.notification);
        } else if (data.targetRole) {
            this.io.to(`role:${data.targetRole}`).emit('notification', data.notification);
        }
    }

    handleRedisMessage(data) {
        if (data.type === 'chat' && data.data.recipientId) {
            this.io.to(`user:${data.data.recipientId}`).emit('chat:message', data.data);
        }
    }

    /**
     * Public API methods
     */
    sendNotificationToUser(userId, notification) {
        this.io.to(`user:${userId}`).emit('notification', notification);

        // Publish to Redis for multi-server support
        if (this.redis) {
            this.redis.publish('notifications', JSON.stringify({
                targetUserId: userId,
                notification
            }));
        }
    }

    sendNotificationToRole(role, notification) {
        this.io.to(`role:${role}`).emit('notification', notification);

        // Publish to Redis
        if (this.redis) {
            this.redis.publish('notifications', JSON.stringify({
                targetRole: role,
                notification
            }));
        }
    }

    broadcastToAll(event, data) {
        this.io.emit(event, data);

        // Publish to Redis
        if (this.redis) {
            this.redis.publish('broadcast', JSON.stringify({
                event,
                payload: data
            }));
        }
    }

    isUserOnline(userId) {
        return this.connectedUsers.has(userId);
    }

    getOnlineUsers() {
        return Array.from(this.connectedUsers.entries()).map(([userId, info]) => ({
            userId,
            ...info
        }));
    }

    getRoomMembers(roomName) {
        return this.rooms.has(roomName) ? Array.from(this.rooms.get(roomName)) : [];
    }

    /**
     * Cleanup and shutdown
     */
    shutdown() {
        // Close all connections
        this.io.close();

        // Close Redis connections
        if (this.redis) {
            this.redis.quit();
            this.redisSubscriber.quit();
        }

        console.log('WebSocket server shut down');
    }
}

// Create singleton instance
const socketManager = new SocketManager();

module.exports = socketManager;