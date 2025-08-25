const express = require('express');
const multer = require('multer');
let cloudinary = null;
const useCloudinary = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
if (useCloudinary) {
    cloudinary = require('cloudinary').v2;
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log('[recipes] Cloudinary enabled');
} else {
    console.log('[recipes] Cloudinary not configured, using local disk storage');
}
const path = require('path');
const fs = require('fs').promises;
// Auth no longer enforced for these resource routes (login kept separately)

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

// Setup multer storage for file uploads (buffer if cloudinary, disk otherwise)
let storage;
if (useCloudinary) {
    storage = multer.memoryStorage();
} else {
    storage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadsDir),
        filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
    });
}

// Debug/status endpoint to check storage configuration
router.get('/storage/status', async (req, res) => {
    try {
        const recipes = await readJsonArray(recipesFile);
        const cloudRecipes = recipes.filter(r => r.pdfUrl).length;
        const mask = (str) => str ? str.slice(0, 4) + '***' : undefined;
        res.json({
            useCloudinary,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME || null,
            haveApiKey: !!process.env.CLOUDINARY_API_KEY,
            haveApiSecret: !!process.env.CLOUDINARY_API_SECRET,
            totalRecipes: recipes.length,
            recipesWithCloudUrl: cloudRecipes,
            sample: recipes.slice(-3).map(r => ({ _id: r._id, name: r.name, hasPdfUrl: !!r.pdfUrl })),
            envSummary: {
                CLOUDINARY_CLOUD_NAME: mask(process.env.CLOUDINARY_CLOUD_NAME || ''),
                CLOUDINARY_API_KEY: mask(process.env.CLOUDINARY_API_KEY || ''),
                CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'set' : 'missing'
            }
        });
    } catch (e) {
        res.status(500).json({ error: 'status failed', details: e.message });
    }
});
// Allow only specific file types
// Updated: restrict document uploads to PDF only (remove Word formats) while still allowing images
const allowedMimeTypes = new Set([
    'application/pdf',
    'image/jpeg', 'image/png', 'image/webp'
]);
const allowedExtensions = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp']);

function fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedMimeTypes.has(file.mimetype) || allowedExtensions.has(ext)) {
        return cb(null, true);
    }
    return cb(new Error('Unsupported file type'), false);
}

const upload = multer({ storage, fileFilter });

// All routes are now public.

// GET /api/categories (user-specific)
router.get('/categories', async (req, res) => {
    try {
    console.log('[routes] GET /categories');
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
        const { name, imageUrl } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Category name is required' });
        }

    const categories = await readJsonArray(categoriesFile);
    const newCategory = { _id: generateId(), name: name.trim() };
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
    const idx = categories.findIndex(c => c._id === req.params.id);
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
    res.json(recipes.filter(r => r.categoryId === req.params.categoryId));
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
        let pdfPath = null;
        let pdfUrl = null;
        if (useCloudinary) {
            // Upload PDF to Cloudinary using resource_type 'auto' so PDFs get correct content-type (application/pdf)
            // Using 'raw' often sets generic octet-stream causing browsers to download instead of display inline.
            const uploadPdf = await cloudinary.uploader.upload_stream
                ? await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream({ resource_type: 'auto', folder: 'recipes' }, (err, result) => {
                        if (err) return reject(err);
                        resolve(result);
                    });
                    stream.end(uploadedRecipeFile.buffer);
                })
                : null;
            pdfUrl = uploadPdf && uploadPdf.secure_url;
            pdfPath = uploadPdf && uploadPdf.public_id; // store public id (public_id used for generating derived URLs if needed)
        } else {
            pdfPath = uploadedRecipeFile.filename;
        }

        const newRecipe = {
            _id: generateId(),
            name: name.trim(),
            categoryId,
            pdfPath
        };
        if (pdfUrl) newRecipe.pdfUrl = pdfUrl;

        // Compute absolute URL helper
        const buildAbsoluteUrl = (filename) => {
            const host = req.get('host');
            const protocolHeader = req.headers['x-forwarded-proto'];
            const protocol = protocolHeader ? String(protocolHeader) : req.protocol;
            const relativePath = `/uploads/${filename}`;
            return `${protocol}://${host}${relativePath}`;
        };

        if (uploadedImageFile) {
            if (useCloudinary) {
                try {
                    const uploadedImg = await new Promise((resolve, reject) => {
                        const stream = cloudinary.uploader.upload_stream({ folder: 'recipes' }, (err, result) => {
                            if (err) return reject(err);
                            resolve(result);
                        });
                        stream.end(uploadedImageFile.buffer);
                    });
                    newRecipe.imageUrl = uploadedImg.secure_url;
                } catch (e) {
                    console.error('[cloudinary] image upload failed', e);
                }
            } else {
                newRecipe.imageUrl = buildAbsoluteUrl(uploadedImageFile.filename);
            }
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
    const recipe = recipes.find(r => r._id === req.params.id);
        if (!recipe) {
            return res.status(404).send('Recipe not found');
        }
        if (useCloudinary && recipe.pdfUrl) {
            // Cloudinary already serves with correct headers; redirect
            return res.redirect(recipe.pdfUrl);
        }
        const filePath = path.resolve(uploadsDir, recipe.pdfPath);
        // Ensure inline viewing
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${path.basename(filePath)}"`);
        res.sendFile(filePath);
    } catch (err) {
        console.error('GET /recipe/:id failed:', err);
        res.status(500).json({ error: 'Failed to serve PDF', details: String(err && err.message || err) });
    }
});

// DELETE /api/recipe/:id - Delete recipe and its file
router.delete('/recipe/:id', async (req, res) => {
    try {
        const recipes = await readJsonArray(recipesFile);
    const idx = recipes.findIndex(r => r._id === req.params.id);
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
    const idx = recipes.findIndex(r => r._id === req.params.id);
        if (idx === -1) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        let imageUrlFinal;
        if (useCloudinary) {
            try {
                const uploadedImg = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream({ folder: 'recipes' }, (err, result) => {
                        if (err) return reject(err);
                        resolve(result);
                    });
                    stream.end(req.file.buffer);
                });
                imageUrlFinal = uploadedImg.secure_url;
            } catch (e) {
                console.error('[cloudinary] image upload failed', e);
                return res.status(500).json({ error: 'Failed to upload image' });
            }
        } else {
            const host = req.get('host');
            const protocolHeader = req.headers['x-forwarded-proto'];
            const protocol = protocolHeader ? String(protocolHeader) : req.protocol;
            const relativePath = `/uploads/${req.file.filename}`;
            imageUrlFinal = `${protocol}://${host}${relativePath}`;
        }
        recipes[idx] = { ...recipes[idx], imageUrl: imageUrlFinal };
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
    const idx = categories.findIndex(c => c._id === req.params.id);
        if (idx === -1) {
            return res.status(404).json({ message: 'Category not found' });
        }
        let finalUrl;
        if (useCloudinary) {
            try {
                const uploadedImg = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream({ folder: 'recipes/categories' }, (err, result) => {
                        if (err) return reject(err);
                        resolve(result);
                    });
                    stream.end(req.file.buffer);
                });
                finalUrl = uploadedImg.secure_url;
            } catch (e) {
                console.error('[cloudinary] category image upload failed', e);
                return res.status(500).json({ error: 'Failed to upload category image' });
            }
        } else {
            const host = req.get('host');
            const protocolHeader = req.headers['x-forwarded-proto'];
            const protocol = protocolHeader ? String(protocolHeader) : req.protocol;
            const relativePath = `/uploads/${req.file.filename}`;
            finalUrl = `${protocol}://${host}${relativePath}`;
        }
        categories[idx] = { ...categories[idx], imageUrl: finalUrl };
        await writeJsonArray(categoriesFile, categories);
        res.json(categories[idx]);
    } catch (err) {
        console.error('POST /categories/:id/image failed:', err);
        res.status(500).json({ error: 'Failed to upload category image', details: String(err && err.message || err) });
    }
});
