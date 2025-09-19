/**
 * SEO Optimization & Performance Monitoring System
 * Professional-grade SEO and performance tracking
 */

class SEOPerformanceManager {
    constructor() {
        this.performanceMetrics = {};
        this.seoData = {};
        this.initializePerformanceMonitoring();
        this.initializeSEOOptimizations();
        this.setupAnalytics();
    }

    initializePerformanceMonitoring() {
        // Performance Observer for Core Web Vitals
        if ('PerformanceObserver' in window) {
            // Largest Contentful Paint (LCP)
            new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    this.performanceMetrics.lcp = entry.startTime;
                    this.logPerformanceMetric('LCP', entry.startTime);
                }
            }).observe({ entryTypes: ['largest-contentful-paint'] });

            // First Input Delay (FID)
            new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    this.performanceMetrics.fid = entry.processingStart - entry.startTime;
                    this.logPerformanceMetric('FID', this.performanceMetrics.fid);
                }
            }).observe({ entryTypes: ['first-input'] });

            // Cumulative Layout Shift (CLS)
            let clsValue = 0;
            new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
                this.performanceMetrics.cls = clsValue;
                this.logPerformanceMetric('CLS', clsValue);
            }).observe({ entryTypes: ['layout-shift'] });
        }

        // Page Load Performance
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                this.performanceMetrics.loadTime = perfData.loadEventEnd - perfData.fetchStart;
                this.performanceMetrics.domContentLoaded = perfData.domContentLoadedEventEnd - perfData.fetchStart;
                this.performanceMetrics.firstByte = perfData.responseStart - perfData.fetchStart;

                this.logPerformanceData();
                this.sendPerformanceReport();
            }, 0);
        });

        // Memory usage monitoring
        if ('memory' in performance) {
            setInterval(() => {
                this.performanceMetrics.memory = {
                    used: Math.round(performance.memory.usedJSHeapSize / 1048576),
                    total: Math.round(performance.memory.totalJSHeapSize / 1048576),
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
                };
            }, 30000); // Check every 30 seconds
        }
    }

    initializeSEOOptimizations() {
        this.optimizeMetaTags();
        this.setupStructuredData();
        this.optimizeImages();
        this.setupInternalLinking();
        this.monitorPageSpeed();
        this.setupSocialSharing();
    }

    optimizeMetaTags() {
        // Dynamic meta description based on page content
        const metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription?.content || metaDescription.content.length < 120) {
            const content = this.generateMetaDescription();
            if (metaDescription) {
                metaDescription.content = content;
            } else {
                const newMeta = document.createElement('meta');
                newMeta.name = 'description';
                newMeta.content = content;
                document.head.appendChild(newMeta);
            }
        }

        // Canonical URL
        if (!document.querySelector('link[rel="canonical"]')) {
            const canonical = document.createElement('link');
            canonical.rel = 'canonical';
            canonical.href = window.location.origin + window.location.pathname;
            document.head.appendChild(canonical);
        }

        // Viewport meta tag optimization
        const viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            const viewportMeta = document.createElement('meta');
            viewportMeta.name = 'viewport';
            viewportMeta.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
            document.head.appendChild(viewportMeta);
        }

        // Language and region
        if (!document.documentElement.lang) {
            document.documentElement.lang = 'en';
        }

        // Theme color for mobile browsers
        if (!document.querySelector('meta[name="theme-color"]')) {
            const themeColor = document.createElement('meta');
            themeColor.name = 'theme-color';
            themeColor.content = '#2c5530';
            document.head.appendChild(themeColor);
        }
    }

    generateMetaDescription() {
        const pageTitle = document.title || '';
        const headings = Array.from(document.querySelectorAll('h1, h2')).map(h => h.textContent);

        if (pageTitle.includes('Nepal Adventures')) {
            return 'Discover amazing adventures in Nepal and Asia with certified guides, quality gear, and unforgettable experiences. Book your Himalayan expedition today with Nepal Adventures.';
        }

        if (headings.some(h => h.includes('Adventures'))) {
            return 'Explore incredible adventures including trekking, climbing, and cultural experiences across Asia. Professional guides and premium equipment for your safety and enjoyment.';
        }

        return 'Nepal Adventures - Your trusted partner for Himalayan expeditions and Asian adventure tourism. Professional guides, quality gear, and unforgettable experiences.';
    }

    setupStructuredData() {
        // Enhanced structured data for better search results
        const structuredData = {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "TravelAgency",
                    "name": "Nepal Adventures",
                    "description": "Complete platform for Himalayan expeditions with certified guides and quality gear",
                    "url": window.location.origin,
                    "logo": {
                        "@type": "ImageObject",
                        "url": `${window.location.origin}/images/logo.png`,
                        "width": "200",
                        "height": "200"
                    },
                    "contactPoint": {
                        "@type": "ContactPoint",
                        "telephone": "+977-1234567890",
                        "contactType": "customer service",
                        "email": "info@nepaladventures.com",
                        "availableLanguage": ["English", "Nepali", "Hindi"]
                    },
                    "address": {
                        "@type": "PostalAddress",
                        "streetAddress": "Thamel",
                        "addressLocality": "Kathmandu",
                        "addressCountry": "Nepal",
                        "postalCode": "44600"
                    },
                    "sameAs": [
                        "https://facebook.com/nepaladventures",
                        "https://instagram.com/nepaladventures",
                        "https://twitter.com/nepaladventures",
                        "https://linkedin.com/company/nepaladventures"
                    ],
                    "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": "4.9",
                        "reviewCount": "500",
                        "bestRating": "5",
                        "worstRating": "1"
                    },
                    "priceRange": "$$",
                    "paymentAccepted": ["Cash", "Credit Card", "PayPal", "Bank Transfer"],
                    "currenciesAccepted": ["USD", "EUR", "NPR"]
                },
                {
                    "@type": "WebSite",
                    "name": "Nepal Adventures",
                    "url": window.location.origin,
                    "potentialAction": {
                        "@type": "SearchAction",
                        "target": `${window.location.origin}/search?q={search_term_string}`,
                        "query-input": "required name=search_term_string"
                    }
                },
                {
                    "@type": "Organization",
                    "name": "Nepal Adventures",
                    "url": window.location.origin,
                    "foundingDate": "2020",
                    "numberOfEmployees": "50-100",
                    "areaServed": ["Nepal", "India", "Bhutan", "Tibet"],
                    "serviceType": ["Adventure Tourism", "Trekking", "Mountaineering", "Cultural Tours"]
                }
            ]
        };

        // Add or update structured data
        let structuredDataScript = document.querySelector('script[type="application/ld+json"]');
        if (!structuredDataScript) {
            structuredDataScript = document.createElement('script');
            structuredDataScript.type = 'application/ld+json';
            document.head.appendChild(structuredDataScript);
        }
        structuredDataScript.textContent = JSON.stringify(structuredData);
    }

    optimizeImages() {
        // Lazy loading for images
        const images = document.querySelectorAll('img:not([loading])');
        images.forEach(img => {
            img.loading = 'lazy';
            img.decoding = 'async';

            // Add proper alt text if missing
            if (!img.alt) {
                const src = img.src || img.dataset.src || '';
                const filename = src.split('/').pop().split('.')[0];
                img.alt = `Nepal Adventures - ${filename.replace(/[-_]/g, ' ')}`;
            }
        });

        // Implement intersection observer for advanced lazy loading
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        observer.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    setupInternalLinking() {
        // Add rel="noopener" to external links
        const externalLinks = document.querySelectorAll('a[href^="http"]:not([href*="' + window.location.hostname + '"])');
        externalLinks.forEach(link => {
            link.rel = 'noopener noreferrer';
            link.target = '_blank';
        });

        // Track internal link clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="/"], a[href^="./"], a[href^="../"]')) {
                this.trackEvent('internal_link_click', {
                    href: e.target.href,
                    text: e.target.textContent.trim(),
                    section: this.getCurrentSection(e.target)
                });
            }
        });
    }

    monitorPageSpeed() {
        // Monitor critical resources
        const criticalResources = ['css', 'js'];
        const resourceTimings = performance.getEntriesByType('resource');

        criticalResources.forEach(type => {
            const resources = resourceTimings.filter(r => r.name.includes(`.${type}`));
            const slowResources = resources.filter(r => r.duration > 1000);

            if (slowResources.length > 0) {
                console.warn(`Slow ${type} resources detected:`, slowResources);
                this.trackEvent('slow_resource', {
                    type,
                    count: slowResources.length,
                    resources: slowResources.map(r => ({ name: r.name, duration: r.duration }))
                });
            }
        });
    }

    setupSocialSharing() {
        // Add Open Graph and Twitter Card meta tags dynamically
        const ogTags = [
            { property: 'og:type', content: 'website' },
            { property: 'og:site_name', content: 'Nepal Adventures' },
            { property: 'og:locale', content: 'en_US' },
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:site', content: '@nepaladventures' },
            { name: 'twitter:creator', content: '@nepaladventures' }
        ];

        ogTags.forEach(tag => {
            const existing = document.querySelector(
                tag.property ? `meta[property="${tag.property}"]` : `meta[name="${tag.name}"]`
            );

            if (!existing) {
                const meta = document.createElement('meta');
                if (tag.property) meta.property = tag.property;
                if (tag.name) meta.name = tag.name;
                meta.content = tag.content;
                document.head.appendChild(meta);
            }
        });
    }

    setupAnalytics() {
        // Google Analytics 4 setup
        if (!window.gtag && !window.ga) {
            const script = document.createElement('script');
            script.async = true;
            script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX';
            document.head.appendChild(script);

            window.dataLayer = window.dataLayer || [];
            function gtag() { dataLayer.push(arguments); }
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX', {
                page_title: document.title,
                page_location: window.location.href,
                custom_map: {
                    'dimension1': 'user_type',
                    'dimension2': 'page_category'
                }
            });
        }

        // Custom event tracking
        this.trackPageView();
        this.setupScrollTracking();
        this.setupEngagementTracking();
    }

    trackPageView() {
        const pageData = {
            page_title: document.title,
            page_location: window.location.href,
            page_referrer: document.referrer,
            user_agent: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            viewport_size: `${window.innerWidth}x${window.innerHeight}`,
            connection_type: navigator.connection?.effectiveType || 'unknown',
            timestamp: new Date().toISOString()
        };

        this.trackEvent('page_view', pageData);
    }

    setupScrollTracking() {
        let maxScroll = 0;
        const milestones = [25, 50, 75, 90, 100];
        const reached = new Set();

        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );

            maxScroll = Math.max(maxScroll, scrollPercent);

            milestones.forEach(milestone => {
                if (scrollPercent >= milestone && !reached.has(milestone)) {
                    reached.add(milestone);
                    this.trackEvent('scroll_milestone', {
                        milestone,
                        page: window.location.pathname
                    });
                }
            });
        });

        // Track scroll depth on page unload
        window.addEventListener('beforeunload', () => {
            this.trackEvent('max_scroll_depth', {
                depth: maxScroll,
                page: window.location.pathname
            });
        });
    }

    setupEngagementTracking() {
        let startTime = Date.now();
        let isActive = true;
        let totalTimeActive = 0;

        // Track active time
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        const resetTimer = () => {
            if (!isActive) {
                totalTimeActive += Date.now() - startTime;
                startTime = Date.now();
                isActive = true;
            }
        };

        events.forEach(event => {
            document.addEventListener(event, resetTimer, true);
        });

        // Track inactive time
        let inactiveTimer;
        const markInactive = () => {
            isActive = false;
            clearTimeout(inactiveTimer);
            inactiveTimer = setTimeout(markInactive, 5000);
        };

        events.forEach(event => {
            document.addEventListener(event, () => {
                clearTimeout(inactiveTimer);
                inactiveTimer = setTimeout(markInactive, 5000);
            }, true);
        });

        // Send engagement data on page unload
        window.addEventListener('beforeunload', () => {
            const sessionTime = isActive ? Date.now() - startTime : 0;
            const totalTime = totalTimeActive + sessionTime;

            this.trackEvent('page_engagement', {
                total_time: Math.round(totalTime / 1000),
                active_time: Math.round(totalTimeActive / 1000),
                page: window.location.pathname
            });
        });
    }

    trackEvent(eventName, data = {}) {
        // Send to Google Analytics
        if (window.gtag) {
            window.gtag('event', eventName, data);
        }

        // Send to custom analytics endpoint
        this.sendCustomAnalytics(eventName, data);

        // Log in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log(`Analytics Event: ${eventName}`, data);
        }
    }

    sendCustomAnalytics(event, data) {
        // Batch analytics requests to reduce server load
        if (!this.analyticsBatch) {
            this.analyticsBatch = [];
        }

        this.analyticsBatch.push({
            event,
            data,
            timestamp: Date.now(),
            session_id: this.getSessionId(),
            user_id: this.getUserId()
        });

        // Send batch when it reaches 10 events or after 30 seconds
        if (this.analyticsBatch.length >= 10) {
            this.flushAnalytics();
        } else if (!this.analyticsTimer) {
            this.analyticsTimer = setTimeout(() => {
                this.flushAnalytics();
            }, 30000);
        }
    }

    flushAnalytics() {
        if (!this.analyticsBatch || this.analyticsBatch.length === 0) return;

        fetch('http://localhost:5000/api/analytics/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                events: this.analyticsBatch,
                timestamp: new Date().toISOString()
            })
        }).catch(() => {
            // Silently handle analytics errors
        });

        // Send performance metrics separately
        if (Object.keys(this.performanceMetrics).length > 0) {
            fetch('http://localhost:5000/api/performance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    metrics: this.performanceMetrics,
                    page: window.location.pathname,
                    timestamp: new Date().toISOString()
                })
            }).catch(() => {
                // Silently handle performance tracking errors
            });
        }

        this.analyticsBatch = [];
        clearTimeout(this.analyticsTimer);
        this.analyticsTimer = null;
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('session_id');
        if (!sessionId) {
            sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('session_id', sessionId);
        }
        return sessionId;
    }

    getUserId() {
        let userId = localStorage.getItem('user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('user_id', userId);
        }
        return userId;
    }

    getCurrentSection(element) {
        const section = element.closest('section, main, article');
        return section?.id || section?.className || 'unknown';
    }

    logPerformanceMetric(metric, value) {
        let status = 'good';

        switch (metric) {
            case 'LCP':
                status = value > 4000 ? 'poor' : value > 2500 ? 'needs-improvement' : 'good';
                break;
            case 'FID':
                status = value > 300 ? 'poor' : value > 100 ? 'needs-improvement' : 'good';
                break;
            case 'CLS':
                status = value > 0.25 ? 'poor' : value > 0.1 ? 'needs-improvement' : 'good';
                break;
        }

        this.trackEvent('core_web_vital', {
            metric,
            value: Math.round(value),
            status,
            page: window.location.pathname
        });
    }

    logPerformanceData() {
        console.log('Performance Metrics:', this.performanceMetrics);

        // Send performance report
        this.trackEvent('performance_summary', {
            load_time: Math.round(this.performanceMetrics.loadTime),
            dom_content_loaded: Math.round(this.performanceMetrics.domContentLoaded),
            first_byte: Math.round(this.performanceMetrics.firstByte),
            lcp: Math.round(this.performanceMetrics.lcp || 0),
            fid: Math.round(this.performanceMetrics.fid || 0),
            cls: Math.round((this.performanceMetrics.cls || 0) * 1000) / 1000
        });
    }

    sendPerformanceReport() {
        // Send detailed performance report to backend
        fetch('http://localhost:5000/api/performance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                metrics: this.performanceMetrics,
                page: window.location.pathname,
                user_agent: navigator.userAgent,
                timestamp: new Date().toISOString()
            })
        }).catch(() => {
            // Silently handle performance reporting errors
        });
    }
}

// Initialize SEO and Performance monitoring
window.addEventListener('DOMContentLoaded', () => {
    window.seoPerformanceManager = new SEOPerformanceManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SEOPerformanceManager;
}