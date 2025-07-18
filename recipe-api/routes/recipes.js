const express = require('express');
const multer = require('multer');
const path = require('path');
const Category = require('../models/Category');
const Recipe = require('../models/Recipe');

const router = express.Router();

// Setup multer storage for file uploads
const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// GET /api/categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// POST /api/categories - Add new category
router.post('/categories', async (req, res) => {
    try {
        const { name } = req.body;
        
        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        const newCategory = new Category({ name: name.trim() });
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create category' });
    }
});

// PUT /api/categories/:id - Update category
router.put('/categories/:id', async (req, res) => {
    try {
        const { name } = req.body;
        
        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            { name: name.trim() },
            { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json(updatedCategory);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update category' });
    }
});

// DELETE /api/categories/:id - Delete category
router.delete('/categories/:id', async (req, res) => {
    try {
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);
        
        if (!deletedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

// GET /api/recipes/:categoryId
router.get('/recipes/:categoryId', async (req, res) => {
    try {
        const recipes = await Recipe.find({ categoryId: req.params.categoryId });
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch recipes' });
    }
});

// POST /api/upload
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const { name, categoryId } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const newRecipe = new Recipe({
            name,
            categoryId,
            pdfPath: req.file.filename
        });

        await newRecipe.save();
        res.json(newRecipe);
    } catch (err) {
        res.status(500).json({ error: 'Failed to upload recipe' });
    }
});

// GET /api/recipe/:id - serve the PDF file
router.get('/recipe/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).send('Recipe not found');
        }

        res.sendFile(path.resolve(__dirname, '../uploads', recipe.pdfPath));
    } catch (err) {
        res.status(500).json({ error: 'Failed to serve PDF' });
    }
});


module.exports = router;
