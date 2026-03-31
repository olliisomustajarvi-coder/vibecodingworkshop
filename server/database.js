const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'inventory.db');

const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create products table
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
    { name: 'Wireless Bluetooth Headphones', category: 'Electronics', sku: 'ELEC-001', price: 79.99, quantity: 45, description: 'Over-ear wireless headphones with noise cancellation' },
    { name: 'USB-C Charging Cable', category: 'Electronics', sku: 'ELEC-002', price: 12.99, quantity: 200, description: '6ft braided USB-C to USB-A charging cable' },
    { name: 'Mechanical Keyboard', category: 'Electronics', sku: 'ELEC-003', price: 129.99, quantity: 30, description: 'Compact TKL mechanical keyboard with RGB backlight' },
    { name: 'Ergonomic Office Chair', category: 'Furniture', sku: 'FURN-001', price: 349.99, quantity: 12, description: 'Adjustable lumbar support ergonomic office chair' },
    { name: 'Standing Desk', category: 'Furniture', sku: 'FURN-002', price: 499.99, quantity: 8, description: 'Electric height-adjustable standing desk, 48"x24"' },
    { name: 'Desk Lamp', category: 'Furniture', sku: 'FURN-003', price: 45.99, quantity: 60, description: 'LED desk lamp with adjustable color temperature' },
    { name: 'Running Shoes', category: 'Footwear', sku: 'FOOT-001', price: 89.99, quantity: 75, description: 'Lightweight breathable running shoes' },
    { name: 'Leather Boots', category: 'Footwear', sku: 'FOOT-002', price: 159.99, quantity: 40, description: 'Full-grain leather ankle boots' },
    { name: 'Canvas Sneakers', category: 'Footwear', sku: 'FOOT-003', price: 49.99, quantity: 110, description: 'Classic canvas low-top sneakers' },
    { name: 'Cotton T-Shirt', category: 'Apparel', sku: 'APPR-001', price: 19.99, quantity: 300, description: '100% organic cotton crew-neck t-shirt' },
    { name: 'Denim Jeans', category: 'Apparel', sku: 'APPR-002', price: 59.99, quantity: 150, description: 'Slim-fit stretch denim jeans' },
    { name: 'Hoodie Sweatshirt', category: 'Apparel', sku: 'APPR-003', price: 44.99, quantity: 90, description: 'Fleece-lined pullover hoodie' },
    { name: 'Stainless Steel Water Bottle', category: 'Kitchen', sku: 'KTCH-001', price: 29.99, quantity: 180, description: '32oz vacuum-insulated stainless steel bottle' },
    { name: 'Coffee Maker', category: 'Kitchen', sku: 'KTCH-002', price: 89.99, quantity: 25, description: '12-cup programmable drip coffee maker' },
    { name: 'Non-stick Frying Pan', category: 'Kitchen', sku: 'KTCH-003', price: 34.99, quantity: 65, description: '10-inch ceramic non-stick frying pan' },
    { name: 'Yoga Mat', category: 'Sports', sku: 'SPRT-001', price: 39.99, quantity: 85, description: 'Extra thick non-slip yoga and exercise mat' },
    { name: 'Resistance Bands Set', category: 'Sports', sku: 'SPRT-002', price: 24.99, quantity: 120, description: 'Set of 5 resistance bands with different strengths' },
    { name: 'Backpack', category: 'Bags', sku: 'BAGS-001', price: 69.99, quantity: 55, description: '30L waterproof hiking and travel backpack' },
    { name: 'Sunglasses', category: 'Accessories', sku: 'ACCSS-001', price: 34.99, quantity: 95, description: 'UV400 polarized sport sunglasses' },
    { name: 'Wristwatch', category: 'Accessories', sku: 'ACCSS-002', price: 199.99, quantity: 20, description: 'Classic analog quartz wristwatch with leather strap' },
  ];

  const insertMany = db.transaction((items) => {
    for (const item of items) {
      insert.run(item);
    }
  });

  insertMany(products);
}

module.exports = db;
