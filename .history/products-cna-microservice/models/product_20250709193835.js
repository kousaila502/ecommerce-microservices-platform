// models/Product.js
const mongoose = require('mongoose');

// Define variant schema for product variants
const variantSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true
  },
  thumbnail: String,
  image: String,
  attributes: {
    size: {
      US: String
    },
    color: String
  },
  secondaryAttributes: {
    width: String,
    heelHeight: Number
  }
});

// Define main product schema
const productSchema = new mongoose.Schema({
  _id: {
    type: Number,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  thumbnail: String,
  image: String,
  title: {
    type: String,
    required: true
  },
  description: String,
  shortDescription: String,
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  attributes: {
    brand: String
  },
  secondaryAttributes: {
    style: String,
    type: String
  },
  variants: [variantSchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  _id: false  // Disable automatic _id generation, we'll use custom numbers
});

// Create model
const Product = mongoose.model('Product', productSchema);

module.exports = Product;