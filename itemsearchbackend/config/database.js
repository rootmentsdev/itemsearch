const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // 🚀 Performance: Add timeout and connection pool settings to prevent 1+ minute delays
    const conn = await mongoose.connect(
      'mongodb+srv://abhiram:root@cluster0.niouvcp.mongodb.net/itemsearch?retryWrites=true&w=majority',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        
        // 🚀 Connection Timeout Settings (prevent 1+ minute delays)
        serverSelectionTimeoutMS: 5000,  // Fail fast if can't connect (5 seconds instead of 30s default)
        connectTimeoutMS: 10000,         // 10 seconds max for initial connection
        socketTimeoutMS: 45000,           // 45 seconds for socket operations
        
        // 🚀 Connection Pool Settings (keep connections alive)
        maxPoolSize: 10,                  // Maximum connections in pool
        minPoolSize: 2,                   // Keep at least 2 connections alive (prevents cold starts)
        maxIdleTimeMS: 30000,             // Keep idle connections for 30 seconds (prevents closing)
        
        // 🚀 Keep Connection Alive
        heartbeatFrequencyMS: 10000,      // Send heartbeat every 10 seconds to keep connection alive
      }
    );

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // 🚀 Handle connection events for better monitoring
    mongoose.connection.on('connected', () => {
      console.log('✅ Mongoose connected to MongoDB');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ Mongoose disconnected from MongoDB');
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// 🚀 Helper function to check if MongoDB is connected before operations
const isConnected = () => {
  return mongoose.connection.readyState === 1; // 1 = connected
};

module.exports = { connectDB, isConnected };

