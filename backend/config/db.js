const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
  try {
    // Override DNS servers to resolve MongoDB SRV records
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch (e) {
      console.warn('DNS override failed, following system defaults:', e.message);
    }
    
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/blog-platform');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.log('⚠️ Server will continue running, but database operations will fail.');
  }
};

module.exports = connectDB;
