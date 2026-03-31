const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// GET all products (with optional search/filter)
app.get('/api/products', (req, res) => {
  try {
    const { search, category } = req.query;
    let query = 'SELECT * FROM products';
    const params = [];

    if (search || category) {
      query += ' WHERE';
      if (search) {
        query += ' (name LIKE ? OR sku LIKE ? OR description LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }
      if (search && category) {
        query += ' AND';
      }
      if (category) {
        query += ' category = ?';
        params.push(category);
      }
    }

    query += ' ORDER BY name ASC';
    const products = db.prepare(query).all(...params);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single product
app.get('/api/products/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all categories
app.get('/api/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT DISTINCT category FROM products ORDER BY category ASC').all();
    res.json(categories.map(c => c.category));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create product
app.post('/api/products', (req, res) => {
  try {
    const { name, category, sku, price, quantity, description } = req.body;

    if (!name || !category || !sku || price == null) {
      return res.status(400).json({ error: 'name, category, sku, and price are required' });
    }
    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ error: 'price must be a non-negative number' });
    }
    if (quantity != null && (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 0)) {
      return res.status(400).json({ error: 'quantity must be a non-negative integer' });
    }

    const result = db.prepare(`
      INSERT INTO products (name, category, sku, price, quantity, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, category, sku, price, quantity ?? 0, description ?? '');

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(product);
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'A product with this SKU already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT update product
app.put('/api/products/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const { name, category, sku, price, quantity, description } = req.body;

    if (price != null && (typeof price !== 'number' || price < 0)) {
      return res.status(400).json({ error: 'price must be a non-negative number' });
    }
    if (quantity != null && (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 0)) {
      return res.status(400).json({ error: 'quantity must be a non-negative integer' });
    }

    db.prepare(`
      UPDATE products
      SET name = ?, category = ?, sku = ?, price = ?, quantity = ?, description = ?
      WHERE id = ?
    `).run(
      name ?? existing.name,
      category ?? existing.category,
      sku ?? existing.sku,
      price ?? existing.price,
      quantity ?? existing.quantity,
      description ?? existing.description,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'A product with this SKU already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PATCH update quantity only
app.patch('/api/products/:id/quantity', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const { quantity } = req.body;
    if (quantity == null || typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 0) {
      return res.status(400).json({ error: 'quantity must be a non-negative integer' });
    }

    db.prepare('UPDATE products SET quantity = ? WHERE id = ?').run(quantity, req.params.id);
    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE product
app.delete('/api/products/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
