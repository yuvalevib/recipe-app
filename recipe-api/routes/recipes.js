const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./auth');

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
// Allow only specific file types
const allowedMimeTypes = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
]);
const allowedExtensions = new Set(['.pdf', '.doc', '.docx', '.jpeg', '.jpg', '.png']);

function fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedMimeTypes.has(file.mimetype) || allowedExtensions.has(ext)) {
        return cb(null, true);
    }
    return cb(new Error('Unsupported file type'), false);
}

const upload = multer({ storage, fileFilter });

// --- Auth middleware ---
function authRequired(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    } catch (e) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}

// All subsequent routes require auth (per-user data isolation)
router.use(authRequired);

// GET /api/categories (user-specific)
router.get('/categories', async (req, res) => {
    try {
        console.log('[routes] GET /categories reading from', categoriesFile, 'for user', req.user && req.user.sub);
        const categories = await readJsonArray(categoriesFile);
        // Return only categories owned by this user (ignore legacy categories without userId)
        const filtered = categories.filter(c => c.userId === req.user.sub);
        res.json(filtered);
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
        const { name, imageUrl } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Category name is required' });
        }

    const categories = await readJsonArray(categoriesFile);
    const newCategory = { _id: generateId(), name: name.trim(), userId: req.user.sub };
        if (imageUrl && String(imageUrl).trim()) {
            newCategory.imageUrl = String(imageUrl).trim();
        }
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
        const { name, imageUrl } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        const categories = await readJsonArray(categoriesFile);
    const idx = categories.findIndex(c => c._id === req.params.id && c.userId === req.user.sub);
        if (idx === -1) {
            return res.status(404).json({ message: 'Category not found' });
        }
        const updated = { ...categories[idx], name: name.trim() };
        if (typeof imageUrl !== 'undefined') {
            // Allow setting, updating, or clearing imageUrl
            if (imageUrl === null || imageUrl === '') {
                delete updated.imageUrl;
            } else {
                updated.imageUrl = String(imageUrl).trim();
            }
        }
        categories[idx] = updated;
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
    const idx = categories.findIndex(c => c._id === req.params.id && c.userId === req.user.sub);
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
    const filtered = recipes.filter(r => r.categoryId === req.params.categoryId && r.userId === req.user.sub);
        res.json(filtered);
    } catch (err) {
        console.error('GET /recipes/:categoryId failed:', err);
        res.status(500).json({ error: 'Failed to fetch recipes', details: String(err && err.message || err) });
    }
});

// POST /api/upload
// Accepts document file under field `file` (required) and optional image file under field `image`.
router.post('/upload', upload.fields([{ name: 'file', maxCount: 1 }, { name: 'image', maxCount: 1 }]), async (req, res) => {
    try {
        const { name, categoryId, imageUrl } = req.body;

        const uploadedRecipeFile = req.files && Array.isArray(req.files.file) ? req.files.file[0] : null;
        const uploadedImageFile = req.files && Array.isArray(req.files.image) ? req.files.image[0] : null;

        if (!uploadedRecipeFile) {
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
            pdfPath: uploadedRecipeFile.filename,
            userId: req.user.sub
        };

        // Compute absolute URL helper
        const buildAbsoluteUrl = (filename) => {
            const host = req.get('host');
            const protocolHeader = req.headers['x-forwarded-proto'];
            const protocol = protocolHeader ? String(protocolHeader) : req.protocol;
            const relativePath = `/uploads/${filename}`;
            return `${protocol}://${host}${relativePath}`;
        };

        if (uploadedImageFile) {
            newRecipe.imageUrl = buildAbsoluteUrl(uploadedImageFile.filename);
        } else if (imageUrl && String(imageUrl).trim()) {
            newRecipe.imageUrl = String(imageUrl).trim();
        }

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
    const recipe = recipes.find(r => r._id === req.params.id && r.userId === req.user.sub);
        if (!recipe) {
            return res.status(404).send('Recipe not found');
        }

        res.sendFile(path.resolve(uploadsDir, recipe.pdfPath));
    } catch (err) {
        console.error('GET /recipe/:id failed:', err);
        res.status(500).json({ error: 'Failed to serve PDF', details: String(err && err.message || err) });
    }
});

// DELETE /api/recipe/:id - Delete recipe and its file
router.delete('/recipe/:id', async (req, res) => {
    try {
        const recipes = await readJsonArray(recipesFile);
    const idx = recipes.findIndex(r => r._id === req.params.id && r.userId === req.user.sub);
        if (idx === -1) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        const [deleted] = recipes.splice(idx, 1);
        await writeJsonArray(recipesFile, recipes);

        const filename = deleted && (deleted.pdfPath || deleted.filePath);
        if (filename) {
            try {
                await fs.unlink(path.resolve(uploadsDir, filename));
            } catch (fileErr) {
                console.warn('[delete] file removal failed for', filename, fileErr && fileErr.message);
            }
        }

        res.json({ message: 'Recipe deleted successfully' });
    } catch (err) {
        console.error('DELETE /recipe/:id failed:', err);
        res.status(500).json({ error: 'Failed to delete recipe', details: String(err && err.message || err) });
    }
});

module.exports = router;

// POST /api/recipes/:id/image - Upload/replace recipe image
router.post('/recipes/:id/image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }

        const recipes = await readJsonArray(recipesFile);
    const idx = recipes.findIndex(r => r._id === req.params.id && r.userId === req.user.sub);
        if (idx === -1) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        const host = req.get('host');
        const protocolHeader = req.headers['x-forwarded-proto'];
        const protocol = protocolHeader ? String(protocolHeader) : req.protocol;
        const relativePath = `/uploads/${req.file.filename}`;
        const absoluteUrl = `${protocol}://${host}${relativePath}`;

        recipes[idx] = { ...recipes[idx], imageUrl: absoluteUrl };
        await writeJsonArray(recipesFile, recipes);
        res.json(recipes[idx]);
    } catch (err) {
        console.error('POST /recipes/:id/image failed:', err);
        res.status(500).json({ error: 'Failed to upload recipe image', details: String(err && err.message || err) });
    }
});

// POST /api/categories/:id/image - Upload/replace category image
router.post('/categories/:id/image', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const categories = await readJsonArray(categoriesFile);
    const idx = categories.findIndex(c => c._id === req.params.id && c.userId === req.user.sub);
        if (idx === -1) {
            return res.status(404).json({ message: 'Category not found' });
        }

        // Build absolute URL to the uploaded file so the frontend can render it cross-origin
        const host = req.get('host');
        const protocolHeader = req.headers['x-forwarded-proto'];
        const protocol = protocolHeader ? String(protocolHeader) : req.protocol;
        const relativePath = `/uploads/${req.file.filename}`;
        const absoluteUrl = `${protocol}://${host}${relativePath}`;

        categories[idx] = { ...categories[idx], imageUrl: absoluteUrl };
        await writeJsonArray(categoriesFile, categories);
        res.json(categories[idx]);
    } catch (err) {
        console.error('POST /categories/:id/image failed:', err);
        res.status(500).json({ error: 'Failed to upload category image', details: String(err && err.message || err) });
    }
});
