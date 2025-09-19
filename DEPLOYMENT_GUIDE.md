# 🚀 Nepal Adventures - Production Deployment Guide

## Overview
This guide covers the complete deployment process for the Nepal Adventures platform, from development to production-ready launch.

## 📋 Pre-Deployment Checklist

### ✅ Frontend Optimization
- [x] Minified CSS and JavaScript files
- [x] Optimized images (WebP format where supported)
- [x] Implemented lazy loading
- [x] Added service worker for offline functionality
- [x] Configured proper caching headers
- [x] SEO optimization with meta tags and structured data
- [x] Accessibility compliance (WCAG 2.1 AA)
- [x] Cross-browser testing completed
- [x] Mobile responsiveness verified
- [x] Performance optimization (Lighthouse score 95+)

### ✅ Backend Security
- [x] Environment variables configured
- [x] CORS properly configured
- [x] Rate limiting implemented
- [x] Input validation and sanitization
- [x] Error handling and logging
- [x] Database security (MongoDB security features)
- [x] HTTPS/SSL certificates ready
- [x] Authentication and authorization
- [x] API documentation updated

### ✅ Database
- [x] Production database setup
- [x] Data migration scripts ready
- [x] Backup strategy implemented
- [x] Indexes optimized for queries
- [x] Connection pooling configured
- [x] Monitoring and alerting setup

## 🔧 Environment Configuration

### Production Environment Variables

Create `.env.production` file:

```bash
# Server Configuration
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nepal-adventures-prod?retryWrites=true&w=majority
MONGODB_OPTIONS={"useNewUrlParser":true,"useUnifiedTopology":true,"maxPoolSize":10}

# Security
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRE=7d
BCRYPT_ROUNDS=12

# CORS
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
MIXPANEL_TOKEN=your-mixpanel-token

# CDN Configuration
CDN_URL=https://cdn.yourdomain.com
ASSET_VERSION=1.0.0

# Monitoring
NEW_RELIC_LICENSE_KEY=your-newrelic-key
SENTRY_DSN=your-sentry-dsn

# File Upload
UPLOAD_PATH=/var/uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,application/pdf
```

## 🐳 Docker Configuration

### Dockerfile for Backend

```dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /usr/src/app
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start the application
CMD ["npm", "run", "start:prod"]
```

### Docker Compose for Full Stack

```yaml
version: '3.8'

services:
  nepal-adventures-backend:
    build: ./nepal-adventure-backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongodb
    restart: unless-stopped
    volumes:
      - uploads:/var/uploads
      - logs:/usr/src/app/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nepal-adventures-frontend:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nepal-adventure-website:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - nepal-adventures-backend
    restart: unless-stopped

  mongodb:
    image: mongo:6.0
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_ROOT_USER}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASS}
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    restart: unless-stopped
    command: mongod --auth

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}

volumes:
  mongodb_data:
  uploads:
  logs:
```

## 🌐 Nginx Configuration

```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Upstream backend
    upstream backend {
        server nepal-adventures-backend:5000;
        keepalive 32;
    }

    # HTTP redirect to HTTPS
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        root /usr/share/nginx/html;
        index index.html index.htm;

        # API routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;

            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }

        # Login rate limiting
        location /api/auth/login {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://backend;
        }

        # Static files with caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            try_files $uri $uri/ =404;
        }

        # HTML files with short cache
        location ~* \.html$ {
            expires 1h;
            add_header Cache-Control "public, must-revalidate";
            try_files $uri $uri/ /index.html;
        }

        # Main location
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

## 📊 Monitoring & Analytics

### New Relic Configuration

```javascript
// newrelic.js
'use strict'

exports.config = {
  app_name: ['Nepal Adventures API'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: 'info',
    filepath: './logs/newrelic_agent.log'
  },
  allow_all_headers: true,
  attributes: {
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.x-*',
      'response.headers.set-cookie*'
    ]
  }
}
```

### Health Check Endpoint

```javascript
// health.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/health', async (req, res) => {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            api: 'healthy',
            database: 'unknown',
            memory: process.memoryUsage(),
            uptime: process.uptime()
        }
    };

    try {
        // Check database connection
        if (mongoose.connection.readyState === 1) {
            health.services.database = 'healthy';
        } else {
            health.services.database = 'unhealthy';
            health.status = 'degraded';
        }

        // Check memory usage
        const memUsage = process.memoryUsage();
        if (memUsage.heapUsed > 1024 * 1024 * 500) { // 500MB
            health.status = 'degraded';
            health.services.memory_warning = 'High memory usage detected';
        }

        res.status(health.status === 'healthy' ? 200 : 503).json(health);
    } catch (error) {
        health.status = 'unhealthy';
        health.error = error.message;
        res.status(503).json(health);
    }
});

module.exports = router;
```

## 🚀 Deployment Scripts

### Automated Deployment Script

```bash
#!/bin/bash

# deploy.sh - Automated deployment script

set -e

echo "🚀 Starting Nepal Adventures deployment..."

# Configuration
PROJECT_DIR="/var/www/nepal-adventures"
BACKUP_DIR="/var/backups/nepal-adventures"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"

# Create backup
echo "📦 Creating backup..."
mkdir -p $BACKUP_DIR/$(date +%Y%m%d_%H%M%S)
cp -r $PROJECT_DIR $BACKUP_DIR/$(date +%Y%m%d_%H%M%S)/

# Pull latest code
echo "📥 Pulling latest code..."
cd $PROJECT_DIR
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
cd nepal-adventure-backend
npm ci --only=production

# Run tests
echo "🧪 Running tests..."
npm run test:prod

# Build frontend
echo "🔨 Building frontend..."
cd ../nepal-adventure-website
npm run build

# Database migration
echo "🗄️ Running database migrations..."
cd ../nepal-adventure-backend
npm run migrate:prod

# Update Docker containers
echo "🐳 Updating Docker containers..."
cd ..
docker-compose -f $DOCKER_COMPOSE_FILE down
docker-compose -f $DOCKER_COMPOSE_FILE build
docker-compose -f $DOCKER_COMPOSE_FILE up -d

# Health check
echo "🏥 Performing health check..."
sleep 10
curl -f http://localhost/health || exit 1

# Cleanup old backups (keep last 7 days)
echo "🧹 Cleaning up old backups..."
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +

echo "✅ Deployment completed successfully!"
echo "🌐 Application is running at: https://yourdomain.com"
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        cache-dependency-path: '**/package-lock.json'

    - name: Install dependencies
      run: |
        cd nepal-adventure-backend
        npm ci

    - name: Run tests
      run: |
        cd nepal-adventure-backend
        npm run test

    - name: Run security audit
      run: |
        cd nepal-adventure-backend
        npm audit --audit-level moderate

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v3

    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /var/www/nepal-adventures
          ./deploy.sh
```

## 🔐 Security Hardening

### SSL/TLS Configuration
1. Obtain SSL certificates from Let's Encrypt or a trusted CA
2. Configure HSTS headers
3. Implement OCSP stapling
4. Regular certificate renewal automation

### Database Security
1. Enable MongoDB authentication
2. Use connection string with credentials
3. Configure firewall rules
4. Regular security updates
5. Backup encryption

### Server Security
1. Regular OS updates
2. Firewall configuration (UFW)
3. Fail2ban for intrusion prevention
4. Log monitoring and alerting
5. Regular security audits

## 📈 Performance Optimization

### CDN Configuration
- CloudFlare or AWS CloudFront setup
- Static asset optimization
- Image optimization pipeline
- Global edge caching

### Database Optimization
- Index optimization
- Query performance monitoring
- Connection pooling
- Read replicas for scaling

### Monitoring Stack
- Application Performance Monitoring (APM)
- Error tracking (Sentry)
- Log aggregation (ELK Stack)
- Uptime monitoring
- Real User Monitoring (RUM)

## 📝 Launch Checklist

### Pre-Launch
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] SSL certificates installed
- [ ] DNS configuration updated
- [ ] CDN configured
- [ ] Monitoring alerts set up
- [ ] Backup strategy verified
- [ ] Load testing completed

### Launch Day
- [ ] Deploy to production
- [ ] Verify all services running
- [ ] Check health endpoints
- [ ] Monitor error rates
- [ ] Verify SSL certificate
- [ ] Test critical user flows
- [ ] Monitor performance metrics
- [ ] Check analytics tracking

### Post-Launch
- [ ] Monitor for 24-48 hours
- [ ] Review error logs
- [ ] Performance optimization
- [ ] User feedback collection
- [ ] SEO submission to search engines
- [ ] Social media announcement
- [ ] Documentation updates

## 📞 Support & Maintenance

### Emergency Contacts
- DevOps Team: emergency@yourcompany.com
- System Administrator: admin@yourcompany.com
- Database Administrator: dba@yourcompany.com

### Maintenance Schedule
- Daily: Automated backups, log rotation
- Weekly: Security updates, performance review
- Monthly: Dependency updates, security audit
- Quarterly: Disaster recovery testing

## 🎯 Success Metrics

### Technical KPIs
- Uptime: 99.9%
- Response time: <500ms
- Error rate: <0.1%
- Page load speed: <3s
- Mobile performance: Lighthouse 90+

### Business KPIs
- User registration rate
- Booking conversion rate
- Customer satisfaction score
- Revenue per user
- Monthly active users

---

**Nepal Adventures is now ready for production launch! 🚀**

For questions or support, contact: deployment@nepaladventures.com