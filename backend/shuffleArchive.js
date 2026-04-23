const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/productModel');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const migrateShuffle = async () => {
    try {
        console.log('🔄 Shuffling the Archive...');
        const products = await Product.find({});
        for (let product of products) {
            product.shuffleOrder = Math.random();
            await product.save();
        }
        console.log('✅ Archive Shuffled Successfully!');
        process.exit();
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

migrateShuffle();
