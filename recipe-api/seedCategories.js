const mongoose = require('mongoose');
const Category = require('./models/Category');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/recipes')
    .then(() => console.log('✅ MongoDB connected for seeding'))
    .catch(err => console.error('MongoDB connection error:', err));

const categories = [
    { name: 'מנות ראשונות' }, // Appetizers
    { name: 'מנות עיקריות' }, // Main Courses
    { name: 'קינוחים' },       // Desserts
    { name: 'שתיה' },          // Beverages
    { name: 'סלטים' },         // Salads
    { name: 'מרקים' }          // Soups
];

async function seed() {
    try {
        await Category.deleteMany();
        await Category.insertMany(categories);
        console.log('✅ Categories seeded in Hebrew');
    } catch (err) {
        console.error('Seeding error:', err);
    } finally {
        mongoose.connection.close();
    }
}

seed();
