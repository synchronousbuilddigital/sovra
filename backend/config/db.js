const mongoose = require('mongoose');
const dns = require('node:dns');

// Force DNS resolution to use public DNS (fixes querySrv ECONNREFUSED on some networks)
dns.setServers(['8.8.8.8', '1.1.1.1']);

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    require('dotenv').config();
  }
  
  if (!process.env.MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
