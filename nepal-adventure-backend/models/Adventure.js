const mongoose = require('mongoose');

const adventureSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Adventure title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Adventure description is required'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot be more than 500 characters']
  },

  // Country
  country: {
    type: String,
    enum: ['nepal', 'india', 'bhutan', 'tibet'],
    default: 'nepal',
    required: true
  },

  // Adventure Type
  type: {
    type: String,
    enum: ['trekking', 'climbing', 'motorbiking', 'cycling', 'rafting', 'paragliding', 'wildlife', 'cultural', 'bungee', 'combo'],
    required: true
  },
  
  category: {
    type: String,
    enum: ['adventure', 'cultural', 'spiritual', 'eco-tourism', 'photography', 'family', 'luxury'],
    default: 'adventure'
  },
  
  // Location
  location: {
    region: {
      type: String,
      enum: ['everest', 'annapurna', 'langtang', 'manaslu', 'mustang', 'kanchenjunga', 'makalu', 'dolpo', 'chitwan', 'bardia', 'pokhara', 'kathmandu', 'other'],
      required: true
    },
    specificArea: String,
    startingPoint: String,
    endingPoint: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Duration and Difficulty
  duration: {
    days: {
      type: Number,
      required: [true, 'Duration in days is required'],
      min: 1
    },
    nights: Number
  },
  
  difficulty: {
    level: {
      type: String,
      enum: ['easy', 'moderate', 'challenging', 'extreme'],
      required: true
    },
    physicalDemand: {
      type: Number,
      min: 1,
      max: 10
    },
    technicalDemand: {
      type: Number,
      min: 1,
      max: 10
    }
  },
  
  // Altitude Information
  altitude: {
    minimum: {
      type: Number,
      min: 0
    },
    maximum: {
      type: Number,
      min: 0
    },
    averageDaily: Number
  },
  
  // Group Information
  group: {
    minSize: {
      type: Number,
      default: 1
    },
    maxSize: {
      type: Number,
      default: 12
    },
    recommendedSize: Number
  },
  
  // Seasons and Best Times
  bestSeasons: [{
    season: {
      type: String,
      enum: ['spring', 'summer', 'autumn', 'winter']
    },
    months: [String],
    description: String
  }],
  
  // Itinerary
  itinerary: [{
    day: Number,
    title: String,
    description: String,
    location: String,
    altitude: Number,
    walkingHours: Number,
    accommodation: String,
    meals: [String],
    highlights: [String]
  }],
  
  // Inclusions and Exclusions
  inclusions: [String],
  exclusions: [String],
  
  // Equipment and Requirements
  requiredEquipment: [{
    item: String,
    description: String,
    provided: Boolean,
    essential: Boolean
  }],
  
  recommendedEquipment: [{
    item: String,
    description: String,
    seasonal: String
  }],
  
  // Prerequisites
  prerequisites: {
    experience: String,
    fitness: {
      type: String,
      enum: ['basic', 'moderate', 'good', 'excellent']
    },
    age: {
      minimum: {
        type: Number,
        default: 16
      },
      maximum: {
        type: Number,
        default: 70
      }
    },
    medicalRequirements: [String],
    skills: [String]
  },
  
  // Pricing
  pricing: {
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    priceIncludes: [String],
    seasonalPricing: [{
      season: String,
      multiplier: Number,
      startDate: Date,
      endDate: Date
    }],
    groupDiscounts: [{
      minSize: Number,
      discount: Number // percentage
    }],
    earlyBirdDiscount: {
      daysInAdvance: Number,
      discount: Number
    }
  },
  
  // Permits and Documentation
  permits: [{
    name: String,
    cost: Number,
    currency: String,
    description: String,
    required: Boolean,
    includedInPrice: Boolean
  }],
  
  // Safety and Risk Management
  safety: {
    riskLevel: {
      type: String,
      enum: ['low', 'moderate', 'high', 'extreme']
    },
    commonRisks: [String],
    safetyMeasures: [String],
    emergencyProcedures: String,
    evacuationPlan: String,
    insuranceRequired: Boolean
  },
  
  // Media
  images: [{
    url: String,
    caption: String,
    isPrimary: Boolean
  }],
  
  videos: [{
    url: String,
    title: String,
    description: String
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
    }
  },
  
  // Booking Information
  availability: {
    isActive: {
      type: Boolean,
      default: true
    },
    advanceBookingDays: {
      type: Number,
      default: 14
    },
    blackoutDates: [Date],
    availableDates: [{
      startDate: Date,
      endDate: Date,
      available: Boolean,
      reason: String
    }]
  },
  
  // Provider Information
  provider: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Statistics
  stats: {
    totalBookings: {
      type: Number,
      default: 0
    },
    completedTrips: {
      type: Number,
      default: 0
    },
    cancelledTrips: {
      type: Number,
      default: 0
    },
    averageGroupSize: {
      type: Number,
      default: 0
    }
  },
  
  // SEO and Marketing
  seo: {
    slug: {
      type: String,
      unique: true
    },
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'active', 'suspended', 'archived'],
    default: 'draft'
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Additional Information
  highlights: [String],
  whatToExpect: [String],
  tips: [String],
  faq: [{
    question: String,
    answer: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for reviews
adventureSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'adventure',
  justOne: false
});

// Virtual for bookings
adventureSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'adventure',
  justOne: false
});

// Create slug from title
adventureSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.seo.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Index for search optimization
adventureSchema.index({ type: 1 });
adventureSchema.index({ 'location.region': 1 });
adventureSchema.index({ 'difficulty.level': 1 });
adventureSchema.index({ 'duration.days': 1 });
adventureSchema.index({ 'pricing.basePrice': 1 });
adventureSchema.index({ 'rating.average': -1 });
adventureSchema.index({ status: 1 });
adventureSchema.index({ 'seo.slug': 1 });

// Text search index
adventureSchema.index({
  title: 'text',
  description: 'text',
  'location.specificArea': 'text',
  highlights: 'text'
});

// Update rating when review is added
adventureSchema.methods.updateRating = async function() {
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    {
      $match: { adventure: this._id }
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

module.exports = mongoose.model('Adventure', adventureSchema);