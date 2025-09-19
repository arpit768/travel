const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { seedDatabase } = require('./seeders/sampleData');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
};

// Main function
async function main() {
  await connectDB();
  await seedDatabase();
  process.exit(0);
}

// Run seeder
if (require.main === module) {
  main().catch(error => {
    console.error('Seeder error:', error);
    process.exit(1);
  });
}