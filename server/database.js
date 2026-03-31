const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'inventory.db');

const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create gear table (products are fishing gear items)
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

// Seed with 20 products if table is empty
const count = db.prepare('SELECT COUNT(*) as count FROM products').get();
if (count.count === 0) {
  const insert = db.prepare(`
    INSERT INTO products (name, category, sku, price, quantity, description)
    VALUES (@name, @category, @sku, @price, @quantity, @description)
  `);

  const products = [
    { name: 'Medium-Heavy Spinning Rod 7\'', category: 'Rods', sku: 'ROD-001', price: 89.99, quantity: 2, description: '7-foot medium-heavy spinning rod, fast action, ideal for bass and pike' },
    { name: 'Ultralight Trout Rod 5\'6"', category: 'Rods', sku: 'ROD-002', price: 54.99, quantity: 1, description: 'Ultralight 5\'6" spinning rod, perfect for trout and panfish' },
    { name: 'Heavy Casting Rod 7\'6"', category: 'Rods', sku: 'ROD-003', price: 119.99, quantity: 1, description: '7\'6" heavy power casting rod for muskie and large pike' },
    { name: 'Shimano Stradic FL 2500', category: 'Reels', sku: 'REEL-001', price: 189.99, quantity: 2, description: 'Smooth front-drag spinning reel, 6.0:1 gear ratio, great all-rounder' },
    { name: 'Daiwa BG 3000 Spinning Reel', category: 'Reels', sku: 'REEL-002', price: 69.99, quantity: 1, description: 'Durable saltwater-ready spinning reel with aluminium body' },
    { name: 'Berkley PowerBait Worm 7"', category: 'Lures', sku: 'LURE-001', price: 5.99, quantity: 15, description: 'Soft plastic worm with built-in scent, green pumpkin colour' },
    { name: 'Rapala Original Floater F-7', category: 'Lures', sku: 'LURE-002', price: 9.99, quantity: 8, description: 'Classic balsa minnow lure, 7cm, firetiger pattern' },
    { name: 'Spinnerbait 3/8 oz', category: 'Lures', sku: 'LURE-003', price: 7.49, quantity: 12, description: 'Double-blade Colorado spinnerbait, white/chartreuse skirt' },
    { name: 'Topwater Popper 60mm', category: 'Lures', sku: 'LURE-004', price: 11.99, quantity: 6, description: 'Surface popper for bass and perch, natural frog pattern' },
    { name: 'Tungsten Jig Head 5g', category: 'Lures', sku: 'LURE-005', price: 3.49, quantity: 30, description: 'Pack of 5 tungsten round jig heads, size 2/0 hook' },
    { name: 'Fluorocarbon Leader 20lb', category: 'Lines & Leaders', sku: 'LINE-001', price: 14.99, quantity: 4, description: '50m spool of 20lb fluorocarbon leader material, near-invisible' },
    { name: 'Braided Line 30lb 150m', category: 'Lines & Leaders', sku: 'LINE-002', price: 19.99, quantity: 3, description: '8-strand braided fishing line, 30lb, moss green, 150m' },
    { name: 'Wire Trace Leaders 30lb', category: 'Lines & Leaders', sku: 'LINE-003', price: 6.99, quantity: 10, description: 'Pack of 10 pre-made wire trace leaders for pike fishing' },
    { name: 'Treble Hooks Size 4', category: 'Hooks & Terminal Tackle', sku: 'HOOK-001', price: 4.29, quantity: 25, description: 'Pack of 10 high-carbon steel treble hooks, size 4' },
    { name: 'Offset Worm Hooks 3/0', category: 'Hooks & Terminal Tackle', sku: 'HOOK-002', price: 3.99, quantity: 20, description: 'Pack of 10 wide-gap offset EWG hooks for soft plastics' },
    { name: 'Barrel Swivels Size 10', category: 'Hooks & Terminal Tackle', sku: 'HOOK-003', price: 2.99, quantity: 40, description: 'Pack of 20 black barrel swivels, 30lb breaking strain' },
    { name: 'Landing Net 55cm', category: 'Accessories', sku: 'ACC-001', price: 34.99, quantity: 1, description: 'Telescopic handle landing net with knotless rubber mesh' },
    { name: 'Plano 3600 Tackle Box', category: 'Accessories', sku: 'ACC-002', price: 12.99, quantity: 3, description: 'Divided storage tackle box, 3600 size, 20 compartments' },
    { name: 'Digital Fishing Scale 50lb', category: 'Accessories', sku: 'ACC-003', price: 21.99, quantity: 1, description: 'Waterproof digital scale with lip grip, measures up to 50lb' },
    { name: 'Polarised Fishing Sunglasses', category: 'Accessories', sku: 'ACC-004', price: 29.99, quantity: 2, description: 'Polarised lenses to cut surface glare, floating frame design' },
  ];

  const insertMany = db.transaction((items) => {
    for (const item of items) {
      insert.run(item);
    }
  });

  insertMany(products);
}

module.exports = db;
