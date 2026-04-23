const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/userModel');
const Product = require('./models/productModel');
const Promo = require('./models/promoModel');
const connectDB = require('./config/db');
const products = require('./data/products');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const generateSKU = (category, name) => {
    const prefix = category.substring(0, 3).toUpperCase();
    const namePart = name.substring(0, 2).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `SOV-${prefix}-${namePart}-${random}`;
};

const importData = async () => {
    try {
        // Clear all existing data
        await User.deleteMany();
        await Product.deleteMany();
        await Promo.deleteMany();

        // Create Default Promo
        await Promo.create({
            code: 'ARCHIVE5',
            discount: 5,
            isActive: true,
            limit: 1000
        });

        // Create Admin User
        await User.create({
            name: 'Maison Admin',
            email: 'admin@sovra.com',
            password: 'adminpassword123',
            isAdmin: true,
            isVerified: true,
            status: 'Elite',
            preference: 'High Jewelry'
        });

        // Map fresh products with unique SKUs
        const productsWithSKU = products.map(p => ({
            ...p,
            sku: generateSKU(p.category, p.name),
            shuffleOrder: Math.random()
        }));

        await Product.insertMany(productsWithSKU);

        console.log('✅ Real Product Collection Seeded Successfully');
        process.exit();
    } catch (error) {
        console.error(`❌ Error seeding data: ${error.message}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await User.deleteMany();
        await Product.deleteMany();
        await Promo.deleteMany();


        console.log('🗑️ Data Destroyed');
        process.exit();
    } catch (error) {
        console.error(`❌ Error destroying data: ${error.message}`);
        process.exit(1);
    }
}

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
