const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const router = express.Router();

// Paths for file-based storage
const dataDir = path.join(__dirname, '..', 'data');
const categoriesFile = path.join(dataDir, 'categories.json');
const recipesFile = path.join(dataDir, 'recipes.json');
const uploadsDir = path.join(__dirname, '..', 'uploads');

// Helpers
async function readJsonArray(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        if (!content) return [];
        const parsed = JSON.parse(content);
        return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
        console.error('[readJsonArray] failed for', filePath, err);
        return [];
    }
}

async function writeJsonArray(filePath, data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

function generateId() {
    // Simple unique id generator compatible with frontend expecting `_id`
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

// Setup multer storage for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// GET /api/categories
router.get('/categories', async (req, res) => {
    try {
        console.log('[routes] GET /categories reading from', categoriesFile);
        const categories = await readJsonArray(categoriesFile);
        res.json(categories);
    } catch (err) {
        console.error('GET /categories failed:', err);
        res.status(500).json({ error: 'Failed to fetch categories', details: String(err && err.message || err) });
    }
});

// router-level ping
router.get('/ping', (req, res) => {
    res.json({ ok: true, router: true });
});

// POST /api/categories - Add new category
router.post('/categories', async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        const categories = await readJsonArray(categoriesFile);
        const newCategory = { _id: generateId(), name: name.trim() };
        categories.push(newCategory);
        await writeJsonArray(categoriesFile, categories);
        res.status(201).json(newCategory);
    } catch (err) {
        console.error('POST /categories failed:', err);
        res.status(500).json({ error: 'Failed to create category', details: String(err && err.message || err) });
    }
});

// PUT /api/categories/:id - Update category
router.put('/categories/:id', async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        const categories = await readJsonArray(categoriesFile);
        const idx = categories.findIndex(c => c._id === req.params.id);
        if (idx === -1) {
            return res.status(404).json({ message: 'Category not found' });
        }
        categories[idx] = { ...categories[idx], name: name.trim() };
        await writeJsonArray(categoriesFile, categories);
        res.json(categories[idx]);
    } catch (err) {
        console.error('PUT /categories/:id failed:', err);
        res.status(500).json({ error: 'Failed to update category', details: String(err && err.message || err) });
    }
});

// DELETE /api/categories/:id - Delete category
router.delete('/categories/:id', async (req, res) => {
    try {
        const categories = await readJsonArray(categoriesFile);
        const recipes = await readJsonArray(recipesFile);
        const idx = categories.findIndex(c => c._id === req.params.id);
        if (idx === -1) {
            return res.status(404).json({ message: 'Category not found' });
        }

        categories.splice(idx, 1);
        const remainingRecipes = recipes.filter(r => r.categoryId !== req.params.id);
        await writeJsonArray(categoriesFile, categories);
        await writeJsonArray(recipesFile, remainingRecipes);
        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        console.error('DELETE /categories/:id failed:', err);
        res.status(500).json({ error: 'Failed to delete category', details: String(err && err.message || err) });
    }
});

// GET /api/recipes/:categoryId
router.get('/recipes/:categoryId', async (req, res) => {
    try {
        const recipes = await readJsonArray(recipesFile);
        const filtered = recipes.filter(r => r.categoryId === req.params.categoryId);
        res.json(filtered);
    } catch (err) {
        console.error('GET /recipes/:categoryId failed:', err);
        res.status(500).json({ error: 'Failed to fetch recipes', details: String(err && err.message || err) });
    }
});

// POST /api/upload
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const { name, categoryId } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Recipe name is required' });
        }
        if (!categoryId) {
            return res.status(400).json({ message: 'Category is required' });
        }

        const recipes = await readJsonArray(recipesFile);
        const newRecipe = {
            _id: generateId(),
            name: name.trim(),
            categoryId,
            pdfPath: req.file.filename
        };

        recipes.push(newRecipe);
        await writeJsonArray(recipesFile, recipes);
        res.json(newRecipe);
    } catch (err) {
        console.error('POST /upload failed:', err);
        res.status(500).json({ error: 'Failed to upload recipe', details: String(err && err.message || err) });
    }
});

// GET /api/recipe/:id - serve the PDF file
router.get('/recipe/:id', async (req, res) => {
    try {
        const recipes = await readJsonArray(recipesFile);
        const recipe = recipes.find(r => r._id === req.params.id);
        if (!recipe) {
            return res.status(404).send('Recipe not found');
        }

        res.sendFile(path.resolve(uploadsDir, recipe.pdfPath));
    } catch (err) {
        console.error('GET /recipe/:id failed:', err);
        res.status(500).json({ error: 'Failed to serve PDF', details: String(err && err.message || err) });
    }
});

module.exports = router;
