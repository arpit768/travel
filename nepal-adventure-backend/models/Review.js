const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // Review Target
  reviewType: {
    type: String,
    enum: ['guide', 'porter', 'adventure', 'gear_provider'],
    required: true
  },
  
  // References
  guide: {
    type: mongoose.Schema.ObjectId,
    ref: 'Guide'
  },
  
  porter: {
    type: mongoose.Schema.ObjectId,
    ref: 'Porter'
  },
  
  adventure: {
    type: mongoose.Schema.ObjectId,
    ref: 'Adventure'
  },
  
  gearProvider: {
    type: mongoose.Schema.ObjectId,
    ref: 'GearProvider'
  },
  
  // Reviewer
  reviewer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  
  booking: {
    type: mongoose.Schema.ObjectId,
    ref: 'Booking',
    required: true
  },
  
  // Review Content
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  
  review: {
    type: String,
    required: [true, 'Review text is required'],
    maxlength: [1000, 'Review cannot be more than 1000 characters']
  },
  
  // Detailed Breakdown (for guides and porters)
  breakdown: {
    professionalism: {
      type: Number,
      min: 1,
      max: 5
    },
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    safety: {
      type: Number,
      min: 1,
      max: 5
    },
    knowledge: {
      type: Number,
      min: 1,
      max: 5
    },
    punctuality: {
      type: Number,
      min: 1,
      max: 5
    },
    // Porter specific
    reliability: {
      type: Number,
      min: 1,
      max: 5
    },
    strength: {
      type: Number,
      min: 1,
      max: 5
    },
    attitude: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  
  // Adventure specific ratings
  adventureRating: {
    organization: {
      type: Number,
      min: 1,
      max: 5
    },
    valueForMoney: {
      type: Number,
      min: 1,
      max: 5
    },
    accommodation: {
      type: Number,
      min: 1,
      max: 5
    },
    meals: {
      type: Number,
      min: 1,
      max: 5
    },
    difficulty: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  
  // Additional Information
  pros: [String],
  cons: [String],
  
  // Would recommend
  wouldRecommend: {
    type: Boolean,
    default: true
  },
  
  // Photos
  photos: [{
    url: String,
    caption: String
  }],
  
  // Trip Information
  tripDate: Date,
  tripDuration: Number, // days
  groupSize: Number,
  
  // Review Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending'
  },
  
  // Moderation
  moderation: {
    moderatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    moderatedAt: Date,
    moderationNotes: String,
    flaggedReason: String
  },
  
  // Helpfulness
  helpfulness: {
    helpful: {
      type: Number,
      default: 0
    },
    notHelpful: {
      type: Number,
      default: 0
    },
    totalVotes: {
      type: Number,
      default: 0
    }
  },
  
  // Response from service provider
  response: {
    text: String,
    respondedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  
  // Verification
  verified: {
    type: Boolean,
    default: false
  },
  
  verificationMethod: {
    type: String,
    enum: ['booking_confirmed', 'photo_evidence', 'manual_verification']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Ensure one review per booking per service
reviewSchema.index({ 
  booking: 1, 
  reviewType: 1, 
  guide: 1, 
  porter: 1, 
  adventure: 1 
}, { 
  unique: true, 
  partialFilterExpression: { 
    $or: [
      { guide: { $exists: true } },
      { porter: { $exists: true } },
      { adventure: { $exists: true } },
      { gearProvider: { $exists: true } }
    ]
  }
});

// Index for performance
reviewSchema.index({ reviewer: 1, createdAt: -1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ rating: -1 });

// Calculate overall rating from breakdown
reviewSchema.pre('save', function(next) {
  if (this.breakdown && Object.keys(this.breakdown).length > 0) {
    const validRatings = Object.values(this.breakdown).filter(rating => rating && rating > 0);
    if (validRatings.length > 0) {
      const average = validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length;
      this.rating = Math.round(average * 10) / 10;
    }
  }
  next();
});

// Update target rating after review is saved
reviewSchema.post('save', async function() {
  try {
    if (this.guide) {
      const Guide = mongoose.model('Guide');
      const guide = await Guide.findById(this.guide);
      if (guide) {
        await guide.updateRating();
      }
    }
    
    if (this.porter) {
      const Porter = mongoose.model('Porter');
      const porter = await Porter.findById(this.porter);
      if (porter) {
        await porter.updateRating();
      }
    }
    
    if (this.adventure) {
      const Adventure = mongoose.model('Adventure');
      const adventure = await Adventure.findById(this.adventure);
      if (adventure) {
        await adventure.updateRating();
      }
    }
  } catch (error) {
    console.error('Error updating ratings:', error);
  }
});

// Virtual for helpfulness percentage
reviewSchema.virtual('helpfulnessPercentage').get(function() {
  if (this.helpfulness.totalVotes === 0) return 0;
  return Math.round((this.helpfulness.helpful / this.helpfulness.totalVotes) * 100);
});

module.exports = mongoose.model('Review', reviewSchema);