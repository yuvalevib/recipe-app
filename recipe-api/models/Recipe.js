const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    pdfPath: { type: String, required: true }
});

module.exports = mongoose.model('Recipe', RecipeSchema);
