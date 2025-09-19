/**
 * Analytics Routes
 * Track user interactions and performance metrics
 */

const express = require('express');
const router = express.Router();

// In-memory storage for demo (use database in production)
const analytics = {
    events: [],
    performance: [],
    users: new Map()
};

// @route   POST /api/analytics
// @desc    Track analytics event
// @access  Public
router.post('/', (req, res) => {
    try {
        const { event, data, timestamp } = req.body;

        const analyticsEvent = {
            id: Date.now().toString(),
            event,
            data: data || {},
            timestamp: timestamp || new Date().toISOString(),
            ip: req.ip,
            userAgent: req.get('User-Agent')
        };

        // Store event
        analytics.events.push(analyticsEvent);

        // Keep only last 1000 events
        if (analytics.events.length > 1000) {
            analytics.events = analytics.events.slice(-1000);
        }

        res.json({
            success: true,
            message: 'Event tracked successfully',
            eventId: analyticsEvent.id
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to track event'
        });
    }
});

// @route   POST /api/analytics/batch
// @desc    Track multiple analytics events
// @access  Public
router.post('/batch', (req, res) => {
    try {
        const { events } = req.body;

        if (!Array.isArray(events)) {
            return res.status(400).json({
                success: false,
                message: 'Events must be an array'
            });
        }

        const processedEvents = events.map(event => ({
            id: Date.now().toString() + Math.random(),
            ...event,
            timestamp: event.timestamp || new Date().toISOString(),
            ip: req.ip,
            userAgent: req.get('User-Agent')
        }));

        // Store all events
        analytics.events.push(...processedEvents);

        // Keep only last 1000 events
        if (analytics.events.length > 1000) {
            analytics.events = analytics.events.slice(-1000);
        }

        res.json({
            success: true,
            message: `${processedEvents.length} events tracked successfully`,
            eventIds: processedEvents.map(e => e.id)
        });
    } catch (error) {
        console.error('Batch analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to track batch events'
        });
    }
});

// @route   POST /api/performance
// @desc    Track performance metrics
// @access  Public
router.post('/', (req, res) => {
    try {
        const { metrics, page, timestamp } = req.body;

        const performanceData = {
            id: Date.now().toString(),
            metrics: metrics || {},
            page: page || 'unknown',
            timestamp: timestamp || new Date().toISOString(),
            ip: req.ip,
            userAgent: req.get('User-Agent')
        };

        // Store performance data
        analytics.performance.push(performanceData);

        // Keep only last 500 performance entries
        if (analytics.performance.length > 500) {
            analytics.performance = analytics.performance.slice(-500);
        }

        res.json({
            success: true,
            message: 'Performance metrics tracked successfully',
            metricId: performanceData.id
        });
    } catch (error) {
        console.error('Performance tracking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to track performance metrics'
        });
    }
});

// @route   GET /api/analytics/stats
// @desc    Get analytics statistics
// @access  Public
router.get('/stats', (req, res) => {
    try {
        const totalEvents = analytics.events.length;
        const totalPerformance = analytics.performance.length;

        // Calculate some basic stats
        const eventsByType = {};
        analytics.events.forEach(event => {
            eventsByType[event.event] = (eventsByType[event.event] || 0) + 1;
        });

        // Calculate average performance metrics
        const performanceAverages = {};
        if (analytics.performance.length > 0) {
            const metricsSum = {};
            const metricsCount = {};

            analytics.performance.forEach(perf => {
                Object.entries(perf.metrics).forEach(([key, value]) => {
                    if (typeof value === 'number') {
                        metricsSum[key] = (metricsSum[key] || 0) + value;
                        metricsCount[key] = (metricsCount[key] || 0) + 1;
                    }
                });
            });

            Object.keys(metricsSum).forEach(key => {
                performanceAverages[key] = Math.round(metricsSum[key] / metricsCount[key]);
            });
        }

        res.json({
            success: true,
            data: {
                totalEvents,
                totalPerformanceEntries: totalPerformance,
                eventsByType,
                performanceAverages,
                lastUpdated: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Analytics stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get analytics stats'
        });
    }
});

// @route   GET /api/analytics/events
// @desc    Get recent analytics events
// @access  Public
router.get('/events', (req, res) => {
    try {
        const { limit = 50, event_type } = req.query;

        let events = analytics.events;

        // Filter by event type if specified
        if (event_type) {
            events = events.filter(e => e.event === event_type);
        }

        // Get most recent events
        const recentEvents = events
            .slice(-parseInt(limit))
            .reverse();

        res.json({
            success: true,
            data: recentEvents,
            total: events.length
        });
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get events'
        });
    }
});

// @route   GET /api/performance/metrics
// @desc    Get recent performance metrics
// @access  Public
router.get('/metrics', (req, res) => {
    try {
        const { limit = 20, page } = req.query;

        let metrics = analytics.performance;

        // Filter by page if specified
        if (page) {
            metrics = metrics.filter(m => m.page === page);
        }

        // Get most recent metrics
        const recentMetrics = metrics
            .slice(-parseInt(limit))
            .reverse();

        res.json({
            success: true,
            data: recentMetrics,
            total: metrics.length
        });
    } catch (error) {
        console.error('Get metrics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get metrics'
        });
    }
});

// @route   DELETE /api/analytics/clear
// @desc    Clear analytics data
// @access  Public (should be protected in production)
router.delete('/clear', (req, res) => {
    try {
        analytics.events = [];
        analytics.performance = [];
        analytics.users.clear();

        res.json({
            success: true,
            message: 'Analytics data cleared successfully'
        });
    } catch (error) {
        console.error('Clear analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear analytics data'
        });
    }
});

module.exports = router;