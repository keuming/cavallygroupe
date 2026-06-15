#!/usr/bin/env node
import { getDb } from './server/db.ts';
import { getAllProducts } from './server/db.ts';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '..', 'cavaly_books_export');
const COVERS_DIR = path.join(OUTPUT_DIR, 'covers');
const JSON_FILE = path.join(OUTPUT_DIR, 'catalog.json');

// Create directories
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(COVERS_DIR)) fs.mkdirSync(COVERS_DIR, { recursive: true });

console.log('Extracting catalog from database...');

// Get all products
const products = await getAllProducts();

console.log(`Found ${products.length} products`);

// Prepare catalog data
const catalog = {
  metadata: {
    total: products.length,
    exportDate: new Date().toISOString(),
    site: 'Cavaly Livres',
    description: 'Catalogue complet des manuels scolaires, universitaires et oeuvres littéraires'
  },
  books: []
};

// Download function
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filepath);
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

// Process each product
for (let i = 0; i < products.length; i++) {
  const product = products[i];
  console.log(`[${i + 1}/${products.length}] Processing: ${product.title}`);
  
  const book_data = {
    id: product.id,
    title: product.title,
    author: product.author,
    isbn: product.isbn || null,
    description: product.description || null,
    price: parseFloat(product.price),
    currency: 'FCFA',
    stock: product.stock,
    category: product.category || 'Unknown',
    coverImageUrl: product.coverImageUrl,
    localCoverPath: null,
    createdAt: product.createdAt
  };
  
  // Download cover if URL exists
  if (product.coverImageUrl) {
    try {
      // Generate filename from title
      const safe_title = product.title
        .replace(/[^a-zA-Z0-9\s-_]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 50);
      
      // Get file extension
      const url_obj = new URL(product.coverImageUrl);
      const pathname = url_obj.pathname;
      const ext = path.extname(pathname) || '.jpg';
      
      const filename = `${String(product.id).padStart(3, '0')}_${safe_title}${ext}`;
      const filepath = path.join(COVERS_DIR, filename);
      
      // Download the image
      await downloadFile(product.coverImageUrl, filepath);
      book_data.localCoverPath = `covers/${filename}`;
      console.log(`  ✓ Downloaded: ${filename}`);
    } catch (err) {
      console.log(`  ✗ Error downloading: ${err.message}`);
    }
  }
  
  catalog.books.push(book_data);
}

// Save catalog JSON
fs.writeFileSync(JSON_FILE, JSON.stringify(catalog, null, 2));

console.log(`\n✓ Catalog exported to: ${JSON_FILE}`);
console.log(`✓ Covers saved to: ${COVERS_DIR}`);
console.log(`✓ Total books: ${catalog.books.length}`);

// Print summary
const covers_downloaded = catalog.books.filter(b => b.localCoverPath).length;
console.log(`✓ Covers downloaded: ${covers_downloaded}/${catalog.books.length}`);

process.exit(0);
