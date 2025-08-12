// scripts/01-cleanup-database.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function cleanupDatabase() {
  const client = new MongoClient(process.env.MONGO_URI);
  
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const db = client.db();
    
    // Get current counts before deletion
    const productCount = await db.collection('products').countDocuments();
    const dealCount = await db.collection('deals').countDocuments();
    
    console.log(`📊 Current database state:`);
    console.log(`   - Products: ${productCount}`);
    console.log(`   - Deals: ${dealCount}`);
    
    console.log('\n🧹 Starting cleanup...');
    
    // Delete ALL existing products
    const productsResult = await db.collection('products').deleteMany({});
    console.log(`🗑️  Deleted ${productsResult.deletedCount} products`);
    
    // Delete ALL existing deals  
    const dealsResult = await db.collection('deals').deleteMany({});
    console.log(`🗑️  Deleted ${dealsResult.deletedCount} deals`);
    
    // Reset any counter collections (if using auto-increment)
    try {
      const countersResult = await db.collection('counters').deleteMany({});
      console.log(`🔄 Reset ${countersResult.deletedCount} counters`);
    } catch (error) {
      console.log('ℹ️  No counters collection found (this is normal)');
    }
    
    // Drop and recreate indexes for better performance
    console.log('\n🔧 Recreating indexes...');
    
    try {
      // Drop existing indexes (except _id)
      await db.collection('products').dropIndexes();
      await db.collection('deals').dropIndexes();
      console.log('🗑️  Dropped old indexes');
    } catch (error) {
      console.log('ℹ️  No existing indexes to drop');
    }
    
    // Create fresh indexes for products
    await db.collection('products').createIndexes([
      { key: { sku: 1 }, unique: true, name: 'sku_unique' },
      { key: { department: 1 }, name: 'department_idx' },
      { key: { category: 1 }, name: 'category_idx' },
      { key: { brand: 1 }, name: 'brand_idx' },
      { key: { price: 1 }, name: 'price_idx' },
      { key: { isActive: 1 }, name: 'active_idx' },
      { key: { title: 'text', description: 'text' }, name: 'search_text_idx' }
    ]);
    console.log('✅ Created product indexes');
    
    // Create fresh indexes for deals
    await db.collection('deals').createIndexes([
      { key: { productId: 1 }, name: 'productId_idx' },
      { key: { department: 1 }, name: 'deal_department_idx' },
      { key: { isActive: 1 }, name: 'deal_active_idx' },
      { key: { startDate: 1, endDate: 1 }, name: 'deal_dates_idx' }
    ]);
    console.log('✅ Created deal indexes');
    
    // Verify cleanup
    const finalProductCount = await db.collection('products').countDocuments();
    const finalDealCount = await db.collection('deals').countDocuments();
    
    console.log('\n🎉 Cleanup completed successfully!');
    console.log(`📊 Final database state:`);
    console.log(`   - Products: ${finalProductCount}`);
    console.log(`   - Deals: ${finalDealCount}`);
    console.log('\n✅ Database is now clean and ready for tech product import!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    throw error;
  } finally {
    await client.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the cleanup
if (require.main === module) {
  cleanupDatabase()
    .then(() => {
      console.log('\n🚀 Ready to import tech products!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Cleanup failed:', error);
      process.exit(1);
    });
}

module.exports = { cleanupDatabase };