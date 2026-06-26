// Force public DNS resolver to fix querySrv ECONNREFUSED issues with MongoDB Atlas on Windows/certain ISPs
const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const seedAdmin = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI is not defined in your env variables');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Delete existing user if any to avoid duplication
    await User.deleteOne({ email: 'abc123@gmail.com' });

    // Create seed admin user
    const adminUser = await User.create({
      name: 'Super Admin',
      email: 'abc123@gmail.com',
      password: 'admin.123',
      role: 'Super Admin'
    });

    console.log(`\n======================================================`);
    console.log(`🎉 Seed Successful!`);
    console.log(`Super Admin user initialized:`);
    console.log(`Email:    ${adminUser.email}`);
    console.log(`Password: admin.123`);
    console.log(`Role:     ${adminUser.role}`);
    console.log(`======================================================\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedAdmin();
