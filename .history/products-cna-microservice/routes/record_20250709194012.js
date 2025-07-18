// routes/record.js - Updated to use Mongoose models
const express = require('express');
const ProductService = require('../services/productService');

// recordRoutes is an instance of the express router.
const recordRoutes = express.Router();

// This will help us connect to the database (keeping for deals if needed)
const dbo = require('../db/conn');

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

// Get all products (NEW - using Mongoose)
recordRoutes.route('/products').get(async function (req, res) {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const products = await ProductService.getAllProducts(limit);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single product by ID (NEW - using Mongoose)
recordRoutes.route('/products/:id').get(async function (req, res) {
  try {
    const product = await ProductService.getProductById(req.params.id);
    res.json(product);
  } catch (error) {
    if (error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Get product by SKU (UPDATED - using Mongoose)
recordRoutes.route('/products/sku/:id').get(async function (req, res) {
  try {
    const product = await ProductService.getProductBySku(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new product (NEW)
recordRoutes.route('/products').post(async function (req, res) {
  try {
    const product = await ProductService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update product (NEW)
recordRoutes.route('/products/:id').put(async function (req, res) {
  try {
    const product = await ProductService.updateProduct(req.params.id, req.body);
    res.json(product);
  } catch (error) {
    if (error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

// Delete product (NEW)
recordRoutes.route('/products/:id').delete(async function (req, res) {
  try {
    const product = await ProductService.deleteProduct(req.params.id);
    res.json({ message: 'Product deleted successfully', product });
  } catch (error) {
    if (error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Search products (NEW)
recordRoutes.route('/products/search/:term').get(async function (req, res) {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const products = await ProductService.searchProducts(req.params.term, limit);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get products by department (NEW)
recordRoutes.route('/products/department/:department').get(async function (req, res) {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const products = await ProductService.getProductsByDepartment(req.params.department, limit);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = recordRoutes;