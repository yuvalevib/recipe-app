#!/usr/bin/env node
// Migration script: assign a specific userId to existing categories/recipes missing userId
// Usage: JWT_USER_ID=<existingUserId> node migrate-add-userId.js

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const categoriesFile = path.join(dataDir, 'categories.json');
const recipesFile = path.join(dataDir, 'recipes.json');

const userId = process.env.JWT_USER_ID;
if (!userId) {
  console.error('Missing env var JWT_USER_ID');
  process.exit(1);
}

function load(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8') || '[]'); } catch { return []; }
}
function save(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

const categories = load(categoriesFile).map(c => c.userId ? c : { ...c, userId });
const recipes = load(recipesFile).map(r => r.userId ? r : { ...r, userId });

save(categoriesFile, categories);
save(recipesFile, recipes);

console.log('Migration complete. Categories:', categories.length, 'Recipes:', recipes.length, 'Assigned userId:', userId);
