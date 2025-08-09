const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
    dealId: { type: Number, required: true, unique: true },
    productId: { type: Number, required: true },
    variantSku: { type: String, required: true },
    department: { type: String, required: true },
    thumbnail: String,
    image: String,
    title: { type: String, required: true },
    description: String,
    shortDescription: String,
    price: { type: Number, required: true, min: 0 },
    originalPrice: Number, // For showing discount
    currency: { type: String, default: 'USD' },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    discount: { type: Number, min: 0, max: 100 }, // Percentage discount
    isActive: { type: Boolean, default: true },
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    lastUpdated: { type: Date, default: Date.now }
}, {
    collection: 'deals',
    timestamps: { createdAt: 'createdAt', updatedAt: 'lastUpdated' }
});

// Add indexes for better performance
dealSchema.index({ department: 1 });
dealSchema.index({ productId: 1 });
dealSchema.index({ isActive: 1 });
dealSchema.index({ startDate: 1, endDate: 1 });

const Deal = mongoose.model('Deal', dealSchema);

module.exports = Deal;