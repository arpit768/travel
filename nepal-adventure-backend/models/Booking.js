const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Basic Information
  bookingNumber: {
    type: String,
    unique: true,
    required: true
  },
  
  // Parties Involved
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  
  adventure: {
    type: mongoose.Schema.ObjectId,
    ref: 'Adventure',
    required: true
  },
  
  guide: {
    type: mongoose.Schema.ObjectId,
    ref: 'Guide'
  },
  
  porter: {
    type: mongoose.Schema.ObjectId,
    ref: 'Porter'
  },
  
  // Trip Details
  tripDetails: {
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    duration: {
      type: Number,
      required: true
    },
    groupSize: {
      type: Number,
      required: [true, 'Group size is required'],
      min: 1
    },
    participants: [{
      name: String,
      age: Number,
      nationality: String,
      passportNumber: String,
      emergencyContact: {
        name: String,
        relationship: String,
        phone: String
      },
      medicalInfo: {
        bloodType: String,
        allergies: [String],
        medications: [String],
        conditions: [String]
      },
      dietaryRequirements: [String],
      experienceLevel: String
    }]
  },
  
  // Pricing Breakdown
  pricing: {
    basePrice: {
      type: Number,
      required: true
    },
    guidePrice: {
      type: Number,
      default: 0
    },
    porterPrice: {
      type: Number,
      default: 0
    },
    permitCosts: {
      type: Number,
      default: 0
    },
    equipmentRental: {
      type: Number,
      default: 0
    },
    taxes: {
      type: Number,
      default: 0
    },
    discounts: {
      earlyBird: {
        type: Number,
        default: 0
      },
      group: {
        type: Number,
        default: 0
      },
      loyalty: {
        type: Number,
        default: 0
      },
      promotional: {
        type: Number,
        default: 0
      }
    },
    totalAmount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  
  // Payment Information
  payment: {
    status: {
      type: String,
      enum: ['pending', 'partial', 'completed', 'refunded', 'failed'],
      default: 'pending'
    },
    method: {
      type: String,
      enum: ['credit_card', 'bank_transfer', 'paypal', 'stripe', 'cash', 'other']
    },
    transactions: [{
      amount: Number,
      transactionId: String,
      method: String,
      status: String,
      date: Date,
      description: String
    }],
    paidAmount: {
      type: Number,
      default: 0
    },
    remainingAmount: {
      type: Number,
      default: 0
    },
    refundAmount: {
      type: Number,
      default: 0
    },
    depositRequired: {
      type: Number,
      default: 0
    },
    depositPaid: {
      type: Boolean,
      default: false
    }
  },
  
  // Booking Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  
  // Cancellation Information
  cancellation: {
    cancelled: {
      type: Boolean,
      default: false
    },
    cancelledBy: {
      type: String,
      enum: ['customer', 'provider', 'admin', 'force_majeure']
    },
    cancelledAt: Date,
    reason: String,
    refundEligible: Boolean,
    refundAmount: Number,
    cancellationFee: Number
  },
  
  // Special Requirements
  specialRequirements: {
    dietary: [String],
    medical: [String],
    accommodation: [String],
    transportation: [String],
    equipment: [String],
    other: String
  },
  
  // Equipment Rental
  equipmentRental: [{
    item: String,
    quantity: Number,
    dailyRate: Number,
    totalCost: Number,
    provider: {
      type: mongoose.Schema.ObjectId,
      ref: 'GearProvider'
    },
    status: {
      type: String,
      enum: ['requested', 'confirmed', 'delivered', 'returned'],
      default: 'requested'
    }
  }],
  
  // Insurance
  insurance: {
    required: Boolean,
    provided: Boolean,
    provider: String,
    policyNumber: String,
    coverage: String,
    cost: Number
  },
  
  // Communication
  communications: [{
    from: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    to: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['message', 'notification', 'reminder', 'alert']
    },
    read: {
      type: Boolean,
      default: false
    }
  }],
  
  // Documents
  documents: [{
    name: String,
    type: {
      type: String,
      enum: ['permit', 'insurance', 'passport', 'visa', 'medical', 'waiver', 'contract', 'other']
    },
    url: String,
    uploadedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    verified: Boolean,
    required: Boolean
  }],
  
  // Trip Progress
  progress: {
    currentStatus: String,
    currentLocation: String,
    lastUpdate: Date,
    milestones: [{
      description: String,
      location: String,
      timestamp: Date,
      photos: [String]
    }],
    dailyReports: [{
      date: Date,
      weather: String,
      route: String,
      distance: Number,
      altitude: Number,
      notes: String,
      photos: [String],
      groupMorale: {
        type: Number,
        min: 1,
        max: 5
      }
    }]
  },
  
  // Emergency Information
  emergency: {
    contacts: [{
      name: String,
      relationship: String,
      phone: String,
      email: String
    }],
    evacuation: {
      required: Boolean,
      reason: String,
      location: String,
      timestamp: Date,
      cost: Number,
      covered: Boolean
    },
    incidents: [{
      type: String,
      description: String,
      timestamp: Date,
      severity: {
        type: String,
        enum: ['minor', 'moderate', 'serious', 'critical']
      },
      resolved: Boolean,
      actions: [String]
    }]
  },
  
  // Review and Feedback
  feedback: {
    customerReview: {
      submitted: Boolean,
      rating: Number,
      review: String,
      submittedAt: Date
    },
    guideReview: {
      submitted: Boolean,
      rating: Number,
      review: String,
      submittedAt: Date
    },
    porterReview: {
      submitted: Boolean,
      rating: Number,
      review: String,
      submittedAt: Date
    }
  },
  
  // System Information
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  
  lastModifiedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  
  notes: [{
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['note', 'warning', 'alert', 'reminder']
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate booking number
bookingSchema.pre('save', async function(next) {
  if (!this.bookingNumber) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const count = await mongoose.model('Booking').countDocuments();
    this.bookingNumber = `NA${year}${month}${String(count + 1).padStart(4, '0')}`;
  }
  
  // Calculate remaining amount
  this.payment.remainingAmount = this.pricing.totalAmount - this.payment.paidAmount;
  
  next();
});

// Virtual for trip duration in days
bookingSchema.virtual('tripDurationDays').get(function() {
  if (this.tripDetails.startDate && this.tripDetails.endDate) {
    const diffTime = Math.abs(this.tripDetails.endDate - this.tripDetails.startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for booking age
bookingSchema.virtual('bookingAge').get(function() {
  const diffTime = Math.abs(new Date() - this.createdAt);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Index for search and performance
bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ guide: 1, 'tripDetails.startDate': 1 });
bookingSchema.index({ porter: 1, 'tripDetails.startDate': 1 });
bookingSchema.index({ bookingNumber: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ 'tripDetails.startDate': 1 });

// Calculate total cost based on components
bookingSchema.methods.calculateTotal = function() {
  const { basePrice, guidePrice, porterPrice, permitCosts, equipmentRental, taxes, discounts } = this.pricing;
  const totalDiscounts = Object.values(discounts).reduce((sum, discount) => sum + discount, 0);
  
  this.pricing.totalAmount = basePrice + guidePrice + porterPrice + permitCosts + equipmentRental + taxes - totalDiscounts;
  return this.pricing.totalAmount;
};

// Check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const startDate = new Date(this.tripDetails.startDate);
  const daysUntilTrip = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
  
  return daysUntilTrip > 0 && ['pending', 'confirmed'].includes(this.status);
};

module.exports = mongoose.model('Booking', bookingSchema);