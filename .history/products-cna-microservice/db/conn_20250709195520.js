// db/conn.js - Updated for Mongoose
const mongoose = require('mongoose');

let _db;

module.exports = {
  connectToServer: function (callback) {
    const connectionString = process.env.MONGO_URI || 'mongodb://admin:password123@localhost:27017/productdb?authSource=admin';
    
    mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(() => {
      console.log('Successfully connected to MongoDB with Mongoose');
      _db = mongoose.connection;
      return callback();
    })
    .catch((err) => {
      console.error('Failed to connect to MongoDB:', err);
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