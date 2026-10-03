'use strict';

require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const config  = require('./config');
const db      = require('./db/db');

const app = express();

/* ══════════════════════════════════════════
   MIDDLEWARE
   ══════════════════════════════════════════ */
app.use(cors({ origin: config.allowedOrigin }));
app.use(express.json());

/* Request logger */
app.use(function(req, res, next) {
  console.log('[' + new Date().toISOString() + '] ' + req.method + ' ' + req.path);
  next();
});

/* ══════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════ */
function ok(res, data, status, meta) {
  var body = { success: true, data: data };
  if (meta) body.meta = meta;
  return res.status(status || 200).json(body);
}

function err(res, status, message) {
  return res.status(status).json({ success: false, message: message });
}

/* ══════════════════════════════════════════
   ROUTES
   ══════════════════════════════════════════ */

/* Health check */
app.get('/', function(req, res) {
  res.json({
    success: true,
    message: 'Razor Audio API is running',
    version: config.apiVersion,
    env:     config.nodeEnv,
    storage: 'db/products.json',
    endpoints: [
      'GET    /api/products',
      'GET    /api/products/:id',
      'GET    /api/products/:id/variants',
      'POST   /api/products',
      'PUT    /api/products/:id',
      'PATCH  /api/products/:id',
      'DELETE /api/products/:id',
    ],
  });
});

/* GET /api/products */
app.get('/api/products', function(req, res) {
  var result = db.getAll();

  if (req.query.search) {
    var kw = req.query.search.toLowerCase();
    result = result.filter(function(p) {
      return p.name.toLowerCase().indexOf(kw) !== -1 || p.description.toLowerCase().indexOf(kw) !== -1;
    });
  }
  if (req.query.category)  result = result.filter(function(p) { return p.category === req.query.category; });
  if (req.query.inStock !== undefined) {
    var s = req.query.inStock === 'true';
    result = result.filter(function(p) { return p.inStock === s; });
  }
  if (req.query.minPrice)  result = result.filter(function(p) { return p.price >= parseFloat(req.query.minPrice); });
  if (req.query.maxPrice)  result = result.filter(function(p) { return p.price <= parseFloat(req.query.maxPrice); });

  var sortBy = req.query.sort || 'id';
  var order  = req.query.order || 'asc';
  result.sort(function(a, b) {
    var A = typeof a[sortBy] === 'string' ? a[sortBy].toLowerCase() : a[sortBy];
    var B = typeof b[sortBy] === 'string' ? b[sortBy].toLowerCase() : b[sortBy];
    return A < B ? (order === 'asc' ? -1 : 1) : A > B ? (order === 'asc' ? 1 : -1) : 0;
  });

  var page  = Math.max(1, parseInt(req.query.page,  10) || 1);
  var limit = Math.min(50, parseInt(req.query.limit, 10) || 10);
  var total = result.length;
  var pages = Math.ceil(total / limit);
  var paged = result.slice((page - 1) * limit, page * limit).map(function(p) {
    return { id: p.id, name: p.name, brand: p.brand, price: p.price, image: p.image, category: p.category, rating: p.rating, reviewCount: p.reviewCount, inStock: p.inStock };
  });

  ok(res, paged, 200, { total: total, page: page, limit: limit, totalPages: pages, hasNext: page < pages, hasPrev: page > 1 });
});

/* GET /api/products/:id */
app.get('/api/products/:id', function(req, res) {
  var p = db.getById(req.params.id);
  if (!p) return err(res, 404, 'Product tidak ditemukan. ID: ' + req.params.id);
  ok(res, p);
});

/* GET /api/products/:id/variants */
app.get('/api/products/:id/variants', function(req, res) {
  var p = db.getById(req.params.id);
  if (!p) return err(res, 404, 'Product tidak ditemukan.');
  ok(res, p.variants);
});

/* POST /api/products */
app.post('/api/products', function(req, res) {
  var b = req.body;
  var missing = ['name','price','image','description'].filter(function(f) { return !b[f]; });
  if (missing.length) return err(res, 400, 'Field wajib tidak lengkap: ' + missing.join(', '));
  if (isNaN(parseFloat(b.price)) || parseFloat(b.price) < 0) return err(res, 400, 'Price harus angka positif.');

  var created = db.create({
    name: b.name, brand: b.brand || 'Razor Audio', tagline: b.tagline || '',
    price: parseFloat(b.price), image: b.image,
    variants: b.variants || { colorOrSize: [], quantity: 0 },
    description: b.description, specs: b.specs || {}, features: b.features || [],
    category: b.category || 'wireless', rating: 0, reviewCount: 0,
    inStock: b.inStock !== undefined ? b.inStock : true,
  });
  res.status(201).json({ success: true, message: 'Produk berhasil ditambahkan.', data: created });
});

/* PUT /api/products/:id */
app.put('/api/products/:id', function(req, res) {
  var existing = db.getById(req.params.id);
  if (!existing) return err(res, 404, 'Product tidak ditemukan.');
  var b = req.body;
  var missing = ['name','price','image','description'].filter(function(f) { return !b[f]; });
  if (missing.length) return err(res, 400, 'Field wajib tidak lengkap: ' + missing.join(', '));

  var updated = db.update(req.params.id, {
    name: b.name, brand: b.brand || existing.brand, tagline: b.tagline || existing.tagline,
    price: parseFloat(b.price), image: b.image, variants: b.variants || existing.variants,
    description: b.description, specs: b.specs || existing.specs, features: b.features || existing.features,
    category: b.category || existing.category, inStock: b.inStock !== undefined ? b.inStock : existing.inStock,
  });
  ok(res, updated);
});

/* PATCH /api/products/:id */
app.patch('/api/products/:id', function(req, res) {
  var existing = db.getById(req.params.id);
  if (!existing) return err(res, 404, 'Product tidak ditemukan.');
  var patch = {};
  ['name','brand','tagline','price','image','variants','description','specs','features','category','inStock'].forEach(function(k) {
    if (req.body[k] !== undefined) patch[k] = k === 'price' ? parseFloat(req.body[k]) : req.body[k];
  });
  ok(res, db.update(req.params.id, patch));
});

/* DELETE /api/products/:id */
app.delete('/api/products/:id', function(req, res) {
  var deleted = db.remove(req.params.id);
  if (!deleted) return err(res, 404, 'Product tidak ditemukan.');
  res.json({ success: true, message: 'Produk berhasil dihapus.', data: { id: deleted.id, name: deleted.name } });
});

/* 404 */
app.use(function(req, res) {
  err(res, 404, 'Endpoint tidak ditemukan: ' + req.method + ' ' + req.path);
});

/* Global error */
app.use(function(e, req, res, next) {
  console.error('[ERROR]', e.message);
  err(res, 500, 'Internal server error: ' + e.message);
});

/* ══════════════════════════════════════════
   START
   ══════════════════════════════════════════ */
if (require.main === module) {
  app.listen(config.port, function() {
    console.log('\n  Razor Audio API');
    console.log('  Running  : http://localhost:' + config.port);
    console.log('  Storage  : db/products.json');
    console.log('  Products : http://localhost:' + config.port + '/api/products\n');
  });
}

module.exports = app;
