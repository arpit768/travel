const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  
  // User Role
  role: {
    type: String,
    enum: ['tourist', 'guide', 'porter', 'gear_provider'],
    required: true
  },
  
  // Profile Status
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Profile Image
  profileImage: {
    type: String,
    default: null
  },
  
  // Address Information
  address: {
    street: String,
    city: String,
    state: String,
    country: {
      type: String,
      default: 'Nepal'
    },
    zipCode: String
  },
  
  // Emergency Contact
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  
  // Medical Information (for tourists)
  medicalInfo: {
    bloodType: String,
    allergies: [String],
    medications: [String],
    conditions: [String],
    insuranceDetails: {
      provider: String,
      policyNumber: String,
      expiryDate: Date
    }
  },
  
  // Authentication
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  // Preferences
  preferences: {
    language: {
      type: String,
      default: 'en'
    },
    currency: {
      type: String,
      default: 'USD'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      }
    }
  },

  // Activity Tracking
  lastLogin: Date,
  loginCount: {
    type: Number,
    default: 0
  },

  // Security Features
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  lastFailedLogin: Date,
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: String,
  securityQuestions: [{
    question: String,
    answer: String
  }],
  lastPasswordChange: {
    type: Date,
    default: Date.now
  },
  sessionTokens: [String], // Track active sessions
  ipAddresses: [{
    ip: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create virtual for guide/porter profile
userSchema.virtual('guideProfile', {
  ref: 'Guide',
  localField: '_id',
  foreignField: 'user',
  justOne: true
});

userSchema.virtual('porterProfile', {
  ref: 'Porter',
  localField: '_id',
  foreignField: 'user',
  justOne: true
});

userSchema.virtual('gearProviderProfile', {
  ref: 'GearProvider',
  localField: '_id',
  foreignField: 'user',
  justOne: true
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  this.loginCount += 1;
  return this.save();
};

// Security Methods
const maxLoginAttempts = 5;
const lockTime = 2 * 60 * 60 * 1000; // 2 hours

userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.methods.incLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1, loginAttempts: 1 }
    });
  }

  const updates = {
    $inc: { loginAttempts: 1 },
    $set: { lastFailedLogin: Date.now() }
  };

  if (this.loginAttempts + 1 >= maxLoginAttempts && !this.isLocked) {
    updates.$set.lockUntil = Date.now() + lockTime;
  }

  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1, lastFailedLogin: 1 }
  });
};

userSchema.methods.addIpAddress = function(ip) {
  const maxIpHistory = 10;
  this.ipAddresses.unshift({ ip, timestamp: new Date() });
  if (this.ipAddresses.length > maxIpHistory) {
    this.ipAddresses = this.ipAddresses.slice(0, maxIpHistory);
  }
  return this.save();
};

userSchema.methods.addSessionToken = function(token) {
  const maxSessions = 5;
  this.sessionTokens.unshift(token);
  if (this.sessionTokens.length > maxSessions) {
    this.sessionTokens = this.sessionTokens.slice(0, maxSessions);
  }
  return this.save();
};

userSchema.methods.removeSessionToken = function(token) {
  this.sessionTokens = this.sessionTokens.filter(t => t !== token);
  return this.save();
};

module.exports = mongoose.model('User', userSchema);