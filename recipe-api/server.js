const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
// Load environment variables early (first try local folder .env, then parent project .env)
try {
    const dotenv = require('dotenv');
    const envLocal = path.resolve(__dirname, '.env');
    const envParent = path.resolve(__dirname, '..', '.env');
    let loaded = false;
    if (fs.existsSync(envLocal)) {
        dotenv.config({ path: envLocal });
        loaded = true;
    }
    if (!loaded && fs.existsSync(envParent)) {
        dotenv.config({ path: envParent });
        loaded = true;
    }
    if (!loaded) {
        // Fallback to default path (process.cwd())
        dotenv.config();
    }
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
        console.log('[env] CLOUDINARY_* vars not found. Cloudinary uploads will be disabled.');
    }
} catch (e) {
    console.warn('[env] dotenv load failed (optional):', e && e.message);
}

const app = express();

// CORS configuration (supports explicit whitelist via env var CORS_ORIGINS="https://a.com,https://b.com")
const rawOrigins = process.env.CORS_ORIGINS || '';
const allowedOrigins = rawOrigins.split(',').map(o => o.trim()).filter(Boolean);
// Always allow local dev origins for convenience
['http://localhost:3000','http://127.0.0.1:3000'].forEach(dev => {
    if (!allowedOrigins.includes(dev)) allowedOrigins.push(dev);
});
// Always include GitHub Pages repo pages if GITHUB_PAGES_USER/REPO provided
if (process.env.GH_PAGES_USER && process.env.GH_PAGES_REPO) {
    allowedOrigins.push(`https://${process.env.GH_PAGES_USER}.github.io`, `https://${process.env.GH_PAGES_USER}.github.io/${process.env.GH_PAGES_REPO}`);
}
// Provide a sensible default for your current GitHub Pages domain
if (!allowedOrigins.length) {
    allowedOrigins.push('https://yuvalevib.github.io');
}

app.use(cors({
    origin: function(origin, callback) {
        if (!origin) return callback(null, true); // non-browser or same-origin
        if (allowedOrigins.includes(origin)) return callback(null, true);
        // Allow subpath match (GitHub Pages project pages include repo suffix)
        if (allowedOrigins.some(o => origin.startsWith(o))) return callback(null, true);
        console.warn('[CORS] Blocked origin:', origin);
        return callback(new Error('Not allowed by CORS'));
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: false,
    optionsSuccessStatus: 204
}));

// Extra header safeguard (adds wildcard if no specific origin matched and request is simple GET)
app.use((req,res,next)=>{
    if (!res.get('Access-Control-Allow-Origin')) {
        // If origin was accepted earlier, cors middleware already set it.
        // We don't want to leak * when restricted, so only set * when whitelist contains '*'.
        if (allowedOrigins.includes('*')) res.setHeader('Access-Control-Allow-Origin','*');
    }
    next();
});
app.use(express.json());
const uploadsDir = process.env.UPLOADS_DIR
    ? path.resolve(process.env.UPLOADS_DIR)
    : path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

console.log('[server] Starting with file storage. CWD=', process.cwd(), 'DIRNAME=', __dirname);

// Request logger
app.use((req, res, next) => {
    console.log(`[server] ${req.method} ${req.url}`);
    next();
});

// Ensure data directory and files exist for file-based storage
const dataDir = process.env.DATA_DIR
    ? path.resolve(process.env.DATA_DIR)
    : path.join(__dirname, 'data');
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

// Quick CORS test endpoint
app.get('/api/cors-test', (req,res)=>{
    res.json({ ok:true, origin:req.headers.origin||null, allowedOrigins });
});

// Auth routes
const { router: authRoutes } = require('./routes/auth');
app.use('/api/auth', authRoutes); // Login/register only; rest of API is public now.

const recipeRoutes = require('./routes/recipes');
app.use('/api', recipeRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
