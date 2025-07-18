// routes/record.js - UPDATED FOR SIMPLIFIED PRODUCT MODEL

const express = require('express');
const ProductService = require('../services/productService');

// recordRoutes is an instance of the express router.
const recordRoutes = express.Router();

// This will help us connect to the database (keeping for deals if needed)
const dbo = require('../db/conn');

// ================================
// DEALS ROUTES (Keep existing functionality)
// ================================

// Get all deals (keeping existing functionality)
recordRoutes.route('/deals').get(async function (_req, res) {
  try {
    const dbConnect = dbo.getDb();

    dbConnect
      .collection('deals')
      .find({})
      .limit(50)
      .toArray(function (err, result) {
        if (err) {
          res.status(400).send('Error fetching deals!');
        } else {
          res.json(result);
        }
      });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ================================
// PRODUCT ROUTES (Updated for simplified model)
// ================================

// Get all products with optional filters
recordRoutes.route('/products').get(async function (req, res) {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const department = req.query.department;
    const category = req.query.category;
    const brand = req.query.brand;
    const minPrice = parseFloat(req.query.minPrice);
    const maxPrice = parseFloat(req.query.maxPrice);
    const search = req.query.search;

    let products;

    // Handle different query types
    if (search) {
      products = await ProductService.searchProducts(search, limit);
    } else if (department) {
      products = await ProductService.getProductsByDepartment(department, limit);
    } else if (category) {
      products = await ProductService.getProductsByCategory(category, limit);
    } else if (brand) {
      products = await ProductService.getProductsByBrand(brand, limit);
    } else if (minPrice && maxPrice) {
      products = await ProductService.getProductsByPriceRange(minPrice, maxPrice, limit);
    } else {
      products = await ProductService.getAllProducts(limit);
    }

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get single product by ID
recordRoutes.route('/products/:id').get(async function (req, res) {
  try {
    const product = await ProductService.getProductById(req.params.id);
    res.json({
      success: true,
      data: product
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

// Get product by SKU (SIMPLIFIED - no more variant SKUs)
recordRoutes.route('/products/sku/:sku').get(async function (req, res) {
  try {
    const product = await ProductService.getProductBySku(req.params.sku);
    res.json({
      success: true,
      data: product
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

// Create new product
recordRoutes.route('/products').post(async function (req, res) {
  try {
    const product = await ProductService.createProduct(req.body);
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Update product
recordRoutes.route('/products/:id').put(async function (req, res) {
  try {
    const product = await ProductService.updateProduct(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
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

// Delete product (soft delete)
recordRoutes.route('/products/:id').delete(async function (req, res) {
  try {
    const product = await ProductService.deleteProduct(req.params.id);
    res.json({
      success: true,
      message: 'Product deleted successfully (soft delete)',
      data: product
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

// ================================
// NEW ENHANCED ROUTES
// ================================

// Search products
recordRoutes.route('/products/search/:term').get(async function (req, res) {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const products = await ProductService.searchProducts(req.params.term, limit);
    res.json({
      success: true,
      searchTerm: req.params.term,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get products by department
recordRoutes.route('/products/department/:department').get(async function (req, res) {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const products = await ProductService.getProductsByDepartment(req.params.department, limit);
    res.json({
      success: true,
      department: req.params.department,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get products by category
recordRoutes.route('/products/category/:category').get(async function (req, res) {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const products = await ProductService.getProductsByCategory(req.params.category, limit);
    res.json({
      success: true,
      category: req.params.category,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get products by brand
recordRoutes.route('/products/brand/:brand').get(async function (req, res) {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const products = await ProductService.getProductsByBrand(req.params.brand, limit);
    res.json({
      success: true,
      brand: req.params.brand,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get products by price range
recordRoutes.route('/products/price/:minPrice/:maxPrice').get(async function (req, res) {
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
    
    const products = await ProductService.getProductsByPriceRange(minPrice, maxPrice, limit);
    res.json({
      success: true,
      priceRange: { min: minPrice, max: maxPrice },
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ================================
// INVENTORY MANAGEMENT ROUTES
// ================================

// Get low stock products
recordRoutes.route('/products/inventory/low-stock').get(async function (req, res) {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    const products = await ProductService.getLowStockProducts(threshold);
    res.json({
      success: true,
      threshold: threshold,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Update product stock
recordRoutes.route('/products/:id/stock').patch(async function (req, res) {
  try {
    const { stock } = req.body;
    
    if (stock === undefined || stock < 0) {
      return res.status(400).json({
        success: false,
        error: 'Stock must be a non-negative number'
      });
    }
    
    const product = await ProductService.updateStock(req.params.id, stock);
    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: product
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

// ================================
// ANALYTICS ROUTES
// ================================

// Get product statistics
recordRoutes.route('/products/stats').get(async function (req, res) {
  try {
    const stats = await ProductService.getProductStats();
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

// ================================
// ADMIN ROUTES
// ================================

// Hard delete product (admin only)
recordRoutes.route('/products/:id/hard-delete').delete(async function (req, res) {
  try {
    const product = await ProductService.hardDeleteProduct(req.params.id);
    res.json({
      success: true,
      message: 'Product permanently deleted',
      data: product
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

// Restore soft-deleted product (admin only)
recordRoutes.route('/products/:id/restore').patch(async function (req, res) {
  try {
    const product = await ProductService.updateProduct(req.params.id, { isActive: true });
    res.json({
      success: true,
      message: 'Product restored successfully',
      data: product
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

module.exports = recordRoutes;