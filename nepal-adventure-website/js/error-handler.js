/**
 * Professional Error Handling & User Feedback System
 * Production-ready error management for Nepal Adventures
 */

class ErrorHandler {
    constructor() {
        this.initializeGlobalErrorHandling();
        this.createNotificationSystem();
        this.setupNetworkMonitoring();
    }

    initializeGlobalErrorHandling() {
        // Global JavaScript error handling
        window.addEventListener('error', (event) => {
            this.logError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString(),
                url: window.location.href
            });
        });

        // Promise rejection handling
        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                type: 'promise_rejection',
                message: event.reason?.message || 'Unhandled Promise Rejection',
                stack: event.reason?.stack,
                timestamp: new Date().toISOString(),
                url: window.location.href
            });
        });

        // Resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.logError({
                    type: 'resource',
                    message: `Failed to load resource: ${event.target.src || event.target.href}`,
                    element: event.target.tagName,
                    timestamp: new Date().toISOString()
                });
            }
        }, true);
    }

    createNotificationSystem() {
        // Create notification container
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.innerHTML = `
            <style>
                #notification-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    pointer-events: none;
                }
                .notification {
                    background: white;
                    border-radius: 12px;
                    padding: 16px 20px;
                    margin-bottom: 12px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    max-width: 400px;
                    animation: slideIn 0.3s ease-out;
                    pointer-events: auto;
                    position: relative;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .notification.success {
                    border-left: 4px solid #27ae60;
                    background: linear-gradient(135deg, rgba(39, 174, 96, 0.1), rgba(255, 255, 255, 0.95));
                }
                .notification.error {
                    border-left: 4px solid #e74c3c;
                    background: linear-gradient(135deg, rgba(231, 76, 60, 0.1), rgba(255, 255, 255, 0.95));
                }
                .notification.warning {
                    border-left: 4px solid #f39c12;
                    background: linear-gradient(135deg, rgba(243, 156, 18, 0.1), rgba(255, 255, 255, 0.95));
                }
                .notification.info {
                    border-left: 4px solid #3498db;
                    background: linear-gradient(135deg, rgba(52, 152, 219, 0.1), rgba(255, 255, 255, 0.95));
                }
                .notification-icon {
                    font-size: 20px;
                    flex-shrink: 0;
                }
                .notification-content {
                    flex: 1;
                }
                .notification-title {
                    font-weight: 600;
                    margin-bottom: 4px;
                    color: #2c3e50;
                }
                .notification-message {
                    color: #7f8c8d;
                    font-size: 14px;
                    line-height: 1.4;
                }
                .notification-close {
                    background: none;
                    border: none;
                    font-size: 18px;
                    color: #95a5a6;
                    cursor: pointer;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: all 0.2s ease;
                }
                .notification-close:hover {
                    background: rgba(149, 165, 166, 0.1);
                    color: #7f8c8d;
                }
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
                @media (max-width: 768px) {
                    #notification-container {
                        top: 10px;
                        right: 10px;
                        left: 10px;
                    }
                    .notification {
                        max-width: none;
                    }
                }
            </style>
        `;
        document.body.appendChild(container);
    }

    showNotification(type, title, message, duration = 5000) {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-icon">${icons[type]}</div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">×</button>
        `;

        // Add close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.removeNotification(notification);
        });

        container.appendChild(notification);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification);
            }, duration);
        }

        // Log notification for analytics
        this.logEvent('notification_shown', { type, title, message });
    }

    removeNotification(notification) {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    setupNetworkMonitoring() {
        // Monitor online/offline status
        window.addEventListener('online', () => {
            this.showNotification('success', 'Connection Restored', 'You are back online!');
        });

        window.addEventListener('offline', () => {
            this.showNotification('warning', 'Connection Lost', 'Please check your internet connection.');
        });

        // Monitor slow network
        if ('connection' in navigator) {
            const connection = navigator.connection;
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                this.showNotification('info', 'Slow Connection', 'Optimizing experience for your connection speed.');
            }
        }
    }

    logError(errorData) {
        // Log to console in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.error('Error logged:', errorData);
        }

        // Send to analytics service (placeholder for production)
        this.sendToAnalytics('error', errorData);

        // Show user-friendly error message for critical errors
        if (errorData.type === 'javascript' || errorData.type === 'promise_rejection') {
            this.showNotification(
                'error',
                'Something went wrong',
                'We\'re working to fix this issue. Please refresh the page if problems persist.'
            );
        }
    }

    logEvent(eventName, data = {}) {
        const eventData = {
            event: eventName,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            ...data
        };

        // Log to console in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('Event logged:', eventData);
        }

        // Send to analytics service
        this.sendToAnalytics('event', eventData);
    }

    sendToAnalytics(type, data) {
        // Placeholder for analytics service integration
        // In production, this would send to services like:
        // - Google Analytics
        // - Mixpanel
        // - Custom analytics endpoint

        try {
            if (window.gtag) {
                window.gtag('event', type, data);
            }

            // Custom analytics endpoint
            fetch('http://localhost:5000/api/analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    event: type,
                    data: data,
                    timestamp: new Date().toISOString()
                })
            }).catch(() => {
                // Silently fail analytics to not disrupt user experience
            });
        } catch (error) {
            // Silently handle analytics errors
        }
    }

    // API Error Handler
    async handleApiRequest(url, options = {}) {
        const loadingId = this.showLoading('Processing your request...');

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            this.hideLoading(loadingId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            this.hideLoading(loadingId);

            if (error.name === 'AbortError') {
                this.showNotification('info', 'Request Cancelled', 'The request was cancelled.');
            } else if (!navigator.onLine) {
                this.showNotification('error', 'No Internet Connection', 'Please check your connection and try again.');
            } else {
                this.showNotification('error', 'Request Failed', error.message || 'Something went wrong. Please try again.');
            }

            throw error;
        }
    }

    showLoading(message = 'Loading...') {
        const loadingId = 'loading-' + Date.now();
        const loading = document.createElement('div');
        loading.id = loadingId;
        loading.className = 'notification info';
        loading.innerHTML = `
            <div class="notification-icon">
                <div style="width: 20px; height: 20px; border: 2px solid #3498db; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            </div>
            <div class="notification-content">
                <div class="notification-title">Loading</div>
                <div class="notification-message">${message}</div>
            </div>
        `;

        document.getElementById('notification-container').appendChild(loading);
        return loadingId;
    }

    hideLoading(loadingId) {
        const loading = document.getElementById(loadingId);
        if (loading) {
            this.removeNotification(loading);
        }
    }
}

// Initialize error handler
window.errorHandler = new ErrorHandler();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
}