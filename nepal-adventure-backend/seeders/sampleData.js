const mongoose = require('mongoose');
const Adventure = require('../models/Adventure');
const Guide = require('../models/Guide');
const Porter = require('../models/Porter');
const User = require('../models/User');
const Booking = require('../models/Booking');
const bcryptjs = require('bcryptjs');

// Sample data for different countries
const sampleData = {
  nepal: {
    adventures: [
      {
        title: "Everest Base Camp Trek",
        description: "Experience the legendary trek to Everest Base Camp, walking in the footsteps of mountaineering heroes through the stunning Khumbu Valley.",
        shortDescription: "14-day trek to the base camp of the world's highest mountain",
        country: "nepal",
        type: "trekking",
        category: "adventure",
        location: {
          region: "everest",
          specificArea: "Khumbu Valley",
          startingPoint: "Lukla",
          endingPoint: "Everest Base Camp",
          coordinates: { latitude: 27.9881, longitude: 86.9250 }
        },
        duration: { days: 14, nights: 13 },
        difficulty: { level: "challenging", physicalDemand: 8, technicalDemand: 6 },
        altitude: { maxAltitude: 5364, acclimatizationDays: 3 },
        pricing: { basePrice: 1299, currency: "USD", includes: ["Guide", "Permits", "Accommodation"] },
        groupSize: { min: 2, max: 12, optimal: 8 },
        bestSeason: ["march", "april", "may", "september", "october", "november"],
        status: "active"
      },
      {
        title: "Annapurna Circuit Trek",
        description: "Classic circuit trek around the Annapurna massif, featuring diverse landscapes and rich cultural experiences.",
        shortDescription: "16-day circuit trek through diverse terrains and cultures",
        country: "nepal",
        type: "trekking",
        category: "adventure",
        location: {
          region: "annapurna",
          specificArea: "Annapurna Conservation Area",
          startingPoint: "Besisahar",
          endingPoint: "Pokhara",
          coordinates: { latitude: 28.6000, longitude: 84.0000 }
        },
        duration: { days: 16, nights: 15 },
        difficulty: { level: "moderate", physicalDemand: 7, technicalDemand: 5 },
        altitude: { maxAltitude: 5416, acclimatizationDays: 2 },
        pricing: { basePrice: 999, currency: "USD", includes: ["Guide", "Permits", "Some meals"] },
        groupSize: { min: 2, max: 15, optimal: 10 },
        bestSeason: ["march", "april", "may", "october", "november"],
        status: "active"
      },
      {
        title: "Langtang Valley Trek",
        description: "Beautiful valley trek close to Kathmandu, offering stunning mountain views and Tamang culture.",
        shortDescription: "7-day trek through pristine valley and traditional villages",
        country: "nepal",
        type: "trekking",
        category: "cultural",
        location: {
          region: "langtang",
          specificArea: "Langtang National Park",
          startingPoint: "Syabrubesi",
          endingPoint: "Kyanjin Gompa",
          coordinates: { latitude: 28.2167, longitude: 85.5167 }
        },
        duration: { days: 7, nights: 6 },
        difficulty: { level: "moderate", physicalDemand: 6, technicalDemand: 4 },
        altitude: { maxAltitude: 4984, acclimatizationDays: 1 },
        pricing: { basePrice: 599, currency: "USD", includes: ["Guide", "Permits", "Accommodation"] },
        groupSize: { min: 2, max: 12, optimal: 8 },
        bestSeason: ["march", "april", "may", "october", "november"],
        status: "active"
      }
    ],
    users: [
      {
        fullName: "Pemba Sherpa",
        email: "pemba.sherpa@example.com",
        password: "password123",
        role: "guide",
        phone: "+977-1234567890",
        address: { city: "Namche Bazaar", state: "Sagarmatha", country: "nepal" }
      },
      {
        fullName: "Lakpa Sherpa",
        email: "lakpa.sherpa@example.com",
        password: "password123",
        role: "porter",
        phone: "+977-1234567891",
        address: { city: "Lukla", state: "Sagarmatha", country: "nepal" }
      },
      {
        fullName: "Ang Dorje",
        email: "ang.dorje@example.com",
        password: "password123",
        role: "guide",
        phone: "+977-1234567892",
        address: { city: "Pokhara", state: "Gandaki", country: "nepal" }
      }
    ]
  },
  india: {
    adventures: [
      {
        title: "Chadar Trek (Frozen River)",
        description: "Walk on the frozen Zanskar River in the heart of Ladakh during winter.",
        shortDescription: "9-day winter trek on frozen river in Ladakh",
        country: "india",
        type: "trekking",
        category: "adventure",
        location: {
          region: "other",
          specificArea: "Zanskar Valley, Ladakh",
          startingPoint: "Leh",
          endingPoint: "Nerak Village",
          coordinates: { latitude: 33.7782, longitude: 76.5762 }
        },
        duration: { days: 9, nights: 8 },
        difficulty: { level: "extreme", physicalDemand: 9, technicalDemand: 7 },
        altitude: { maxAltitude: 3850, acclimatizationDays: 2 },
        pricing: { basePrice: 899, currency: "USD", includes: ["Guide", "Permits", "Equipment"] },
        groupSize: { min: 4, max: 10, optimal: 6 },
        bestSeason: ["january", "february", "march"],
        status: "active"
      }
    ],
    users: [
      {
        fullName: "Rajesh Kumar",
        email: "rajesh.kumar@example.com",
        password: "password123",
        role: "guide",
        phone: "+91-9876543210",
        address: { city: "Leh", state: "Ladakh", country: "india" }
      }
    ]
  }
};

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await Adventure.deleteMany({});
    await Guide.deleteMany({});
    await Porter.deleteMany({});
    await User.deleteMany({ role: { $in: ['guide', 'porter'] } });
    await Booking.deleteMany({});

    console.log('✅ Cleared existing data');

    // Seed data for each country
    for (const [country, data] of Object.entries(sampleData)) {
      console.log(`\n🏴 Seeding data for ${country.toUpperCase()}`);

      // Create users first
      const createdUsers = [];
      for (const userData of data.users) {
        const hashedPassword = await bcryptjs.hash(userData.password, 12);
        const user = await User.create({
          ...userData,
          password: hashedPassword
        });
        createdUsers.push(user);
        console.log(`  👤 Created user: ${user.fullName} (${user.role})`);
      }

      // Create adventures (assign to first available user as provider)
      const createdAdventures = [];
      for (const adventureData of data.adventures) {
        const adventureWithProvider = {
          ...adventureData,
          provider: createdUsers[0]._id // Assign first user as provider
        };
        const adventure = await Adventure.create(adventureWithProvider);
        createdAdventures.push(adventure);
        console.log(`  🏔️ Created adventure: ${adventure.title}`);
      }

      // Create guides and porters
      for (const user of createdUsers) {
        if (user.role === 'guide') {
          const guide = await Guide.create({
            user: user._id,
            country: country,
            licenseNumber: `GUIDE-${country.toUpperCase()}-${Math.random().toString(36).substr(2, 9)}`,
            specializations: ['trekking', 'cultural'],
            languages: [
              { language: 'english', proficiency: 'fluent' },
              { language: 'nepali', proficiency: 'native' }
            ],
            experience: {
              years: Math.floor(Math.random() * 15) + 5,
              description: 'Experienced mountain guide with extensive knowledge of local culture and terrain.'
            },
            pricing: {
              dailyRate: 50 + Math.floor(Math.random() * 50),
              currency: 'USD'
            },
            operatingAreas: [{ region: 'everest' }, { region: 'annapurna' }],
            availability: {
              status: 'available',
              calendar: []
            },
            verification: {
              status: 'verified',
              verifiedAt: new Date(),
              documents: ['license', 'insurance']
            },
            rating: {
              average: 4.2 + Math.random() * 0.8,
              count: Math.floor(Math.random() * 50) + 10
            },
            isActive: true
          });
          console.log(`  🧗 Created guide profile: ${user.fullName}`);
        }

        if (user.role === 'porter') {
          const porter = await Porter.create({
            user: user._id,
            country: country,
            carryingCapacity: 20 + Math.floor(Math.random() * 20),
            maxAltitude: 4000 + Math.floor(Math.random() * 1500),
            physicalCondition: 'excellent',
            experience: {
              years: Math.floor(Math.random() * 10) + 3,
              description: 'Strong and reliable porter with extensive high-altitude experience.'
            },
            pricing: {
              dailyRate: 25 + Math.floor(Math.random() * 25),
              currency: 'USD'
            },
            familiarRoutes: [{ region: 'everest' }, { region: 'annapurna' }],
            languages: [
              { language: 'english', proficiency: 'intermediate' },
              { language: 'nepali', proficiency: 'native' }
            ],
            verification: {
              status: 'verified',
              verifiedAt: new Date()
            },
            rating: {
              average: 4.0 + Math.random() * 1.0,
              count: Math.floor(Math.random() * 30) + 5
            },
            isActive: true
          });
          console.log(`  🎒 Created porter profile: ${user.fullName}`);
        }
      }

      console.log(`✅ Completed seeding for ${country}`);
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Adventures: ${await Adventure.countDocuments()}`);
    console.log(`   - Guides: ${await Guide.countDocuments()}`);
    console.log(`   - Porters: ${await Porter.countDocuments()}`);
    console.log(`   - Users: ${await User.countDocuments({ role: { $in: ['guide', 'porter'] } })}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

module.exports = { seedDatabase, sampleData };