// services/productService.js
const Product = require('../models/Product');

class ProductService {
  
  // Get all products
  static async getAllProducts(limit = 50) {
    try {
      return await Product.find({}).limit(limit);
    } catch (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }
  }

  // Get product by ID
  static async getProductById(id) {
    try {
      const productId = parseInt(id);
      const product = await Product.findOne({ _id: productId });
      
      if (!product) {
        throw new Error('Product not found');
      }
      
      return product;
    } catch (error) {
      throw new Error(`Error fetching product: ${error.message}`);
    }
  }

  // Get product by SKU
  static async getProductBySku(sku) {
    try {
      return await Product.findOne({ 'variants.sku': sku });
    } catch (error) {
      throw new Error(`Error fetching product by SKU: ${error.message}`);
    }
  }

  // Create new product
  static async createProduct(productData) {
    try {
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
      const product = await Product.findOneAndUpdate(
        { _id: productId }, 
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

  // Delete product
  static async deleteProduct(id) {
    try {
      const productId = parseInt(id);
      const product = await Product.findOneAndDelete({ _id: productId });
      
      if (!product) {
        throw new Error('Product not found');
      }
      
      return product;
    } catch (error) {
      throw new Error(`Error deleting product: ${error.message}`);
    }
  }

  // Load initial data (for seeding)
  static async loadInitialData(productsArray) {
    try {
      // Clear existing products
      await Product.deleteMany({});
      
      // Insert new products
      const result = await Product.insertMany(productsArray);
      console.log(`Loaded ${result.length} products into database`);
      
      return result;
    } catch (error) {
      throw new Error(`Error loading initial data: ${error.message}`);
    }
  }

  // Search products by title or description
  static async searchProducts(searchTerm, limit = 20) {
    try {
      const regex = new RegExp(searchTerm, 'i'); // Case-insensitive search
      
      return await Product.find({
        $or: [
          { title: regex },
          { description: regex },
          { department: regex },
          { category: regex }
        ]
      }).limit(limit);
    } catch (error) {
      throw new Error(`Error searching products: ${error.message}`);
    }
  }

  // Get products by department
  static async getProductsByDepartment(department, limit = 50) {
    try {
      return await Product.find({ department: new RegExp(department, 'i') }).limit(limit);
    } catch (error) {
      throw new Error(`Error fetching products by department: ${error.message}`);
    }
  }
}

module.exports = ProductService;