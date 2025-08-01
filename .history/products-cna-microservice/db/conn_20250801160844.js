// db/conn.js - Updated for Railway deployment
const mongoose = require('mongoose');

let _db;

// Check if running on Railway
const IS_RAILWAY = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID;

console.log('=== MONGODB CONNECTION DEBUG ===');
console.log(`Running on Railway: ${!!IS_RAILWAY}`);
console.log(`Railway Environment: ${process.env.RAILWAY_ENVIRONMENT}`);
console.log(`Railway Project ID: ${process.env.RAILWAY_PROJECT_ID}`);
console.log('================================');

module.exports = {
  connectToServer: function (callback) {
    let connectionString;
    
    if (IS_RAILWAY) {
      // Production Railway environment - MUST have MONGO_URI
      connectionString = process.env.MONGO_URI;
      
      if (!connectionString) {
        const error = new Error('MONGO_URI environment variable is required on Railway');
        console.error('❌ ERROR:', error.message);
        return callback(error);
      }
      
      console.log('✅ Using Railway MongoDB Atlas connection');
      console.log(`Database: ${connectionString.split('/').pop().split('?')[0]}`);
      
    } else {
      // Local development with fallback
      console.log('🔧 Using local development MongoDB connection');
      connectionString = process.env.MONGO_URI || 'mongodb://admin:password123@localhost:27017/productdb?authSource=admin';
    }
    
    // Remove deprecated options for MongoDB Node.js Driver v4+
    const connectionOptions = {
      // useNewUrlParser and useUnifiedTopology are deprecated in v4+
      // Remove these options to eliminate warnings
    };
    
    console.log('🔄 Connecting to MongoDB...');
    
    mongoose.connect(connectionString, connectionOptions)
    .then(() => {
      console.log('✅ Successfully connected to MongoDB with Mongoose');
      _db = mongoose.connection;
      
      // Log connection details without exposing credentials
      const dbName = _db.name;
      const host = _db.host;
      const port = _db.port;
      
      console.log(`📊 Connected to database: ${dbName}`);
      console.log(`🌐 Host: ${host}${port ? ':' + port : ''}`);
      
      return callback();
    })
    .catch((err) => {
      console.error('❌ Failed to connect to MongoDB:', err.message);
      console.error('Connection string format check:', {
        hasMongoPrefix: connectionString.startsWith('mongodb'),
        hasCredentials: connectionString.includes('@'),
        hasDatabase: connectionString.includes('/') && connectionString.split('/').length > 3
      });
      return callback(err);
    });
  },

  getDb: function () {
    return _db;
  },

  // Keep for backward compatibility if needed
  getMongoose: function() {
    return mongoose;
  }
};