// scripts/02-import-tech-products.js
const { MongoClient } = require('mongodb');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
require('dotenv').config();

// Tech department mapping
const DEPARTMENT_MAPPING = {
  'laptops': 'Computers',
  'mobiles': 'Mobile Devices',
  'cameras': 'Photography',
  'headphones_and_speakers': 'Audio',
  'gaming_consoles': 'Gaming',
  'tablets': 'Mobile Devices',
  'televisions': 'Displays',
  'wearables': 'Wearables'
};

// Category mapping
const CATEGORY_MAPPING = {
  'laptops': 'Laptops',
  'mobiles': 'Smartphones',
  'cameras': 'Cameras',
  'headphones_and_speakers': 'Headphones & Speakers',
  'gaming_consoles': 'Gaming Consoles',
  'tablets': 'Tablets',
  'televisions': 'Smart TVs',
  'wearables': 'Smart Watches'
};

class TechProductImporter {
  constructor() {
    this.client = new MongoClient(process.env.MONGO_URI, {
      useUnifiedTopology: true
    });
    this.db = null;
    this.productCounter = 1;
    this.productsImported = 0;
    this.dataPath = path.join(__dirname, '../data/kaggle-datasets');
  }

  async connect() {
    await this.client.connect();
    this.db = this.client.db();
    console.log('🔗 Connected to MongoDB Atlas');
  }

  // Generate stock: mostly 200-500, some 20-30
  generateStock() {
    const lowStockChance = Math.random() < 0.15; // 15% chance for low stock
    if (lowStockChance) {
      return Math.floor(Math.random() * 11) + 20; // 20-30
    } else {
      return Math.floor(Math.random() * 301) + 200; // 200-500
    }
  }

  // Convert INR to DZD (approximate rate: 1 INR = 1.6 DZD)
  convertToDZD(priceStr) {
    if (!priceStr) return 0;
    
    // Remove ₹ symbol and commas, extract number
    const cleanPrice = priceStr.replace(/[₹,]/g, '').trim();
    const inrPrice = parseFloat(cleanPrice);
    
    if (isNaN(inrPrice)) return 0;
    
    // Convert INR to DZD (1 INR ≈ 1.6 DZD)
    const dzdPrice = Math.round(inrPrice * 1.6);
    return dzdPrice;
  }

  // Clean image URL - remove quotes and get first URL if multiple
  cleanImageUrl(imageStr) {
    if (!imageStr) return '';
    
    // Remove quotes and trim
    let cleanUrl = imageStr.replace(/["']/g, '').trim();
    
    // If multiple URLs separated by comma, take the first one
    if (cleanUrl.includes(',')) {
      cleanUrl = cleanUrl.split(',')[0].trim();
    }
    
    // Ensure it starts with http
    if (cleanUrl && !cleanUrl.startsWith('http')) {
      cleanUrl = 'https:' + cleanUrl;
    }
    
    return cleanUrl;
  }

  // Calculate rating from star distribution
  calculateRating(stars1, stars2, stars3, stars4, stars5) {
    const s1 = parseInt(stars1) || 0;
    const s2 = parseInt(stars2) || 0;
    const s3 = parseInt(stars3) || 0;
    const s4 = parseInt(stars4) || 0;
    const s5 = parseInt(stars5) || 0;
    
    const totalRatings = s1 + s2 + s3 + s4 + s5;
    
    if (totalRatings === 0) {
      // Generate random rating between 4.0-4.8 for products without ratings
      return parseFloat((Math.random() * 0.8 + 4.0).toFixed(1));
    }
    
    const weightedSum = (s1 * 1) + (s2 * 2) + (s3 * 3) + (s4 * 4) + (s5 * 5);
    const rating = weightedSum / totalRatings;
    
    return parseFloat(rating.toFixed(1));
  }

  // Generate SKU
  generateSKU(brand, model, category) {
    const brandCode = (brand || 'UNK').substring(0, 3).toUpperCase();
    const categoryCode = category.substring(0, 3).toUpperCase();
    const modelCode = (model || '').replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `${brandCode}-${categoryCode}-${modelCode}-${randomNum}`;
  }

  // Extract description from other_info or create one
  extractDescription(row, category) {
    let description = '';
    
    // Try to extract from other_info JSON
    if (row.other_info) {
      try {
        const otherInfo = JSON.parse(row.other_info);
        const specs = [];
        
        // Add relevant specs based on category
        if (category === 'Smartphones') {
          if (otherInfo['RAM']) specs.push(`${otherInfo['RAM']} RAM`);
          if (otherInfo['Internal storage']) specs.push(`${otherInfo['Internal storage']} Storage`);
          if (otherInfo['Rear camera']) specs.push(`${otherInfo['Rear camera']} Camera`);
        } else if (category === 'Laptops') {
          if (row['RAM']) specs.push(`${row['RAM']} RAM`);
          if (row['Processor']) specs.push(`${row['Processor']} Processor`);
          if (row['Operating system']) specs.push(`${row['Operating system']}`);
        }
        
        if (specs.length > 0) {
          description = specs.join(', ');
        }
      } catch (e) {
        // JSON parsing failed, continue
      }
    }
    
    // Fallback description
    if (!description) {
      const brand = row['Brand'] || 'Premium';
      const productName = row['Product Name'] || row['Model'] || 'Tech Product';
      description = `${brand} ${productName} - High-quality ${category.toLowerCase()} with advanced features and reliable performance.`;
    }
    
    return description;
  }

  // Process a single CSV file
  async processCSVFile(filename) {
    const filePath = path.join(this.dataPath, filename);
    const categoryKey = filename.replace('.csv', '');
    const department = DEPARTMENT_MAPPING[categoryKey];
    const category = CATEGORY_MAPPING[categoryKey];
    
    console.log(`\n📁 Processing ${filename}...`);
    console.log(`   Category: ${category}`);
    console.log(`   Department: ${department}`);
    
    const products = [];
    let rowCount = 0;
    const maxProducts = filename === 'mobiles.csv' ? 150 : 80; // Limit to manage data size
    
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          rowCount++;
          
          // Skip if we've reached our limit
          if (products.length >= maxProducts) {
            return;
          }
          
          // Skip if essential fields are missing
          if (!row['Product Name'] && !row['Model']) {
            return;
          }
          
          const price = this.convertToDZD(row['Price in India']);
          
          // Skip if price is 0 or invalid
          if (price <= 0) {
            return;
          }
          
          const product = {
            _id: this.productCounter++,
            sku: this.generateSKU(row['Brand'], row['Model'], category),
            title: row['Product Name'] || row['Model'] || `${row['Brand']} ${category}`,
            description: this.extractDescription(row, category),
            price: price,
            currency: 'DZD',
            category: category,
            department: department,
            image: this.cleanImageUrl(row['Picture URL']),
            stock: this.generateStock(),
            rating: this.calculateRating(
              row['1 Stars'] || row['1 stars'],
              row['2 Stars'] || row['2 stars'], 
              row['3 Stars'] || row['3 stars'],
              row['4 Stars'] || row['4 stars'],
              row['5 Stars'] || row['5 stars']
            ),
            brand: row['Brand'] || 'Generic',
            isActive: true
          };
          
          products.push(product);
        })
        .on('end', () => {
          console.log(`   ✅ Processed ${rowCount} rows, extracted ${products.length} valid products`);
          resolve(products);
        })
        .on('error', (error) => {
          console.error(`   ❌ Error processing ${filename}:`, error.message);
          reject(error);
        });
    });
  }

  // Import all tech products
  async importAllProducts() {
    const csvFiles = [
      'laptops.csv',
      'mobiles.csv', 
      'cameras.csv',
      'headphones_and_speakers.csv',
      'gaming_consoles.csv',
      'tablets.csv',
      'televisions.csv',
      'wearables.csv'
    ];
    
    console.log('🚀 Starting tech product import...');
    console.log(`📂 Data path: ${this.dataPath}`);
    
    let allProducts = [];
    
    for (const filename of csvFiles) {
      const filePath = path.join(this.dataPath, filename);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  ${filename} not found, skipping...`);
        continue;
      }
      
      try {
        const products = await this.processCSVFile(filename);
        allProducts = allProducts.concat(products);
      } catch (error) {
        console.error(`❌ Failed to process ${filename}:`, error.message);
      }
    }
    
    console.log(`\n📊 Import Summary:`);
    console.log(`   Total products to import: ${allProducts.length}`);
    
    if (allProducts.length === 0) {
      console.log('❌ No products to import!');
      return;
    }
    
    // Insert products in batches
    console.log('\n💾 Inserting products into database...');
    const batchSize = 100;
    let imported = 0;
    
    for (let i = 0; i < allProducts.length; i += batchSize) {
      const batch = allProducts.slice(i, i + batchSize);
      
      try {
        await this.db.collection('products').insertMany(batch, { ordered: false });
        imported += batch.length;
        console.log(`   ✅ Imported batch: ${imported}/${allProducts.length}`);
      } catch (error) {
        console.error(`   ⚠️  Batch error (some duplicates?):`, error.message);
        // Continue with next batch
      }
    }
    
    // Final verification
    const finalCount = await this.db.collection('products').countDocuments();
    console.log(`\n🎉 Import completed!`);
    console.log(`   📦 Products in database: ${finalCount}`);
    
    // Show category breakdown
    const categories = await this.db.collection('products').aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log('\n📈 Category breakdown:');
    categories.forEach(cat => {
      console.log(`   ${cat._id}: ${cat.count} products`);
    });
    
    return finalCount;
  }

  async close() {
    await this.client.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the import
if (require.main === module) {
  const importer = new TechProductImporter();
  
  importer.connect()
    .then(() => importer.importAllProducts())
    .then((count) => {
      console.log(`\n✅ Successfully imported ${count} tech products!`);
      return importer.close();
    })
    .then(() => {
      console.log('🚀 Ready to create deals!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Import failed:', error);
      process.exit(1);
    });
}

module.exports = { TechProductImporter };