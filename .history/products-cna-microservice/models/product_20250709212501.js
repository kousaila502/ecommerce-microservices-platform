// models/Product.js

const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  sku: { type: String, required: true },
  thumbnail: String,
  image: String,
  attributes: {
    type: mongoose.Schema.Types.Mixed, // <-- allow flexibility
    default: {}
  },
  secondaryAttributes: {
    type: mongoose.Schema.Types.Mixed, // <-- allow flexibility
    default: {}
  }
});

const productSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  department: { type: String, required: true },
  category: { type: String, required: true },
  thumbnail: String,
  image: String,
  title: { type: String, required: true },
  description: String,
  shortDescription: String,
  price: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'USD' },
  rating: { type: Number, min: 0, max: 5 },
  attributes: {
    type: mongoose.Schema.Types.Mixed, // <-- allow flexibility
    default: {}
  },
  secondaryAttributes: {
    type: mongoose.Schema.Types.Mixed, // <-- allow flexibility
    default: {}
  },
  variants: [variantSchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  _id: false,
  collection: 'products'
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;