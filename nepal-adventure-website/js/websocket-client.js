/**
 * WebSocket Client
 * Real-time communication for Nepal Adventures
 */

class WebSocketClient {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.eventHandlers = new Map();
        this.messageQueue = [];
        this.userId = null;
        this.token = null;
    }

    /**
     * Initialize WebSocket connection
     */
    async initialize(token, options = {}) {
        if (this.connected) {
            console.log('WebSocket already connected');
            return;
        }

        this.token = token;

        // Load Socket.IO client library dynamically
        if (typeof io === 'undefined') {
            await this.loadSocketIO();
        }

        // Connect to server
        const serverUrl = options.serverUrl || 'http://localhost:5000';

        this.socket = io(serverUrl, {
            auth: {
                token: this.token
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: this.maxReconnectAttempts,
            reconnectionDelay: this.reconnectDelay,
            ...options
        });

        this.setupEventHandlers();
        this.setupSystemHandlers();
    }

    /**
     * Load Socket.IO client library
     */
    loadSocketIO() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.socket.io/4.7.2/socket.io.min.js';
            script.async = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Setup system event handlers
     */
    setupSystemHandlers() {
        // Connection events
        this.socket.on('connect', () => {
            console.log('✅ WebSocket connected');
            this.connected = true;
            this.reconnectAttempts = 0;

            // Process queued messages
            this.processMessageQueue();

            // Notify UI
            this.showNotification('success', 'Connected', 'Real-time connection established');

            // Trigger connected callback
            this.triggerEvent('connected', { socketId: this.socket.id });
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ WebSocket disconnected:', reason);
            this.connected = false;

            // Notify UI
            if (reason === 'io server disconnect') {
                this.showNotification('error', 'Disconnected', 'Server terminated the connection');
            }

            this.triggerEvent('disconnected', { reason });
        });

        this.socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error.message);
            this.reconnectAttempts++;

            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                this.showNotification('error', 'Connection Failed', 'Unable to establish real-time connection');
            }
        });

        // Authentication response
        this.socket.on('connected', (data) => {
            this.userId = data.userId;
            console.log('User authenticated:', data.userId);
        });

        // Error handling
        this.socket.on('error', (error) => {
            console.error('WebSocket error:', error);
            this.showNotification('error', 'Error', error.message || 'An error occurred');
        });
    }

    /**
     * Setup application event handlers
     */
    setupEventHandlers() {
        // Chat messages
        this.socket.on('chat:message', (data) => {
            this.handleChatMessage(data);
        });

        this.socket.on('chat:message:sent', (data) => {
            this.handleMessageSent(data);
        });

        // Notifications
        this.socket.on('notification', (data) => {
            this.handleNotification(data);
        });

        // Booking updates
        this.socket.on('booking:update', (data) => {
            this.handleBookingUpdate(data);
        });

        // Location updates
        this.socket.on('location:update', (data) => {
            this.handleLocationUpdate(data);
        });

        // Support messages
        this.socket.on('support:message:received', (data) => {
            this.handleSupportResponse(data);
        });

        this.socket.on('support:reply', (data) => {
            this.handleSupportReply(data);
        });

        // Typing indicators
        this.socket.on('typing:start', (data) => {
            this.handleTypingStart(data);
        });

        this.socket.on('typing:stop', (data) => {
            this.handleTypingStop(data);
        });

        // Presence updates
        this.socket.on('presence:update', (data) => {
            this.handlePresenceUpdate(data);
        });

        this.socket.on('user:status', (data) => {
            this.handleUserStatus(data);
        });

        // Room events
        this.socket.on('room:joined', (data) => {
            console.log('Joined room:', data.roomName);
            this.triggerEvent('room:joined', data);
        });

        this.socket.on('room:user-joined', (data) => {
            this.handleUserJoinedRoom(data);
        });

        this.socket.on('room:user-left', (data) => {
            this.handleUserLeftRoom(data);
        });

        // WebRTC events for video calls
        this.socket.on('webrtc:offer', (data) => {
            this.handleIncomingCall(data);
        });

        this.socket.on('webrtc:answer', (data) => {
            this.handleCallAnswer(data);
        });

        this.socket.on('webrtc:ice-candidate', (data) => {
            this.handleICECandidate(data);
        });
    }

    /**
     * Message handlers
     */
    handleChatMessage(data) {
        console.log('New message:', data);

        // Display message in UI
        this.displayChatMessage(data);

        // Show notification if page is not visible
        if (document.hidden) {
            this.showDesktopNotification('New Message', data.message, data.senderInfo?.profileImage);
        }

        // Play notification sound
        this.playNotificationSound();

        this.triggerEvent('chat:message', data);
    }

    handleMessageSent(data) {
        console.log('Message sent:', data);
        this.triggerEvent('chat:message:sent', data);
    }

    handleNotification(data) {
        console.log('Notification:', data);

        // Display notification based on type
        switch (data.type) {
            case 'booking:update':
                this.showNotification('info', 'Booking Update', data.details?.message || 'Your booking has been updated');
                break;
            case 'payment:success':
                this.showNotification('success', 'Payment Successful', 'Your payment has been processed');
                break;
            case 'review:new':
                this.showNotification('info', 'New Review', 'You have received a new review');
                break;
            default:
                this.showNotification('info', 'Notification', data.message || 'You have a new notification');
        }

        this.triggerEvent('notification', data);
    }

    handleBookingUpdate(data) {
        console.log('Booking update:', data);

        // Update booking UI
        this.updateBookingStatus(data.bookingId, data.status);

        // Show notification
        const statusMessages = {
            'confirmed': 'Your booking has been confirmed!',
            'cancelled': 'Your booking has been cancelled',
            'completed': 'Your adventure has been completed!',
            'in_progress': 'Your adventure has started!'
        };

        this.showNotification(
            data.status === 'cancelled' ? 'warning' : 'success',
            'Booking Update',
            statusMessages[data.status] || `Booking status: ${data.status}`
        );

        this.triggerEvent('booking:update', data);
    }

    handleLocationUpdate(data) {
        console.log('Location update:', data);

        // Update map if visible
        if (window.mapManager) {
            window.mapManager.updateUserLocation(data.userId, {
                lat: data.latitude,
                lng: data.longitude
            });
        }

        this.triggerEvent('location:update', data);
    }

    handleSupportResponse(data) {
        console.log('Support message received:', data);
        this.showNotification('success', 'Support', 'Your message has been received');
        this.triggerEvent('support:response', data);
    }

    handleSupportReply(data) {
        console.log('Support reply:', data);
        this.displaySupportReply(data);
        this.showNotification('info', 'Support Reply', 'You have a new reply from support');
        this.triggerEvent('support:reply', data);
    }

    handleTypingStart(data) {
        this.showTypingIndicator(data.userId, data.conversationId);
        this.triggerEvent('typing:start', data);
    }

    handleTypingStop(data) {
        this.hideTypingIndicator(data.userId, data.conversationId);
        this.triggerEvent('typing:stop', data);
    }

    handlePresenceUpdate(data) {
        this.updateUserPresence(data.userId, data.status);
        this.triggerEvent('presence:update', data);
    }

    handleUserStatus(data) {
        this.updateUserOnlineStatus(data.userId, data.status);
        this.triggerEvent('user:status', data);
    }

    handleUserJoinedRoom(data) {
        console.log('User joined room:', data);
        this.triggerEvent('room:user-joined', data);
    }

    handleUserLeftRoom(data) {
        console.log('User left room:', data);
        this.triggerEvent('room:user-left', data);
    }

    handleIncomingCall(data) {
        console.log('Incoming call:', data);

        // Show incoming call UI
        this.showIncomingCall(data.callerInfo, data.callType);

        // Play ringtone
        this.playRingtone();

        this.triggerEvent('call:incoming', data);
    }

    handleCallAnswer(data) {
        console.log('Call answered:', data);
        this.triggerEvent('call:answered', data);
    }

    handleICECandidate(data) {
        console.log('ICE candidate:', data);
        this.triggerEvent('webrtc:ice-candidate', data);
    }

    /**
     * Public API methods
     */

    // Send chat message
    sendMessage(recipientId, message, type = 'text') {
        if (!this.connected) {
            this.queueMessage('chat:message', { recipientId, message, type });
            return;
        }

        this.socket.emit('chat:message', {
            recipientId,
            message,
            type,
            timestamp: new Date()
        });
    }

    // Join a room
    joinRoom(roomName) {
        if (!this.connected) {
            this.queueMessage('join:room', roomName);
            return;
        }

        this.socket.emit('join:room', roomName);
    }

    // Leave a room
    leaveRoom(roomName) {
        if (this.connected) {
            this.socket.emit('leave:room', roomName);
        }
    }

    // Send support message
    sendSupportMessage(message, priority = 'normal') {
        if (!this.connected) {
            this.queueMessage('support:message', { message, priority });
            return;
        }

        this.socket.emit('support:message', {
            message,
            priority,
            timestamp: new Date()
        });
    }

    // Update location
    sendLocationUpdate(location) {
        if (!this.connected) {
            return;
        }

        this.socket.emit('location:update', {
            latitude: location.latitude,
            longitude: location.longitude,
            altitude: location.altitude,
            accuracy: location.accuracy,
            timestamp: new Date()
        });
    }

    // Typing indicators
    startTyping(recipientId, conversationId) {
        if (this.connected) {
            this.socket.emit('typing:start', { recipientId, conversationId });
        }
    }

    stopTyping(recipientId, conversationId) {
        if (this.connected) {
            this.socket.emit('typing:stop', { recipientId, conversationId });
        }
    }

    // Update presence
    updatePresence(status, customMessage) {
        if (this.connected) {
            this.socket.emit('presence:update', { status, customMessage });
        }
    }

    // Track activity
    trackActivity(action, details) {
        if (this.connected) {
            this.socket.emit('activity:track', { action, details });
        }
    }

    // Video calling
    initiateCall(targetUserId, callType = 'video') {
        if (!this.connected) {
            this.showNotification('error', 'Connection Error', 'Please wait for connection to establish');
            return;
        }

        // Create WebRTC offer
        this.createWebRTCOffer(targetUserId, callType);
    }

    answerCall(callerId, answer) {
        if (this.connected) {
            this.socket.emit('webrtc:answer', {
                targetUserId: callerId,
                answer
            });
        }
    }

    sendICECandidate(targetUserId, candidate) {
        if (this.connected) {
            this.socket.emit('webrtc:ice-candidate', {
                targetUserId,
                candidate
            });
        }
    }

    /**
     * Event management
     */
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }

    off(event, handler) {
        if (this.eventHandlers.has(event)) {
            const handlers = this.eventHandlers.get(event);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    triggerEvent(event, data) {
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Queue management
     */
    queueMessage(event, data) {
        this.messageQueue.push({ event, data, timestamp: new Date() });

        // Limit queue size
        if (this.messageQueue.length > 100) {
            this.messageQueue.shift();
        }
    }

    processMessageQueue() {
        while (this.messageQueue.length > 0) {
            const { event, data } = this.messageQueue.shift();
            this.socket.emit(event, data);
        }
    }

    /**
     * UI helper methods
     */
    displayChatMessage(message) {
        // Implementation depends on your UI
        const chatContainer = document.querySelector('.chat-messages');
        if (chatContainer) {
            const messageEl = document.createElement('div');
            messageEl.className = `chat-message ${message.senderId === this.userId ? 'sent' : 'received'}`;
            messageEl.innerHTML = `
                <div class="message-content">${message.message}</div>
                <div class="message-time">${new Date(message.timestamp).toLocaleTimeString()}</div>
            `;
            chatContainer.appendChild(messageEl);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    displaySupportReply(reply) {
        const supportContainer = document.querySelector('.support-messages');
        if (supportContainer) {
            const replyEl = document.createElement('div');
            replyEl.className = 'support-reply';
            replyEl.innerHTML = `
                <div class="reply-header">Support Team</div>
                <div class="reply-content">${reply.message}</div>
                <div class="reply-time">${new Date(reply.timestamp).toLocaleTimeString()}</div>
            `;
            supportContainer.appendChild(replyEl);
        }
    }

    showTypingIndicator(userId, conversationId) {
        const indicator = document.querySelector(`[data-conversation="${conversationId}"] .typing-indicator`);
        if (indicator) {
            indicator.style.display = 'block';
        }
    }

    hideTypingIndicator(userId, conversationId) {
        const indicator = document.querySelector(`[data-conversation="${conversationId}"] .typing-indicator`);
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    updateUserPresence(userId, status) {
        const userElement = document.querySelector(`[data-user-id="${userId}"]`);
        if (userElement) {
            userElement.dataset.presence = status;
            const statusIndicator = userElement.querySelector('.status-indicator');
            if (statusIndicator) {
                statusIndicator.className = `status-indicator status-${status}`;
            }
        }
    }

    updateUserOnlineStatus(userId, status) {
        const userElement = document.querySelector(`[data-user-id="${userId}"]`);
        if (userElement) {
            userElement.dataset.online = status;
            const onlineIndicator = userElement.querySelector('.online-indicator');
            if (onlineIndicator) {
                onlineIndicator.className = `online-indicator ${status}`;
            }
        }
    }

    updateBookingStatus(bookingId, status) {
        const bookingElement = document.querySelector(`[data-booking-id="${bookingId}"]`);
        if (bookingElement) {
            bookingElement.dataset.status = status;
            const statusElement = bookingElement.querySelector('.booking-status');
            if (statusElement) {
                statusElement.textContent = status;
                statusElement.className = `booking-status status-${status}`;
            }
        }
    }

    showIncomingCall(callerInfo, callType) {
        // Create incoming call UI
        const callUI = document.createElement('div');
        callUI.className = 'incoming-call-overlay';
        callUI.innerHTML = `
            <div class="incoming-call">
                <img src="${callerInfo.profileImage || '/images/default-avatar.png'}" alt="${callerInfo.name}">
                <h3>${callerInfo.name}</h3>
                <p>Incoming ${callType} call...</p>
                <div class="call-actions">
                    <button class="btn-accept" onclick="webSocketClient.acceptCall()">Accept</button>
                    <button class="btn-decline" onclick="webSocketClient.declineCall()">Decline</button>
                </div>
            </div>
        `;
        document.body.appendChild(callUI);
    }

    showNotification(type, title, message, duration = 5000) {
        if (window.errorHandler) {
            window.errorHandler.showNotification(type, title, message, duration);
        }
    }

    showDesktopNotification(title, body, icon) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body,
                icon: icon || '/images/logo.png',
                tag: 'nepal-adventures',
                requireInteraction: false
            });
        }
    }

    playNotificationSound() {
        const audio = new Audio('/sounds/notification.mp3');
        audio.play().catch(e => console.log('Could not play notification sound'));
    }

    playRingtone() {
        const audio = new Audio('/sounds/ringtone.mp3');
        audio.loop = true;
        audio.play().catch(e => console.log('Could not play ringtone'));
        this.ringtone = audio;
    }

    stopRingtone() {
        if (this.ringtone) {
            this.ringtone.pause();
            this.ringtone = null;
        }
    }

    /**
     * WebRTC helper methods
     */
    async createWebRTCOffer(targetUserId, callType) {
        // This would integrate with WebRTC implementation
        console.log('Creating WebRTC offer for', targetUserId);
        // Implementation would go here
    }

    acceptCall() {
        this.stopRingtone();
        document.querySelector('.incoming-call-overlay')?.remove();
        // Accept call logic
    }

    declineCall() {
        this.stopRingtone();
        document.querySelector('.incoming-call-overlay')?.remove();
        // Decline call logic
    }

    /**
     * Cleanup
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.connected = false;
        this.messageQueue = [];
    }

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
}

// Create global instance
window.webSocketClient = new WebSocketClient();

// Auto-initialize if token is available
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in (token in localStorage or cookie)
    const token = localStorage.getItem('authToken') || getCookie('token');

    if (token) {
        window.webSocketClient.initialize(token).catch(error => {
            console.error('Failed to initialize WebSocket:', error);
        });

        // Request notification permission
        window.webSocketClient.requestNotificationPermission();
    }
});

// Helper function to get cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebSocketClient;
}