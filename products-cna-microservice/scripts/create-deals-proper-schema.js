// scripts/create-deals-proper-schema.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

class ProperDealsCreator {
  constructor() {
    this.client = new MongoClient(process.env.MONGO_URI, {
      useUnifiedTopology: true
    });
    this.db = null;
    this.dealCounter = 1;
  }

  async connect() {
    await this.client.connect();
    this.db = this.client.db();
    console.log('🔗 Connected to MongoDB Atlas');
  }

  // Generate realistic discount percentages by category
  generateDiscount(category, price) {
    let discountRange;
    
    switch (category) {
      case 'Smartphones':
        discountRange = [10, 25];
        break;
      case 'Laptops':
        discountRange = [15, 30];
        break;
      case 'Gaming Consoles':
        discountRange = [5, 15];
        break;
      case 'Cameras':
        discountRange = [20, 40];
        break;
      case 'Smart TVs':
        discountRange = [25, 45];
        break;
      case 'Tablets':
        discountRange = [15, 35];
        break;
      case 'Smart Watches':
        discountRange = [20, 40];
        break;
      case 'Headphones & Speakers':
        discountRange = [30, 50];
        break;
      default:
        discountRange = [15, 30];
    }
    
    // Higher discounts for more expensive items
    if (price > 100000) {
      discountRange[1] += 10;
    } else if (price > 50000) {
      discountRange[1] += 5;
    }
    
    const minDiscount = discountRange[0];
    const maxDiscount = Math.min(discountRange[1], 50);
    
    return Math.floor(Math.random() * (maxDiscount - minDiscount + 1)) + minDiscount;
  }

  // Generate deal dates
  generateDealDates() {
    const now = new Date();
    const dealTypes = ['current', 'starting_soon', 'ending_soon', 'future'];
    const dealType = dealTypes[Math.floor(Math.random() * dealTypes.length)];
    
    let startDate, endDate;
    
    switch (dealType) {
      case 'current':
        startDate = new Date(now.getTime() - (Math.random() * 10 + 1) * 24 * 60 * 60 * 1000);
        endDate = new Date(now.getTime() + (Math.random() * 15 + 5) * 24 * 60 * 60 * 1000);
        break;
        
      case 'starting_soon':
        startDate = new Date(now.getTime() + (Math.random() * 2 + 1) * 24 * 60 * 60 * 1000);
        endDate = new Date(startDate.getTime() + (Math.random() * 7 + 7) * 24 * 60 * 60 * 1000);
        break;
        
      case 'ending_soon':
        startDate = new Date(now.getTime() - (Math.random() * 10 + 5) * 24 * 60 * 60 * 1000);
        endDate = new Date(now.getTime() + (Math.random() * 2 + 1) * 24 * 60 * 60 * 1000);
        break;
        
      case 'future':
        startDate = new Date(now.getTime() + (Math.random() * 7 + 3) * 24 * 60 * 60 * 1000);
        endDate = new Date(startDate.getTime() + (Math.random() * 14 + 7) * 24 * 60 * 60 * 1000);
        break;
    }
    
    return { startDate, endDate };
  }

  // Create deal title
  createDealTitle(productTitle, discount, category) {
    const dealPhrases = [
      'Flash Sale',
      'Limited Time Offer',
      'Special Deal',
      'Hot Deal',
      'Best Price',
      'Mega Sale',
      'Weekend Special',
      'Tech Deal',
      'Super Saver',
      'Exclusive Offer'
    ];
    
    const categoryPhrases = {
      'Smartphones': ['Phone Deal', 'Mobile Offer', 'Smartphone Sale'],
      'Laptops': ['Laptop Deal', 'Computer Sale', 'Notebook Offer'],
      'Gaming Consoles': ['Gaming Deal', 'Console Sale', 'Gamer Special'],
      'Cameras': ['Camera Deal', 'Photo Gear Sale', 'Photographer Special'],
      'Smart TVs': ['TV Deal', 'Entertainment Sale', 'Smart TV Offer'],
      'Tablets': ['Tablet Deal', 'Mobile Computing Sale'],
      'Smart Watches': ['Wearable Deal', 'Smartwatch Sale', 'Fitness Tech'],
      'Headphones & Speakers': ['Audio Deal', 'Sound Sale', 'Music Gear']
    };
    
    const phrases = [...dealPhrases, ...(categoryPhrases[category] || [])];
    const dealPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    
    const shortTitle = productTitle.length > 40 ? 
      productTitle.substring(0, 37) + '...' : productTitle;
    
    return `${dealPhrase}: ${shortTitle} - ${discount}% OFF`;
  }

  // Create deal description
  createDealDescription(product, discount, originalPrice, dealPrice) {
    const savings = originalPrice - dealPrice;
    
    const descriptions = [
      `Get this amazing ${product.category.toLowerCase()} at an unbeatable price! Save ${savings.toLocaleString()} DZD with our exclusive ${discount}% discount.`,
      `Limited time offer on this premium ${product.brand} ${product.category.toLowerCase()}. Don't miss out on ${discount}% savings!`,
      `Special deal alert! This top-rated ${product.category.toLowerCase()} is now available with a massive ${discount}% discount. Save ${savings.toLocaleString()} DZD today!`,
      `Exclusive offer: ${product.brand} quality at an incredible price. Get ${discount}% off this popular ${product.category.toLowerCase()}.`,
      `Hot deal! Premium ${product.category.toLowerCase()} with excellent ratings now available with ${discount}% off. Limited stock available!`
    ];
    
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  // Create short description
  createShortDescription(product, discount) {
    const shortDescriptions = [
      `${discount}% off ${product.brand} ${product.category.toLowerCase()}`,
      `Save big on this ${product.category.toLowerCase()}`,
      `Limited time ${discount}% discount`,
      `Premium ${product.category.toLowerCase()} deal`,
      `Exclusive ${discount}% off offer`
    ];
    
    return shortDescriptions[Math.floor(Math.random() * shortDescriptions.length)];
  }

  // Generate thumbnail URL (smaller version of main image)
  generateThumbnail(imageUrl) {
    if (!imageUrl) return '';
    
    // For gadgets360cdn images, modify the URL for thumbnail
    if (imageUrl.includes('gadgets360cdn.com')) {
      return imageUrl.replace('large', 'small').replace('?downsize=*:180', '?downsize=*:120');
    }
    
    // For other URLs, return the same (in real app, you'd generate thumbnails)
    return imageUrl;
  }

  // Select products for deals
  async selectProductsForDeals(targetDeals = 150) {
    console.log(`🎯 Selecting products for ${targetDeals} deals...`);
    
    const products = await this.db.collection('products').aggregate([
      {
        $match: {
          isActive: true,
          stock: { $gte: 30 },
          rating: { $gte: 3.5 },
          price: { $gte: 1000 },
          image: { $ne: '', $exists: true, $ne: null } // Ensure products have images
        }
      },
      {
        $group: {
          _id: '$category',
          products: { $push: '$$ROOT' },
          count: { $sum: 1 }
        }
      }
    ]).toArray();
    
    console.log('📊 Products available for deals by category:');
    products.forEach(cat => {
      console.log(`   ${cat._id}: ${cat.count} products`);
    });
    
    const selectedProducts = [];
    const totalAvailable = products.reduce((sum, cat) => sum + cat.count, 0);
    
    for (const category of products) {
      const categoryProportion = category.count / totalAvailable;
      let categoryDeals = Math.floor(targetDeals * categoryProportion);
      
      if (categoryDeals === 0 && category.count > 0) {
        categoryDeals = Math.min(3, category.count);
      }
      
      const shuffled = category.products.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, Math.min(categoryDeals, category.count));
      
      selectedProducts.push(...selected);
      console.log(`   ✅ ${category._id}: Selected ${selected.length} products for deals`);
    }
    
    console.log(`🎲 Total products selected: ${selectedProducts.length}`);
    return selectedProducts.slice(0, targetDeals);
  }

  // Create deals matching your exact schema
  async createDeals() {
    console.log('🚀 Starting deals creation with proper schema...');
    
    // Clear existing deals first
    const existingDeals = await this.db.collection('deals').countDocuments();
    if (existingDeals > 0) {
      console.log(`🗑️ Removing ${existingDeals} existing deals...`);
      await this.db.collection('deals').deleteMany({});
    }
    
    const selectedProducts = await this.selectProductsForDeals(150);
    
    if (selectedProducts.length === 0) {
      console.log('❌ No suitable products found for deals!');
      return 0;
    }
    
    console.log(`\n💰 Creating deals for ${selectedProducts.length} products...`);
    
    const deals = [];
    
    for (const product of selectedProducts) {
      const discount = this.generateDiscount(product.category, product.price);
      const originalPrice = product.price;
      const dealPrice = Math.round(originalPrice * (1 - discount / 100));
      const { startDate, endDate } = this.generateDealDates();
      
      // Create deal matching your exact schema
      const deal = {
        dealId: this.dealCounter++,
        productId: product._id,
        variantSku: product.sku,
        department: product.department,
        thumbnail: this.generateThumbnail(product.image),
        image: product.image,
        title: this.createDealTitle(product.title, discount, product.category),
        description: this.createDealDescription(product, discount, originalPrice, dealPrice),
        shortDescription: this.createShortDescription(product, discount),
        price: dealPrice,
        originalPrice: originalPrice,
        currency: product.currency, // Will be 'DZD'
        rating: product.rating,
        discount: discount,
        isActive: true,
        startDate: startDate,
        endDate: endDate,
        lastUpdated: new Date()
      };
      
      deals.push(deal);
    }
    
    // Insert deals in batches
    console.log('\n💾 Inserting deals into database...');
    const batchSize = 50;
    let imported = 0;
    
    for (let i = 0; i < deals.length; i += batchSize) {
      const batch = deals.slice(i, i + batchSize);
      
      try {
        await this.db.collection('deals').insertMany(batch);
        imported += batch.length;
        console.log(`   ✅ Imported batch: ${imported}/${deals.length}`);
      } catch (error) {
        console.error(`   ❌ Batch error:`, error.message);
      }
    }
    
    // Final verification and analysis
    const finalCount = await this.db.collection('deals').countDocuments();
    console.log(`\n🎉 Deals creation completed!`);
    console.log(`   🏷️ Deals in database: ${finalCount}`);
    
    // Show deal analysis
    const dealStats = await this.db.collection('deals').aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          avgDiscount: { $avg: '$discount' },
          avgSavings: { $avg: { $subtract: ['$originalPrice', '$price'] } }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log('\n📈 Deal breakdown by department:');
    dealStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} deals, ${stat.avgDiscount.toFixed(1)}% avg discount, ${stat.avgSavings.toFixed(0)} DZD avg savings`);
    });
    
    // Show deal timing analysis
    const now = new Date();
    const currentDeals = await this.db.collection('deals').countDocuments({
      startDate: { $lte: now },
      endDate: { $gte: now }
    });
    
    const upcomingDeals = await this.db.collection('deals').countDocuments({
      startDate: { $gt: now }
    });
    
    console.log('\n⏰ Deal timing:');
    console.log(`   🔥 Currently active: ${currentDeals} deals`);
    console.log(`   📅 Starting later: ${upcomingDeals} deals`);
    
    // Show sample deals
    const sampleDeals = await this.db.collection('deals').find({}).limit(3).toArray();
    console.log('\n🏷️ Sample deals created:');
    sampleDeals.forEach((deal, index) => {
      console.log(`${index + 1}. ${deal.title}`);
      console.log(`   💰 ${deal.price} DZD (was ${deal.originalPrice} DZD) - ${deal.discount}% off`);
      console.log(`   📅 ${deal.startDate.toISOString().split('T')[0]} to ${deal.endDate.toISOString().split('T')[0]}`);
      console.log(`   🖼️ Has thumbnail: ${deal.thumbnail ? 'Yes' : 'No'}`);
    });
    
    return finalCount;
  }

  async close() {
    await this.client.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the proper deals creation
if (require.main === module) {
  const dealsCreator = new ProperDealsCreator();
  
  dealsCreator.connect()
    .then(() => dealsCreator.createDeals())
    .then((count) => {
      console.log(`\n✅ Successfully created ${count} deals with proper schema!`);
      return dealsCreator.close();
    })
    .then(() => {
      console.log('🎉 Tech e-commerce database is now complete with proper deals!');
      console.log('🚀 Ready to start your microservice!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Deal creation failed:', error);
      process.exit(1);
    });
}

module.exports = { ProperDealsCreator };