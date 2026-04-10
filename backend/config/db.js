const mongoose = require('mongoose');
const dns = require('dns');

// Override DNS to fix querySrv ECONNREFUSED resolving MongoDB Atlas SRV records on Windows
try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
    console.warn('DNS override failed, using system defaults:', e.message);
}

// Cache the connection so it's reused across requests (good for Render cold starts too)
let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(
            process.env.MONGO_URI || 'mongodb://localhost:27017/blog-platform'
        ).then((m) => {
            console.log(`MongoDB Connected: ${m.connection.host}`);
            return m;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        console.error(`MongoDB Error: ${error.message}`);
        console.log('⚠️ Server will continue, but database operations will fail.');
    }

    return cached.conn;
};

module.exports = connectDB;


