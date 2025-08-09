// db/conn.js - FIXED VERSION
const mongoose = require('mongoose');

let _db;

module.exports = {
  connectToServer: function (callback) {
    // ✅ SECURE: Only use environment variables, no hardcoded fallback
    const connectionString = process.env.MONGO_URI;

    if (!connectionString) {
      const error = new Error('MONGO_URI environment variable is required');
      console.error('Database configuration error:', error.message);
      return callback(error);
    }

    // ✅ FIXED: Updated connection options for Mongoose 8.x
    const connectionOptions = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      // Removed deprecated options: bufferMaxEntries, bufferCommands, useNewUrlParser, useUnifiedTopology
    };

    mongoose.connect(connectionString, connectionOptions)
      .then(() => {
        console.log('✅ Successfully connected to MongoDB with Mongoose');
        _db = mongoose.connection;

        // ✅ SECURE: Log connection info without credentials
        const dbName = mongoose.connection.db.databaseName;
        const host = mongoose.connection.host;
        console.log(`📊 Connected to database: ${dbName} on ${host}`);

        return callback();
      })
      .catch((err) => {
        console.error('❌ Failed to connect to MongoDB:', err.message);
        return callback(err);
      });
  },

  getDb: function () {
    return _db;
  },

  // Keep for backward compatibility if needed
  closeConnection: function () {
    if (_db) {
      mongoose.disconnect();
      console.log('🔚 MongoDB connection closed');
    }
  }
};