const mongoose = require('mongoose');

const porterSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Country
  country: {
    type: String,
    enum: ['nepal', 'india', 'bhutan', 'tibet'],
    default: 'nepal',
    required: true
  },

  // Physical Capabilities
  carryingCapacity: {
    type: Number,
    required: [true, 'Carrying capacity is required'],
    min: 10,
    max: 50, // kg
    default: 25
  },
  
  maxAltitude: {
    type: Number,
    required: [true, 'Maximum altitude experience is required'],
    min: 0,
    max: 8848 // meters
  },
  
  physicalCondition: {
    type: String,
    enum: ['excellent', 'very_good', 'good', 'fair'],
    default: 'good'
  },
  
  // Experience
  experience: {
    years: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: 0
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot be more than 500 characters']
    },
    totalExpeditions: {
      type: Number,
      default: 0
    }
  },
  
  // Routes and Regions
  familiarRoutes: [{
    region: {
      type: String,
      enum: ['everest', 'annapurna', 'langtang', 'manaslu', 'mustang', 'kanchenjunga', 'makalu', 'dolpo', 'other'],
      required: true
    },
    specificRoutes: [String],
    timesCompleted: {
      type: Number,
      default: 0
    },
    highestAltitudeReached: Number
  }],
  
  // Languages
  languages: [{
    language: {
      type: String,
      required: true
    },
    proficiency: {
      type: String,
      enum: ['basic', 'intermediate', 'fluent', 'native'],
      default: 'basic'
    }
  }],
  
  // Equipment
  ownEquipment: [{
    item: String,
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'needs_replacement']
    },
    description: String
  }],
  
  // Skills
  additionalSkills: [{
    skill: {
      type: String,
      enum: ['cooking', 'first_aid', 'navigation', 'photography', 'animal_handling', 'camp_setup', 'weather_reading']
    },
    level: {
      type: String,
      enum: ['basic', 'intermediate', 'advanced'],
      default: 'basic'
    },
    certified: Boolean
  }],
  
  // Availability
  availability: {
    calendar: [{
      date: Date,
      available: Boolean,
      booked: Boolean
    }],
    advanceBookingDays: {
      type: Number,
      default: 3
    },
    preferredSeasons: [{
      type: String,
      enum: ['spring', 'summer', 'autumn', 'winter']
    }]
  },
  
  // Pricing
  pricing: {
    dailyRate: {
      type: Number,
      required: [true, 'Daily rate is required'],
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    altitudeBonus: {
      above5000m: Number,
      above6000m: Number
    },
    seasonalRates: [{
      season: {
        type: String,
        enum: ['peak', 'high', 'low']
      },
      rate: Number,
      startDate: Date,
      endDate: Date
    }]
  },
  
  // Health and Safety
  healthCertificates: [{
    type: {
      type: String,
      enum: ['medical_checkup', 'high_altitude_fitness', 'first_aid', 'rescue_training']
    },
    issueDate: Date,
    expiryDate: Date,
    issuingAuthority: String,
    certificateUrl: String,
    verified: Boolean
  }],
  
  insurance: {
    provider: String,
    policyNumber: String,
    coverage: String,
    expiryDate: Date
  },
  
  // Emergency Information
  emergencyContacts: [{
    name: String,
    relationship: String,
    phone: String,
    address: String
  }],
  
  // Reviews and Ratings
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    },
    breakdown: {
      reliability: Number,
      strength: Number,
      attitude: Number,
      punctuality: Number,
      safety: Number
    }
  },
  
  // Work History
  workHistory: [{
    expedition: String,
    guide: {
      type: mongoose.Schema.ObjectId,
      ref: 'Guide'
    },
    client: String,
    route: String,
    duration: Number, // days
    role: String,
    startDate: Date,
    endDate: Date,
    feedback: String,
    rating: Number
  }],
  
  // Statistics
  stats: {
    totalTrips: {
      type: Number,
      default: 0
    },
    totalDays: {
      type: Number,
      default: 0
    },
    averageTripDuration: {
      type: Number,
      default: 0
    },
    highestAltitudeWorked: {
      type: Number,
      default: 0
    },
    successfulTrips: {
      type: Number,
      default: 0
    }
  },
  
  // Verification Status
  verification: {
    status: {
      type: String,
      enum: ['pending', 'in_review', 'verified', 'rejected'],
      default: 'pending'
    },
    verifiedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    verificationDate: Date,
    documents: [{
      type: String,
      url: String,
      verified: Boolean
    }],
    notes: String
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for reviews
porterSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'porter',
  justOne: false
});

// Virtual for current bookings
porterSchema.virtual('currentBookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'porter',
  match: { status: { $in: ['confirmed', 'in_progress'] } }
});

// Index for search optimization
porterSchema.index({ 'familiarRoutes.region': 1 });
porterSchema.index({ 'carryingCapacity': 1 });
porterSchema.index({ 'maxAltitude': 1 });
porterSchema.index({ 'pricing.dailyRate': 1 });
porterSchema.index({ 'rating.average': -1 });
porterSchema.index({ 'verification.status': 1 });

// Update rating when review is added
porterSchema.methods.updateRating = async function() {
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    {
      $match: { porter: this._id }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        avgReliability: { $avg: '$breakdown.reliability' },
        avgStrength: { $avg: '$breakdown.strength' },
        avgAttitude: { $avg: '$breakdown.attitude' },
        avgPunctuality: { $avg: '$breakdown.punctuality' },
        avgSafety: { $avg: '$breakdown.safety' }
      }
    }
  ]);
  
  if (stats.length > 0) {
    this.rating.average = Math.round(stats[0].averageRating * 10) / 10;
    this.rating.count = stats[0].totalReviews;
    this.rating.breakdown = {
      reliability: Math.round(stats[0].avgReliability * 10) / 10,
      strength: Math.round(stats[0].avgStrength * 10) / 10,
      attitude: Math.round(stats[0].avgAttitude * 10) / 10,
      punctuality: Math.round(stats[0].avgPunctuality * 10) / 10,
      safety: Math.round(stats[0].avgSafety * 10) / 10
    };
  } else {
    this.rating.average = 0;
    this.rating.count = 0;
  }
  
  await this.save();
};

module.exports = mongoose.model('Porter', porterSchema);