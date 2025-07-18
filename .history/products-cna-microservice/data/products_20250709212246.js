// data/products.js - Fixed with proper data types
exports.products = [
    {
        "_id": 301671,                    // Integer ID (no quotes)
        "department": "Shoes",
        "category": "Shoes/Women/Pumps",
        "thumbnail": "../assets/images/deals/shoes.jpg",
        "image": "?",
        "title": "Evening Platform Pumps",
        "description": "Those evening platform pumps the perfect finishing touches on your most glamourous night-on-the-the-town outfit",
        "shortDescription": "Evening Platform Pumps",
        "price": 145.99,                  // Number price (no quotes)
        "currency": "USD",
        "rating": 4.5,                    // Number rating (no quotes)
        "attributes": {
            "brand": "Guess"
        },
        "secondaryAttributes": {
            "style": "Designer",
            "type": "Platform"
        },
        "variants": [
            {
                "sku": "sku2441",
                "thumbnail": "../assets/images/deals/shoes.jpg",
                "image": "?",
                "attributes": {
                    "size": {
                        "US": "6"
                    },
                    "color": "blue"
                },
                "secondaryAttributes": {
                    "width": "B",
                    "heelHeight": 5.0
                }
            }
        ],
        "lastUpdated": "2022-10-02T01:11:18.965Z"
    },
    // Add more products with integer IDs
    {
        "_id": 301672,
        "department": "Electronics",
        "category": "Electronics/Phones",
        "thumbnail": "../assets/images/deals/phone.jpg",
        "image": "?",
        "title": "Smartphone Pro",
        "description": "Latest smartphone with advanced features",
        "shortDescription": "Smartphone Pro",
        "price": 899.99,
        "currency": "USD",
        "rating": 4.8,
        "attributes": {
            "brand": "TechBrand"
        },
        "secondaryAttributes": {
            "storage": "256GB",
            "color": "Black"
        },
        "variants": [
            {
                "sku": "phone001",
                "thumbnail": "../assets/images/deals/phone.jpg",
                "image": "?",
                "attributes": {
                    "storage": "256GB",
                    "color": "black"
                },
                "secondaryAttributes": {
                    "warranty": "2 years"
                }
            }
        ],
        "lastUpdated": "2024-01-01T00:00:00.000Z"
    }
];