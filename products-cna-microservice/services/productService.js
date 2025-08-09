// services/productService.js - UPDATED FOR SIMPLIFIED MODEL

const Product = require('../models/product');

class ProductService {

  // Get all products
  static async getAllProducts(limit = 50) {
    try {
      return await Product.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }
  }

  // Get product by ID
  static async getProductById(id) {
    try {
      const productId = parseInt(id);
      const product = await Product.findOne({ _id: productId, isActive: true });

      if (!product) {
        throw new Error('Product not found');
      }

      return product;
    } catch (error) {
      throw new Error(`Error fetching product: ${error.message}`);
    }
  }

  // Get product by SKU - SIMPLIFIED (no more variant SKUs)
  static async getProductBySku(sku) {
    try {
      const product = await Product.findOne({ sku: sku, isActive: true });

      if (!product) {
        throw new Error('Product not found');
      }

      return product;
    } catch (error) {
      throw new Error(`Error fetching product by SKU: ${error.message}`);
    }
  }

  // Create new product
  static async createProduct(productData) {
    try {
      // Validate required fields
      if (!productData.title || !productData.price || !productData.sku) {
        throw new Error('Title, price, and SKU are required');
      }

      // Check if SKU already exists
      const existingProduct = await Product.findOne({ sku: productData.sku });
      if (existingProduct) {
        throw new Error('SKU already exists');
      }

      // Generate ID if not provided
      if (!productData._id) {
        const lastProduct = await Product.findOne().sort({ _id: -1 });
        productData._id = lastProduct ? lastProduct._id + 1 : 301671;
      }

      const product = new Product(productData);
      return await product.save();
    } catch (error) {
      throw new Error(`Error creating product: ${error.message}`);
    }
  }

  // Update product
  static async updateProduct(id, updateData) {
    try {
      const productId = parseInt(id);

      // Remove _id from updateData to prevent conflicts
      delete updateData._id;

      // Set updatedAt timestamp
      updateData.updatedAt = new Date();

      const product = await Product.findOneAndUpdate(
        { _id: productId, isActive: true },
        updateData,
        { new: true, runValidators: true }
      );

      if (!product) {
        throw new Error('Product not found');
      }

      return product;
    } catch (error) {
      throw new Error(`Error updating product: ${error.message}`);
    }
  }

  // Delete product (soft delete)
  static async deleteProduct(id) {
    try {
      const productId = parseInt(id);
      const product = await Product.findOneAndUpdate(
        { _id: productId },
        { isActive: false, updatedAt: new Date() },
        { new: true }
      );

      if (!product) {
        throw new Error('Product not found');
      }

      return product;
    } catch (error) {
      throw new Error(`Error deleting product: ${error.message}`);
    }
  }

  // Hard delete product (completely remove from database)
  static async hardDeleteProduct(id) {
    try {
      const productId = parseInt(id);
      const product = await Product.findOneAndDelete({ _id: productId });

      if (!product) {
        throw new Error('Product not found');
      }

      return product;
    } catch (error) {
      throw new Error(`Error hard deleting product: ${error.message}`);
    }
  }

  // Load initial data (for seeding) - UPDATED FOR NEW STRUCTURE
  static async loadInitialData(productsArray) {
    try {
      // Clear existing products
      await Product.deleteMany({});

      // Transform old data structure to new structure
      const transformedProducts = productsArray.map(oldProduct => ({
        _id: oldProduct._id,
        sku: oldProduct.variants && oldProduct.variants.length > 0
          ? oldProduct.variants[0].sku
          : `SKU-${oldProduct._id}`,
        title: oldProduct.title,
        description: oldProduct.description,
        price: oldProduct.price,
        currency: oldProduct.currency || 'USD',
        category: oldProduct.category,
        department: oldProduct.department,
        image: oldProduct.image || oldProduct.thumbnail,
        stock: Math.floor(Math.random() * 100) + 10, // Random stock between 10-109
        rating: oldProduct.rating || 0,
        brand: oldProduct.attributes?.brand || 'Unknown',
        isActive: true,
        createdAt: new Date(oldProduct.lastUpdated || Date.now()),
        updatedAt: new Date()
      }));

      // Insert new products
      const result = await Product.insertMany(transformedProducts);
      console.log(`✅ Loaded ${result.length} products into database`);

      return result;
    } catch (error) {
      throw new Error(`Error loading initial data: ${error.message}`);
    }
  }

  // Search products by title, description, or brand - SIMPLIFIED
  static async searchProducts(searchTerm, limit = 20) {
    try {
      const regex = new RegExp(searchTerm, 'i'); // Case-insensitive search

      return await Product.find({
        isActive: true,
        $or: [
          { title: regex },
          { description: regex },
          { department: regex },
          { category: regex },
          { brand: regex },
          { sku: regex }
        ]
      })
        .sort({ rating: -1 }) // Sort by rating descending
        .limit(limit);
    } catch (error) {
      throw new Error(`Error searching products: ${error.message}`);
    }
  }

  // Get products by department
  static async getProductsByDepartment(department, limit = 50) {
    try {
      return await Product.find({
        department: new RegExp(department, 'i'),
        isActive: true
      })
        .sort({ rating: -1 })
        .limit(limit);
    } catch (error) {
      throw new Error(`Error fetching products by department: ${error.message}`);
    }
  }

  // Get products by category
  static async getProductsByCategory(category, limit = 50) {
    try {
      return await Product.find({
        category: new RegExp(category, 'i'),
        isActive: true
      })
        .sort({ rating: -1 })
        .limit(limit);
    } catch (error) {
      throw new Error(`Error fetching products by category: ${error.message}`);
    }
  }

  // Get products by brand
  static async getProductsByBrand(brand, limit = 50) {
    try {
      return await Product.find({
        brand: new RegExp(brand, 'i'),
        isActive: true
      })
        .sort({ rating: -1 })
        .limit(limit);
    } catch (error) {
      throw new Error(`Error fetching products by brand: ${error.message}`);
    }
  }

  // Get products by price range
  static async getProductsByPriceRange(minPrice, maxPrice, limit = 50) {
    try {
      return await Product.find({
        price: { $gte: minPrice, $lte: maxPrice },
        isActive: true
      })
        .sort({ price: 1 })
        .limit(limit);
    } catch (error) {
      throw new Error(`Error fetching products by price range: ${error.message}`);
    }
  }

  // Get low stock products (for inventory management)
  static async getLowStockProducts(threshold = 10) {
    try {
      return await Product.find({
        stock: { $lte: threshold },
        isActive: true
      })
        .sort({ stock: 1 });
    } catch (error) {
      throw new Error(`Error fetching low stock products: ${error.message}`);
    }
  }

  // Update stock quantity
  static async updateStock(id, newStock) {
    try {
      const productId = parseInt(id);
      const product = await Product.findOneAndUpdate(
        { _id: productId, isActive: true },
        { stock: newStock, updatedAt: new Date() },
        { new: true }
      );

      if (!product) {
        throw new Error('Product not found');
      }

      return product;
    } catch (error) {
      throw new Error(`Error updating stock: ${error.message}`);
    }
  }

  // Get product statistics - FIXED VERSION
  static async getProductStats() {
    try {
      const stats = await Product.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null, // Group all documents together
            totalProducts: { $sum: 1 },
            averagePrice: { $avg: { $toDouble: "$price" } }, // Ensure price is treated as number
            averageRating: { $avg: { $toDouble: "$rating" } }, // Ensure rating is treated as number
            totalStock: { $sum: { $toDouble: "$stock" } }, // Ensure stock is treated as number
            minPrice: { $min: "$price" },
            maxPrice: { $max: "$price" },
            departments: { $addToSet: "$department" },
            brands: { $addToSet: "$brand" },
            categories: { $addToSet: "$category" }
          }
        },
        {
          $project: {
            _id: 0, // Remove the _id field from output
            totalProducts: 1,
            averagePrice: { $round: ["$averagePrice", 2] },
            averageRating: { $round: ["$averageRating", 2] },
            totalStock: 1,
            minPrice: 1,
            maxPrice: 1,
            departmentCount: { $size: "$departments" },
            brandCount: { $size: "$brands" },
            categoryCount: { $size: "$categories" },
            departments: 1,
            brands: 1,
            categories: 1
          }
        }
      ]);

      const result = stats[0] || {
        totalProducts: 0,
        averagePrice: 0,
        averageRating: 0,
        totalStock: 0,
        minPrice: 0,
        maxPrice: 0,
        departmentCount: 0,
        brandCount: 0,
        categoryCount: 0,
        departments: [],
        brands: [],
        categories: []
      };

      return result;
    } catch (error) {
      console.error('Stats aggregation error:', error);
      throw new Error(`Error fetching product statistics: ${error.message}`);
    }
  }
}

module.exports = ProductService;