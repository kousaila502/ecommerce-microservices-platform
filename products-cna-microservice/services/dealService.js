// services/dealService.js - COMPLETE DEAL SERVICE

const Deal = require('../models/deal');

class DealService {

    // Get all deals
    static async getAllDeals(limit = 50) {
        try {
            return await Deal.find({ isActive: true })
                .sort({ lastUpdated: -1 })
                .limit(limit);
        } catch (error) {
            throw new Error(`Error fetching deals: ${error.message}`);
        }
    }

    // Get deal by ID
    static async getDealById(dealId) {
        try {
            const deal = await Deal.findOne({ dealId: parseInt(dealId), isActive: true });
            if (!deal) {
                throw new Error('Deal not found');
            }
            return deal;
        } catch (error) {
            throw new Error(`Error fetching deal: ${error.message}`);
        }
    }

    // Create new deal
    static async createDeal(dealData) {
        try {
            // Validate required fields
            if (!dealData.title || !dealData.price || !dealData.productId) {
                throw new Error('Title, price, and productId are required');
            }

            // Generate dealId if not provided
            if (!dealData.dealId) {
                const lastDeal = await Deal.findOne().sort({ dealId: -1 });
                dealData.dealId = lastDeal ? lastDeal.dealId + 1 : 9241;
            }

            // Check if dealId already exists
            const existingDeal = await Deal.findOne({ dealId: dealData.dealId });
            if (existingDeal) {
                throw new Error('Deal ID already exists');
            }

            const deal = new Deal(dealData);
            return await deal.save();
        } catch (error) {
            throw new Error(`Error creating deal: ${error.message}`);
        }
    }

    // Update deal
    static async updateDeal(dealId, updateData) {
        try {
            delete updateData.dealId; // Prevent changing dealId
            updateData.lastUpdated = new Date();

            const deal = await Deal.findOneAndUpdate(
                { dealId: parseInt(dealId), isActive: true },
                updateData,
                { new: true, runValidators: true }
            );

            if (!deal) {
                throw new Error('Deal not found');
            }

            return deal;
        } catch (error) {
            throw new Error(`Error updating deal: ${error.message}`);
        }
    }

    // Delete deal (soft delete)
    static async deleteDeal(dealId) {
        try {
            const deal = await Deal.findOneAndUpdate(
                { dealId: parseInt(dealId) },
                { isActive: false, lastUpdated: new Date() },
                { new: true }
            );

            if (!deal) {
                throw new Error('Deal not found');
            }

            return deal;
        } catch (error) {
            throw new Error(`Error deleting deal: ${error.message}`);
        }
    }

    // Hard delete deal (completely remove from database)
    static async hardDeleteDeal(dealId) {
        try {
            const deal = await Deal.findOneAndDelete({ dealId: parseInt(dealId) });

            if (!deal) {
                throw new Error('Deal not found');
            }

            return deal;
        } catch (error) {
            throw new Error(`Error hard deleting deal: ${error.message}`);
        }
    }

    // Get deals by department
    static async getDealsByDepartment(department, limit = 50) {
        try {
            return await Deal.find({
                department: new RegExp(department, 'i'),
                isActive: true
            })
                .sort({ lastUpdated: -1 })
                .limit(limit);
        } catch (error) {
            throw new Error(`Error fetching deals by department: ${error.message}`);
        }
    }

    // Get deals by product ID
    static async getDealsByProductId(productId, limit = 50) {
        try {
            return await Deal.find({
                productId: parseInt(productId),
                isActive: true
            })
                .sort({ lastUpdated: -1 })
                .limit(limit);
        } catch (error) {
            throw new Error(`Error fetching deals by product ID: ${error.message}`);
        }
    }

    // Get deals by price range
    static async getDealsByPriceRange(minPrice, maxPrice, limit = 50) {
        try {
            return await Deal.find({
                price: { $gte: minPrice, $lte: maxPrice },
                isActive: true
            })
                .sort({ price: 1 })
                .limit(limit);
        } catch (error) {
            throw new Error(`Error fetching deals by price range: ${error.message}`);
        }
    }

    // Search deals by title, description, or department
    static async searchDeals(searchTerm, limit = 20) {
        try {
            const regex = new RegExp(searchTerm, 'i'); // Case-insensitive search

            return await Deal.find({
                isActive: true,
                $or: [
                    { title: regex },
                    { description: regex },
                    { department: regex },
                    { shortDescription: regex }
                ]
            })
                .sort({ rating: -1, lastUpdated: -1 }) // Sort by rating then by date
                .limit(limit);
        } catch (error) {
            throw new Error(`Error searching deals: ${error.message}`);
        }
    }

    // Get top rated deals
    static async getTopRatedDeals(limit = 10) {
        try {
            return await Deal.find({
                rating: { $gte: 4.0 },
                isActive: true
            })
                .sort({ rating: -1, lastUpdated: -1 })
                .limit(limit);
        } catch (error) {
            throw new Error(`Error fetching top rated deals: ${error.message}`);
        }
    }

    // Get deal statistics
    static async getDealStats() {
        try {
            const stats = await Deal.aggregate([
                { $match: { isActive: true } },
                {
                    $group: {
                        _id: null,
                        totalDeals: { $sum: 1 },
                        averagePrice: { $avg: { $toDouble: "$price" } },
                        averageRating: { $avg: { $toDouble: "$rating" } },
                        minPrice: { $min: "$price" },
                        maxPrice: { $max: "$price" },
                        departments: { $addToSet: "$department" },
                        productCount: { $addToSet: "$productId" }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalDeals: 1,
                        averagePrice: { $round: ["$averagePrice", 2] },
                        averageRating: { $round: ["$averageRating", 2] },
                        minPrice: 1,
                        maxPrice: 1,
                        departmentCount: { $size: "$departments" },
                        uniqueProducts: { $size: "$productCount" },
                        departments: 1
                    }
                }
            ]);

            const result = stats[0] || {
                totalDeals: 0,
                averagePrice: 0,
                averageRating: 0,
                minPrice: 0,
                maxPrice: 0,
                departmentCount: 0,
                uniqueProducts: 0,
                departments: []
            };

            return result;
        } catch (error) {
            console.error('Deal stats aggregation error:', error);
            throw new Error(`Error fetching deal statistics: ${error.message}`);
        }
    }

    // Get recent deals (last 30 days)
    static async getRecentDeals(limit = 20) {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            return await Deal.find({
                lastUpdated: { $gte: thirtyDaysAgo },
                isActive: true
            })
                .sort({ lastUpdated: -1 })
                .limit(limit);
        } catch (error) {
            throw new Error(`Error fetching recent deals: ${error.message}`);
        }
    }

    // Restore soft-deleted deal
    static async restoreDeal(dealId) {
        try {
            const deal = await Deal.findOneAndUpdate(
                { dealId: parseInt(dealId) },
                { isActive: true, lastUpdated: new Date() },
                { new: true }
            );

            if (!deal) {
                throw new Error('Deal not found');
            }

            return deal;
        } catch (error) {
            throw new Error(`Error restoring deal: ${error.message}`);
        }
    }

    // Load initial data (for seeding)
    static async loadInitialData(dealsArray) {
        try {
            // Clear existing deals
            await Deal.deleteMany({});

            // Insert new deals
            const result = await Deal.insertMany(dealsArray);
            console.log(`✅ Loaded ${result.length} deals into database`);

            return result;
        } catch (error) {
            throw new Error(`Error loading initial data: ${error.message}`);
        }
    }
}

module.exports = DealService;