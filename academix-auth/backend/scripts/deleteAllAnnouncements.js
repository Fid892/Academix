// deleteAllAnnouncements.js
// Run this script with: node scripts/deleteAllAnnouncements.js
// Ensure you have a .env file with MONGODB_URI or appropriate DB connection.

require('dotenv').config();
const mongoose = require('mongoose');

const Announcement = require('../models/Announcement');

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/academix', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to DB');
    // Delete all announcements regardless of postedBy role (faculty, admin, student)
    const result = await Announcement.deleteMany({});
    console.log(`Deleted ${result.deletedCount} announcements`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

main();
