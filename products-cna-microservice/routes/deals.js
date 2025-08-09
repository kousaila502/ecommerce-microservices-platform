// routes/deals.js - UPDATED TO USE DEALSERVICE AND MONGOOSE

const express = require('express');
const DealService = require('../services/dealService');

// dealsRoutes is an instance of the express router.
const dealsRoutes = express.Router();

// ================================
// DEALS ROUTES (Using DealService - Mongoose)
// ================================

// Get all deals with optional filters
dealsRoutes.route('/deals').get(async function (req, res) {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const department = req.query.department;
        const minPrice = parseFloat(req.query.minPrice);
        const maxPrice = parseFloat(req.query.maxPrice);
        const search = req.query.search;

        let deals;

        // Handle different query types
        if (search) {
            deals = await DealService.searchDeals(search, limit);
        } else if (department) {
            deals = await DealService.getDealsByDepartment(department, limit);
        } else if (minPrice && maxPrice) {
            deals = await DealService.getDealsByPriceRange(minPrice, maxPrice, limit);
        } else {
            deals = await DealService.getAllDeals(limit);
        }

        res.json({
            success: true,
            count: deals.length,
            data: deals
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ================================
// SPECIFIC DEALS ROUTES (MUST COME BEFORE :id ROUTE)
// ================================

// Seed deals from sample data
dealsRoutes.route('/deals/seed').post(async function (req, res) {
    try {
        const sampleDeals = require('../data/deals');

        // Transform the data to match our schema
        const transformedDeals = sampleDeals.deals.map(deal => ({
            dealId: deal.dealId,
            productId: deal.productId,
            variantSku: deal.variantSku,
            department: deal.department,
            thumbnail: deal.thumbnail,
            image: deal.image,
            title: deal.title,
            description: deal.description,
            shortDescription: deal.shortDescription,
            price: deal.price,
            currency: deal.currency,
            rating: deal.rating,
            isActive: true,
            lastUpdated: new Date(deal.lastUpdated)
        }));

        const result = await DealService.loadInitialData(transformedDeals);

        res.status(201).json({
            success: true,
            message: `Successfully seeded ${result.length} deals`,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get deals statistics
dealsRoutes.route('/deals/stats').get(async function (req, res) {
    try {
        const stats = await DealService.getDealStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Search deals by title or description
dealsRoutes.route('/deals/search/:term').get(async function (req, res) {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const deals = await DealService.searchDeals(req.params.term, limit);
        res.json({
            success: true,
            searchTerm: req.params.term,
            count: deals.length,
            data: deals
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get deals by department
dealsRoutes.route('/deals/department/:department').get(async function (req, res) {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const deals = await DealService.getDealsByDepartment(req.params.department, limit);
        res.json({
            success: true,
            department: req.params.department,
            count: deals.length,
            data: deals
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get deals by price range
dealsRoutes.route('/deals/price/:minPrice/:maxPrice').get(async function (req, res) {
    try {
        const minPrice = parseFloat(req.params.minPrice);
        const maxPrice = parseFloat(req.params.maxPrice);
        const limit = parseInt(req.query.limit) || 50;

        if (isNaN(minPrice) || isNaN(maxPrice)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid price range. Please provide valid numbers.'
            });
        }

        const deals = await DealService.getDealsByPriceRange(minPrice, maxPrice, limit);
        res.json({
            success: true,
            priceRange: { min: minPrice, max: maxPrice },
            count: deals.length,
            data: deals
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get top rated deals
dealsRoutes.route('/deals/top-rated').get(async function (req, res) {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const deals = await DealService.getTopRatedDeals(limit);
        res.json({
            success: true,
            count: deals.length,
            data: deals
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get deals by product ID
dealsRoutes.route('/deals/product/:productId').get(async function (req, res) {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const deals = await DealService.getDealsByProductId(req.params.productId, limit);
        res.json({
            success: true,
            productId: parseInt(req.params.productId),
            count: deals.length,
            data: deals
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get recent deals
dealsRoutes.route('/deals/recent').get(async function (req, res) {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const deals = await DealService.getRecentDeals(limit);
        res.json({
            success: true,
            count: deals.length,
            data: deals
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ================================
// PARAMETERIZED DEALS ROUTES (MUST COME AFTER SPECIFIC ROUTES)
// ================================

// Get single deal by ID
dealsRoutes.route('/deals/:id').get(async function (req, res) {
    try {
        const deal = await DealService.getDealById(req.params.id);
        res.json({
            success: true,
            data: deal
        });
    } catch (error) {
        if (error.message.includes('not found')) {
            res.status(404).json({
                success: false,
                error: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
});

// Create new deal
dealsRoutes.route('/deals').post(async function (req, res) {
    try {
        const deal = await DealService.createDeal(req.body);
        res.status(201).json({
            success: true,
            message: 'Deal created successfully',
            data: deal
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// Update deal
dealsRoutes.route('/deals/:id').put(async function (req, res) {
    try {
        const deal = await DealService.updateDeal(req.params.id, req.body);
        res.json({
            success: true,
            message: 'Deal updated successfully',
            data: deal
        });
    } catch (error) {
        if (error.message.includes('not found')) {
            res.status(404).json({
                success: false,
                error: error.message
            });
        } else {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
});

// Delete deal (soft delete)
dealsRoutes.route('/deals/:id').delete(async function (req, res) {
    try {
        const deal = await DealService.deleteDeal(req.params.id);
        res.json({
            success: true,
            message: 'Deal deleted successfully (soft delete)',
            data: deal
        });
    } catch (error) {
        if (error.message.includes('not found')) {
            res.status(404).json({
                success: false,
                error: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
});

// Hard delete deal
dealsRoutes.route('/deals/:id/hard-delete').delete(async function (req, res) {
    try {
        const deal = await DealService.hardDeleteDeal(req.params.id);
        res.json({
            success: true,
            message: 'Deal permanently deleted',
            data: deal
        });
    } catch (error) {
        if (error.message.includes('not found')) {
            res.status(404).json({
                success: false,
                error: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
});

// Restore soft-deleted deal
dealsRoutes.route('/deals/:id/restore').patch(async function (req, res) {
    try {
        const deal = await DealService.restoreDeal(req.params.id);
        res.json({
            success: true,
            message: 'Deal restored successfully',
            data: deal
        });
    } catch (error) {
        if (error.message.includes('not found')) {
            res.status(404).json({
                success: false,
                error: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
});

module.exports = dealsRoutes;