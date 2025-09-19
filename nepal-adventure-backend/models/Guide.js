const mongoose = require('mongoose');

const guideSchema = new mongoose.Schema({
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

  // Professional Information
  licenseNumber: {
    type: String,
    required: [true, 'Guide license number is required'],
    unique: true
  },
  
  specializations: [{
    type: String,
    enum: ['trekking', 'climbing', 'cultural', 'wildlife', 'photography', 'spiritual', 'adventure', 'eco-tourism'],
    required: true
  }],
  
  languages: [{
    language: {
      type: String,
      required: true
    },
    proficiency: {
      type: String,
      enum: ['basic', 'intermediate', 'fluent', 'native'],
      default: 'intermediate'
    }
  }],
  
  experience: {
    years: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: 0
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot be more than 1000 characters']
    }
  },
  
  // Certifications
  certifications: [{
    name: {
      type: String,
      required: true
    },
    issuingOrganization: String,
    issueDate: Date,
    expiryDate: Date,
    certificateUrl: String,
    verified: {
      type: Boolean,
      default: false
    }
  }],
  
  // Areas of Operation
  operatingAreas: [{
    region: {
      type: String,
      enum: ['everest', 'annapurna', 'langtang', 'manaslu', 'mustang', 'kanchenjunga', 'makalu', 'dolpo', 'other'],
      required: true
    },
    specificAreas: [String],
    maxAltitude: {
      type: Number,
      min: 0
    }
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
      default: 7
    },
    maxGroupSize: {
      type: Number,
      default: 10
    }
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
    seasonalRates: [{
      season: {
        type: String,
        enum: ['peak', 'high', 'low']
      },
      rate: Number,
      startDate: Date,
      endDate: Date
    }],
    groupDiscounts: [{
      minSize: Number,
      discount: Number // percentage
    }]
  },
  
  // Equipment & Services
  equipmentProvided: [{
    item: String,
    description: String,
    included: Boolean
  }],
  
  servicesIncluded: {
    transportation: Boolean,
    meals: Boolean,
    accommodation: Boolean,
    permits: Boolean,
    insurance: Boolean,
    firstAid: Boolean,
    emergencyEvacuation: Boolean
  },
  
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
    }
  },
  
  // Statistics
  stats: {
    totalTrips: {
      type: Number,
      default: 0
    },
    totalClients: {
      type: Number,
      default: 0
    },
    successfulTrips: {
      type: Number,
      default: 0
    },
    emergencyIncidents: {
      type: Number,
      default: 0
    }
  },
  
  // Portfolio
  portfolio: {
    photos: [String], // URLs to photos
    videos: [String], // URLs to videos
    testimonials: [{
      client: String,
      message: String,
      date: Date,
      rating: Number
    }]
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
guideSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'guide',
  justOne: false
});

// Virtual for current bookings
guideSchema.virtual('currentBookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'guide',
  match: { status: { $in: ['confirmed', 'in_progress'] } }
});

// Index for search optimization
guideSchema.index({ 'specializations': 1 });
guideSchema.index({ 'operatingAreas.region': 1 });
guideSchema.index({ 'languages.language': 1 });
guideSchema.index({ 'pricing.dailyRate': 1 });
guideSchema.index({ 'rating.average': -1 });
guideSchema.index({ 'verification.status': 1 });

// Update rating when review is added
guideSchema.methods.updateRating = async function() {
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    {
      $match: { guide: this._id }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  
  if (stats.length > 0) {
    this.rating.average = Math.round(stats[0].averageRating * 10) / 10;
    this.rating.count = stats[0].totalReviews;
  } else {
    this.rating.average = 0;
    this.rating.count = 0;
  }
  
  await this.save();
};

module.exports = mongoose.model('Guide', guideSchema);