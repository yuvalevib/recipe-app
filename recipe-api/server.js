const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

console.log('[server] Starting with file storage. CWD=', process.cwd(), 'DIRNAME=', __dirname);

// Request logger
app.use((req, res, next) => {
    console.log(`[server] ${req.method} ${req.url}`);
    next();
});

// Ensure data directory and files exist for file-based storage
const dataDir = path.join(__dirname, 'data');
const categoriesFile = path.join(dataDir, 'categories.json');
const recipesFile = path.join(dataDir, 'recipes.json');

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(categoriesFile)) {
    fs.writeFileSync(categoriesFile, JSON.stringify([]));
}
if (!fs.existsSync(recipesFile)) {
    fs.writeFileSync(recipesFile, JSON.stringify([]));
}
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Simple health check (register before routers to avoid any mount order issues)
app.get('/ping', (req, res) => {
    res.json({ ok: true });
});
app.get('/api/ping', (req, res) => {
    res.json({ ok: true });
});

const recipeRoutes = require('./routes/recipes');
app.use('/api', recipeRoutes);

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
