const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Adventure = require('../models/Adventure');
const Guide = require('../models/Guide');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    console.log('🌱 Starting to seed data...');

    // Clear existing data
    await Adventure.deleteMany({});
    await Guide.deleteMany({});
    await User.deleteMany({});

    console.log('🗑️ Cleared existing data');

    // First create a provider user
    const providerUser = await User.create({
      fullName: 'Nepal Adventures Company',
      email: 'admin@nepaladventures.com',
      password: await bcrypt.hash('password123', 12),
      phone: '+977-9841000000',
      role: 'gear_provider',
      address: { country: 'nepal' },
      isVerified: true
    });

    // Sample adventures for different countries
    const adventures = [
      // Nepal Adventures
      {
        title: 'Everest Base Camp Trek',
        description: 'The ultimate adventure to the base camp of the world\'s highest mountain. Experience breathtaking views of the Himalayas, Sherpa culture, and challenging high-altitude trekking.',
        shortDescription: 'Trek to the base of Mount Everest through stunning Himalayan landscapes',
        type: 'trekking',
        country: 'nepal',
        location: {
          region: 'everest',
          specificArea: 'Khumbu Valley',
          startingPoint: 'Lukla',
          endingPoint: 'Everest Base Camp',
          coordinates: { latitude: 27.9881, longitude: 86.9250 }
        },
        difficulty: {
          level: 'challenging',
          physicalDemand: 8,
          technicalDemand: 4
        },
        duration: { days: 14, nights: 13 },
        pricing: {
          basePrice: 1299,
          currency: 'USD',
          priceType: 'per person',
          discounts: [],
          seasonalPricing: []
        },
        images: [
          {
            url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-4.0.3',
            caption: 'Everest Base Camp View',
            isPrimary: true
          },
          {
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3',
            caption: 'Mountain Landscape',
            isPrimary: false
          }
        ],
        highlights: [
          'Reach Everest Base Camp at 5,364m',
          'Visit Tengboche Monastery',
          'Experience Sherpa culture',
          'Panoramic mountain views'
        ],
        group: { minSize: 2, maxSize: 12, recommendedSize: 8 },
        bestSeasons: [
          {
            season: 'spring',
            months: ['March', 'April', 'May'],
            description: 'Clear mountain views and stable weather'
          },
          {
            season: 'autumn',
            months: ['September', 'October', 'November'],
            description: 'Perfect weather and visibility'
          }
        ],
        inclusions: ['All meals during trek', 'Tea house accommodation', 'All permits', 'Experienced guide', 'Porter service'],
        seo: {
          slug: 'everest-base-camp-trek',
          metaTitle: 'Everest Base Camp Trek - Ultimate Himalayan Adventure',
          metaDescription: 'Trek to Everest Base Camp and experience breathtaking Himalayan views'
        },
        provider: providerUser._id,
        status: 'active'
      },
      {
        title: 'Annapurna Circuit Trek',
        description: 'Classic circuit trek around the Annapurna massif with diverse landscapes, cultures, and the challenging Thorong La Pass.',
        shortDescription: 'Complete circuit around Annapurna with mountain pass crossing',
        type: 'trekking',
        country: 'nepal',
        location: {
          region: 'annapurna',
          specificArea: 'Annapurna Circuit',
          startingPoint: 'Besisahar',
          endingPoint: 'Pokhara',
          coordinates: { latitude: 28.2380, longitude: 84.1300 }
        },
        difficulty: {
          level: 'moderate',
          physicalDemand: 6,
          technicalDemand: 3
        },
        duration: { days: 12, nights: 11 },
        pricing: {
          basePrice: 899,
          currency: 'USD',
          priceType: 'per person',
          discounts: [],
          seasonalPricing: []
        },
        images: [
          {
            url: 'https://images.unsplash.com/photo-1464822759844-d150a8f9e692?ixlib=rb-4.0.3',
            caption: 'Annapurna Mountain Range',
            isPrimary: true
          }
        ],
        highlights: [
          'Cross Thorong La Pass (5,416m)',
          'Visit Muktinath Temple',
          'Diverse landscapes and cultures',
          'Hot springs at Tatopani'
        ],
        group: { minSize: 1, maxSize: 10, recommendedSize: 6 },
        bestSeasons: [
          {
            season: 'spring',
            months: ['March', 'April', 'May'],
            description: 'Perfect weather with clear mountain views'
          },
          {
            season: 'autumn',
            months: ['October', 'November'],
            description: 'Stable weather and excellent visibility'
          }
        ],
        inclusions: ['All meals during trek', 'Tea house accommodation', 'ACAP permit', 'Experienced guide', 'Emergency evacuation'],
        seo: {
          slug: 'annapurna-circuit-trek',
          metaTitle: 'Annapurna Circuit Trek - Classic Nepal Adventure',
          metaDescription: 'Complete circuit around Annapurna with mountain pass crossing'
        },
        provider: providerUser._id,
        status: 'active'
      },
      {
        title: 'Langtang Valley Trek',
        description: 'Beautiful valley trek close to Kathmandu with stunning mountain views and Tamang culture.',
        shortDescription: 'Scenic valley trek with mountain views and local culture',
        type: 'trekking',
        country: 'nepal',
        location: {
          region: 'langtang',
          specificArea: 'Langtang Valley',
          startingPoint: 'Syabrubesi',
          endingPoint: 'Kyanjin Gompa',
          coordinates: { latitude: 28.2000, longitude: 85.3500 }
        },
        difficulty: {
          level: 'easy',
          physicalDemand: 3,
          technicalDemand: 2
        },
        duration: { days: 8, nights: 7 },
        pricing: {
          basePrice: 599,
          currency: 'USD',
          priceType: 'per person',
          discounts: [],
          seasonalPricing: []
        },
        images: [
          {
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3',
            caption: 'Langtang Valley Landscape',
            isPrimary: true
          }
        ],
        highlights: [
          'Langtang Glacier views',
          'Kyanjin Gompa monastery',
          'Tamang cultural villages',
          'Yak cheese factory visit'
        ],
        group: { minSize: 1, maxSize: 8, recommendedSize: 4 },
        bestSeasons: [
          {
            season: 'spring',
            months: ['March', 'April', 'May'],
            description: 'Rhododendron blooms and clear mountain views'
          },
          {
            season: 'autumn',
            months: ['October', 'November'],
            description: 'Perfect weather and crystal clear mountain views'
          }
        ],
        inclusions: ['All meals during trek', 'Tea house accommodation', 'Langtang National Park permit', 'Experienced guide'],
        seo: {
          slug: 'langtang-valley-trek',
          metaTitle: 'Langtang Valley Trek - Beautiful Valley Adventure',
          metaDescription: 'Scenic valley trek with mountain views and local culture'
        },
        provider: providerUser._id,
        status: 'active'
      },

      // India Adventures
      {
        title: 'Kashmir Great Lakes Trek',
        description: 'Spectacular high-altitude trek through pristine alpine lakes in the Kashmir Himalayas.',
        shortDescription: 'High-altitude trek through pristine Kashmir alpine lakes',
        type: 'trekking',
        country: 'india',
        location: {
          region: 'other',
          specificArea: 'Kashmir Great Lakes',
          startingPoint: 'Sonamarg',
          endingPoint: 'Naranag',
          coordinates: { latitude: 34.2996, longitude: 75.2999 }
        },
        difficulty: {
          level: 'moderate',
          physicalDemand: 7,
          technicalDemand: 4
        },
        duration: { days: 8, nights: 7 },
        pricing: {
          basePrice: 699,
          currency: 'USD',
          priceType: 'per person',
          discounts: [],
          seasonalPricing: []
        },
        images: [
          {
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3',
            caption: 'Kashmir Alpine Lakes',
            isPrimary: true
          }
        ],
        highlights: [
          'Seven pristine alpine lakes',
          'Stunning Kashmir valleys',
          'High mountain passes',
          'Wildflower meadows'
        ],
        group: { minSize: 4, maxSize: 15, recommendedSize: 10 },
        bestSeasons: [
          {
            season: 'summer',
            months: ['July', 'August', 'September'],
            description: 'Perfect weather for high-altitude trekking'
          }
        ],
        inclusions: ['All meals during trek', 'Camping accommodation', 'All permits', 'Experienced guide', 'Porter service'],
        seo: {
          slug: 'kashmir-great-lakes-trek',
          metaTitle: 'Kashmir Great Lakes Trek - High-altitude Adventure',
          metaDescription: 'Spectacular high-altitude trek through pristine alpine lakes in Kashmir'
        },
        provider: providerUser._id,
        status: 'active'
      },

      // China Adventures
      {
        title: 'Everest Base Camp North Route',
        description: 'Approach Everest from the Tibet side with vehicle access and stunning mountain views.',
        shortDescription: 'Vehicle-accessible Everest Base Camp from Tibet side',
        type: 'cultural',
        country: 'tibet',
        location: {
          region: 'other',
          specificArea: 'Tibet Autonomous Region',
          startingPoint: 'Lhasa',
          endingPoint: 'Everest Base Camp North',
          coordinates: { latitude: 28.1461, longitude: 86.8544 }
        },
        difficulty: {
          level: 'easy',
          physicalDemand: 2,
          technicalDemand: 1
        },
        duration: { days: 7, nights: 6 },
        pricing: {
          basePrice: 1199,
          currency: 'USD',
          priceType: 'per person',
          discounts: [],
          seasonalPricing: []
        },
        images: [
          {
            url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-4.0.3',
            caption: 'Everest North Face from Tibet',
            isPrimary: true
          }
        ],
        highlights: [
          'Vehicle access to Everest Base Camp',
          'North face of Mount Everest',
          'Rongbuk Monastery visit',
          'Tibetan plateau landscapes'
        ],
        group: { minSize: 2, maxSize: 8, recommendedSize: 6 },
        bestSeasons: [
          {
            season: 'spring',
            months: ['April', 'May'],
            description: 'Clear skies and stable weather'
          },
          {
            season: 'autumn',
            months: ['September', 'October'],
            description: 'Perfect visibility and comfortable temperatures'
          }
        ],
        inclusions: ['All meals', 'Hotel and guesthouse accommodation', 'Tibet travel permit', 'Experienced guide', 'Vehicle transportation'],
        seo: {
          slug: 'everest-base-camp-north-route',
          metaTitle: 'Everest Base Camp North Route - Tibet Adventure',
          metaDescription: 'Vehicle-accessible Everest Base Camp from Tibet side'
        },
        provider: providerUser._id,
        status: 'active'
      },

      // Japan Adventures
      {
        title: 'Mount Fuji Climbing Experience',
        description: 'Climb Japan\'s sacred mountain during the official climbing season.',
        shortDescription: 'Climb Japan\'s iconic Mount Fuji',
        type: 'climbing',
        country: 'nepal',
        location: {
          region: 'other',
          specificArea: 'Mount Fuji National Park',
          startingPoint: 'Kawaguchi Trail',
          endingPoint: 'Mount Fuji Summit',
          coordinates: { latitude: 35.3606, longitude: 138.7274 }
        },
        difficulty: {
          level: 'moderate',
          physicalDemand: 6,
          technicalDemand: 5
        },
        duration: { days: 2, nights: 1 },
        pricing: {
          basePrice: 299,
          currency: 'USD',
          priceType: 'per person',
          discounts: [],
          seasonalPricing: []
        },
        images: [
          {
            url: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?ixlib=rb-4.0.3',
            caption: 'Mount Fuji Sacred Peak',
            isPrimary: true
          }
        ],
        highlights: [
          'Summit of Japan\'s highest peak',
          'Sunrise from Mount Fuji',
          'Sacred mountain pilgrimage',
          'Traditional mountain huts'
        ],
        group: { minSize: 1, maxSize: 6, recommendedSize: 4 },
        bestSeasons: [
          {
            season: 'summer',
            months: ['July', 'August', 'September'],
            description: 'Official climbing season with clear weather'
          }
        ],
        inclusions: ['Mountain hut accommodation', 'Climbing permits', 'Safety equipment', 'Experienced guide'],
        seo: {
          slug: 'mount-fuji-climbing-experience',
          metaTitle: 'Mount Fuji Climbing Experience - Sacred Mountain Adventure',
          metaDescription: 'Climb Japan\'s iconic Mount Fuji during the official climbing season'
        },
        provider: providerUser._id,
        status: 'active'
      }
    ];

    const insertedAdventures = await Adventure.insertMany(adventures);
    console.log(`✅ Inserted ${insertedAdventures.length} adventures`);

    // Sample users and guides
    const users = [
      {
        fullName: 'Pemba Sherpa',
        email: 'pemba@nepaladventures.com',
        password: await bcrypt.hash('password123', 12),
        phone: '+977-9841234567',
        role: 'guide',
        address: { country: 'nepal', city: 'Kathmandu' },
        isVerified: true
      },
      {
        fullName: 'Tenzin Norbu',
        email: 'tenzin@nepaladventures.com',
        password: await bcrypt.hash('password123', 12),
        phone: '+977-9851234567',
        role: 'guide',
        address: { country: 'nepal', city: 'Pokhara' },
        isVerified: true
      },
      {
        fullName: 'John Adventure',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 12),
        phone: '+1-555-123-4567',
        role: 'tourist',
        address: { country: 'usa' },
        isVerified: true
      }
    ];

    const insertedUsers = await User.insertMany(users);
    console.log(`✅ Inserted ${insertedUsers.length} users`);

    // Create guide profiles
    const guides = [
      {
        user: insertedUsers[0]._id,
        country: 'nepal',
        licenseNumber: 'NPL-GUIDE-001',
        specializations: ['trekking', 'climbing', 'cultural'],
        experience: {
          years: 15,
          description: 'Lead guide for Everest Base Camp treks with perfect safety record'
        },
        certifications: [
          {
            name: 'Wilderness First Aid',
            issuingOrganization: 'Nepal Mountaineering Association',
            verified: true
          },
          {
            name: 'High Altitude Guide',
            issuingOrganization: 'Nepal Tourism Board',
            verified: true
          }
        ],
        languages: [
          { language: 'English', proficiency: 'fluent' },
          { language: 'Nepali', proficiency: 'native' },
          { language: 'Hindi', proficiency: 'intermediate' }
        ],
        operatingAreas: [
          {
            region: 'everest',
            specificAreas: ['Everest Base Camp', 'Kala Patthar'],
            maxAltitude: 5545
          },
          {
            region: 'langtang',
            specificAreas: ['Langtang Valley', 'Kyanjin Gompa'],
            maxAltitude: 4600
          }
        ],
        pricing: {
          dailyRate: 50,
          currency: 'USD'
        },
        rating: {
          average: 4.9,
          count: 156
        },
        stats: {
          totalTrips: 200,
          totalClients: 400,
          successfulTrips: 200,
          emergencyIncidents: 0
        },
        verification: {
          status: 'verified'
        },
        isActive: true
      },
      {
        user: insertedUsers[1]._id,
        country: 'nepal',
        licenseNumber: 'NPL-GUIDE-002',
        specializations: ['trekking', 'cultural', 'photography'],
        experience: {
          years: 12,
          description: 'Annapurna specialist with cultural expertise'
        },
        certifications: [
          {
            name: 'Mountain Guide',
            issuingOrganization: 'Nepal Mountaineering Association',
            verified: true
          },
          {
            name: 'Cultural Heritage Guide',
            issuingOrganization: 'Nepal Tourism Board',
            verified: true
          }
        ],
        languages: [
          { language: 'English', proficiency: 'fluent' },
          { language: 'Nepali', proficiency: 'native' }
        ],
        operatingAreas: [
          {
            region: 'annapurna',
            specificAreas: ['Annapurna Circuit', 'Poon Hill'],
            maxAltitude: 5416
          },
          {
            region: 'langtang',
            specificAreas: ['Langtang Valley'],
            maxAltitude: 4600
          }
        ],
        pricing: {
          dailyRate: 45,
          currency: 'USD'
        },
        rating: {
          average: 4.8,
          count: 89
        },
        stats: {
          totalTrips: 150,
          totalClients: 280,
          successfulTrips: 150,
          emergencyIncidents: 0
        },
        verification: {
          status: 'verified'
        },
        isActive: true
      }
    ];

    const insertedGuides = await Guide.insertMany(guides);
    console.log(`✅ Inserted ${insertedGuides.length} guides`);

    console.log('🎉 Database seeded successfully!');
    console.log(`
📊 Summary:
- Adventures: ${insertedAdventures.length}
- Users: ${insertedUsers.length}
- Guides: ${insertedGuides.length}

🔗 Test the API:
- GET /api/adventures
- GET /api/adventures?country=nepal
- GET /api/adventures?country=india
- GET /api/guides
- POST /api/auth/login
  Email: pemba@nepaladventures.com
  Password: password123
    `);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seed script
seedData();