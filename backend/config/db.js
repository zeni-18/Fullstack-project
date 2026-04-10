const mongoose = require('mongoose');

// Cache the connection so serverless functions reuse it across invocations
let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = { bufferCommands: false };
        cached.promise = mongoose.connect(
            process.env.MONGO_URI || 'mongodb://localhost:27017/blog-platform',
            opts
        ).then((mongoose) => {
            console.log(`MongoDB Connected: ${mongoose.connection.host}`);
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        console.error(`MongoDB Error: ${error.message}`);
        console.log('⚠️ Server will continue running, but database operations will fail.');
    }

    return cached.conn;
};

module.exports = connectDB;

