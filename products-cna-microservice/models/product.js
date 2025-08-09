// models/Product.js - FIXED VERSION

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  sku: { type: String, required: true, unique: true }, // Already has unique index
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'USD' },
  category: String,
  department: String,
  image: String,
  stock: { type: Number, default: 0 },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  brand: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  _id: false,
  collection: 'products',
  // Add automatic updatedAt timestamp
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

// Add indexes for better performance (don't duplicate sku since it's already unique)
productSchema.index({ department: 1 });
productSchema.index({ category: 1 });
productSchema.index({ title: 'text', description: 'text' }); // For search
productSchema.index({ price: 1 }); // For price filtering
productSchema.index({ brand: 1 }); // For brand filtering

const Product = mongoose.model('Product', productSchema);

module.exports = Product;