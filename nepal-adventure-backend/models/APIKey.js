/**
 * API Key Model
 * For third-party integrations and service authentication
 */

const mongoose = require('mongoose');
const crypto = require('crypto');

const apiKeySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'API Key name is required'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },

    key: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    hashedKey: {
        type: String,
        required: true,
        select: false
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    description: {
        type: String,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },

    permissions: [{
        type: String,
        enum: [
            'read:bookings',
            'write:bookings',
            'read:users',
            'write:users',
            'read:packages',
            'write:packages',
            'read:reviews',
            'write:reviews',
            'read:analytics',
            'admin:all'
        ]
    }],

    rateLimit: {
        requests: {
            type: Number,
            default: 1000 // requests per hour
        },
        window: {
            type: Number,
            default: 3600000 // 1 hour in milliseconds
        }
    },

    allowedIPs: [{
        type: String,
        validate: {
            validator: function(v) {
                // Basic IP validation (IPv4 and IPv6)
                return /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(v) ||
                       /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/.test(v);
            },
            message: 'Invalid IP address format'
        }
    }],

    allowedDomains: [{
        type: String,
        validate: {
            validator: function(v) {
                // Basic domain validation
                return /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/.test(v.toLowerCase());
            },
            message: 'Invalid domain format'
        }
    }],

    expiresAt: {
        type: Date,
        default: null // null means never expires
    },

    active: {
        type: Boolean,
        default: true
    },

    lastUsed: {
        type: Date,
        default: null
    },

    usageCount: {
        type: Number,
        default: 0
    },

    usageStats: {
        totalRequests: {
            type: Number,
            default: 0
        },
        successfulRequests: {
            type: Number,
            default: 0
        },
        failedRequests: {
            type: Number,
            default: 0
        },
        lastError: {
            message: String,
            timestamp: Date
        }
    },

    metadata: {
        type: Map,
        of: String
    },

    webhookUrl: {
        type: String,
        validate: {
            validator: function(v) {
                if (!v) return true; // Optional field
                try {
                    new URL(v);
                    return true;
                } catch {
                    return false;
                }
            },
            message: 'Invalid webhook URL'
        }
    },

    webhookEvents: [{
        type: String,
        enum: [
            'booking.created',
            'booking.updated',
            'booking.cancelled',
            'payment.completed',
            'payment.failed',
            'user.registered',
            'review.created'
        ]
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index for performance
apiKeySchema.index({ user: 1, active: 1 });
apiKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
apiKeySchema.index({ lastUsed: -1 });

// Virtual for checking if key is expired
apiKeySchema.virtual('isExpired').get(function() {
    return this.expiresAt && this.expiresAt < new Date();
});

// Virtual for checking if key is valid
apiKeySchema.virtual('isValid').get(function() {
    return this.active && !this.isExpired;
});

// Method to generate a new API key
apiKeySchema.statics.generateKey = async function(userId, name, options = {}) {
    const rawKey = crypto.randomBytes(32).toString('hex');
    const hashedKey = crypto
        .createHash('sha256')
        .update(rawKey)
        .digest('hex');

    // Create masked version for display (show first 8 chars)
    const maskedKey = rawKey.substring(0, 8) + '...' + rawKey.substring(rawKey.length - 4);

    const apiKey = await this.create({
        name,
        user: userId,
        key: maskedKey,
        hashedKey,
        description: options.description,
        permissions: options.permissions || ['read:bookings', 'read:packages', 'read:reviews'],
        rateLimit: options.rateLimit,
        allowedIPs: options.allowedIPs,
        allowedDomains: options.allowedDomains,
        expiresAt: options.expiresAt,
        webhookUrl: options.webhookUrl,
        webhookEvents: options.webhookEvents,
        metadata: options.metadata
    });

    // Return both the raw key (for the user) and the created document
    return {
        key: rawKey,
        apiKey
    };
};

// Method to verify an API key
apiKeySchema.statics.verifyKey = async function(rawKey) {
    const hashedKey = crypto
        .createHash('sha256')
        .update(rawKey)
        .digest('hex');

    const apiKey = await this.findOne({
        hashedKey,
        active: true
    }).populate('user', 'fullName email role');

    if (!apiKey) {
        return null;
    }

    // Check if expired
    if (apiKey.isExpired) {
        apiKey.active = false;
        await apiKey.save();
        return null;
    }

    // Update usage stats
    apiKey.lastUsed = new Date();
    apiKey.usageCount += 1;
    apiKey.usageStats.totalRequests += 1;
    await apiKey.save();

    return apiKey;
};

// Method to check rate limit
apiKeySchema.methods.checkRateLimit = async function() {
    const now = Date.now();
    const windowStart = now - this.rateLimit.window;

    // This is a simplified rate limit check
    // In production, use Redis or similar for accurate rate limiting
    const recentRequests = this.usageCount; // Simplified

    if (recentRequests >= this.rateLimit.requests) {
        this.usageStats.failedRequests += 1;
        this.usageStats.lastError = {
            message: 'Rate limit exceeded',
            timestamp: new Date()
        };
        await this.save();
        return false;
    }

    this.usageStats.successfulRequests += 1;
    await this.save();
    return true;
};

// Method to check IP restrictions
apiKeySchema.methods.checkIPRestriction = function(clientIP) {
    if (!this.allowedIPs || this.allowedIPs.length === 0) {
        return true; // No IP restrictions
    }

    return this.allowedIPs.includes(clientIP);
};

// Method to check domain restrictions
apiKeySchema.methods.checkDomainRestriction = function(origin) {
    if (!this.allowedDomains || this.allowedDomains.length === 0) {
        return true; // No domain restrictions
    }

    if (!origin) return false;

    try {
        const url = new URL(origin);
        const domain = url.hostname;

        return this.allowedDomains.some(allowed => {
            // Support wildcard subdomains
            if (allowed.startsWith('*.')) {
                const baseDomain = allowed.substring(2);
                return domain.endsWith(baseDomain);
            }
            return domain === allowed;
        });
    } catch {
        return false;
    }
};

// Method to check permissions
apiKeySchema.methods.hasPermission = function(permission) {
    return this.permissions.includes('admin:all') || this.permissions.includes(permission);
};

// Method to rotate key
apiKeySchema.methods.rotateKey = async function() {
    const rawKey = crypto.randomBytes(32).toString('hex');
    const hashedKey = crypto
        .createHash('sha256')
        .update(rawKey)
        .digest('hex');

    const maskedKey = rawKey.substring(0, 8) + '...' + rawKey.substring(rawKey.length - 4);

    this.key = maskedKey;
    this.hashedKey = hashedKey;
    await this.save();

    return rawKey;
};

// Method to revoke key
apiKeySchema.methods.revoke = async function() {
    this.active = false;
    this.metadata.set('revokedAt', new Date().toISOString());
    await this.save();
};

module.exports = mongoose.model('APIKey', apiKeySchema);