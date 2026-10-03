'use strict';

const request = require('supertest');
const app     = require('../server');
const fs      = require('fs');
const path    = require('path');

const DB_PATH   = path.join(__dirname, '../db/products.json');
const BACKUP_PATH = path.join(__dirname, '../db/products.backup.json');

/* ─── Setup: backup DB sebelum test, restore setelah ─── */
beforeAll(function() {
  fs.copyFileSync(DB_PATH, BACKUP_PATH);
});

afterAll(function() {
  fs.copyFileSync(BACKUP_PATH, DB_PATH);
  fs.unlinkSync(BACKUP_PATH);
});

/* ══════════════════════════════════════════
   HEALTH CHECK
   ══════════════════════════════════════════ */
describe('GET / — Health Check', function() {
  test('returns 200 and success true', async function() {
    var res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/running/i);
  });
});

/* ══════════════════════════════════════════
   GET /api/products
   ══════════════════════════════════════════ */
describe('GET /api/products', function() {
  test('returns array of products with meta', async function() {
    var res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
    expect(res.body.meta.total).toBeGreaterThan(0);
  });

  test('search by name returns filtered results', async function() {
    var res = await request(app).get('/api/products?search=Z90s');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].name).toMatch(/Z90s/i);
  });

  test('filter by category=wireless', async function() {
    var res = await request(app).get('/api/products?category=wireless');
    expect(res.statusCode).toBe(200);
    res.body.data.forEach(function(p) {
      expect(p.category).toBe('wireless');
    });
  });

  test('filter by price range', async function() {
    var res = await request(app).get('/api/products?minPrice=50&maxPrice=100');
    expect(res.statusCode).toBe(200);
    res.body.data.forEach(function(p) {
      expect(p.price).toBeGreaterThanOrEqual(50);
      expect(p.price).toBeLessThanOrEqual(100);
    });
  });

  test('pagination returns correct page size', async function() {
    var res = await request(app).get('/api/products?page=1&limit=2');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(2);
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.limit).toBe(2);
  });

  test('sort by price ascending', async function() {
    var res = await request(app).get('/api/products?sort=price&order=asc');
    expect(res.statusCode).toBe(200);
    var prices = res.body.data.map(function(p) { return p.price; });
    for (var i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
    }
  });
});

/* ══════════════════════════════════════════
   GET /api/products/:id
   ══════════════════════════════════════════ */
describe('GET /api/products/:id', function() {
  test('returns product detail for id=1', async function() {
    var res = await request(app).get('/api/products/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(1);
    expect(res.body.data.name).toBeDefined();
    expect(res.body.data.price).toBeDefined();
    expect(res.body.data.image).toBeDefined();
    expect(res.body.data.variants).toBeDefined();
    expect(res.body.data.description).toBeDefined();
  });

  test('returns 404 for non-existent id', async function() {
    var res = await request(app).get('/api/products/9999');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/tidak ditemukan/i);
  });
});

/* ══════════════════════════════════════════
   GET /api/products/:id/variants
   ══════════════════════════════════════════ */
describe('GET /api/products/:id/variants', function() {
  test('returns variants for id=1', async function() {
    var res = await request(app).get('/api/products/1/variants');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.colorOrSize).toBeDefined();
    expect(Array.isArray(res.body.data.colorOrSize)).toBe(true);
    expect(res.body.data.quantity).toBeDefined();
  });
});

/* ══════════════════════════════════════════
   POST /api/products
   ══════════════════════════════════════════ */
describe('POST /api/products', function() {
  var createdId;

  test('creates new product with all required fields', async function() {
    var res = await request(app)
      .post('/api/products')
      .send({
        name:        'Razor Test',
        price:       99.99,
        image:       'https://test.com/img.svg',
        description: 'Test product dari Jest',
        category:    'wireless',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.name).toBe('Razor Test');
    expect(res.body.data.price).toBe(99.99);
    createdId = res.body.data.id;
  });

  test('returns 400 when required fields are missing', async function() {
    var res = await request(app)
      .post('/api/products')
      .send({ name: 'Incomplete Product' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/wajib/i);
  });

  test('returns 400 for invalid price', async function() {
    var res = await request(app)
      .post('/api/products')
      .send({ name: 'Bad Price', price: -10, image: 'x.svg', description: 'x' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  /* Cleanup */
  afterAll(async function() {
    if (createdId) {
      await request(app).delete('/api/products/' + createdId);
    }
  });
});

/* ══════════════════════════════════════════
   PATCH /api/products/:id
   ══════════════════════════════════════════ */
describe('PATCH /api/products/:id', function() {
  test('updates price partially', async function() {
    var res = await request(app)
      .patch('/api/products/1')
      .send({ price: 119.99 });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.price).toBe(119.99);
  });

  test('returns 404 for non-existent id', async function() {
    var res = await request(app)
      .patch('/api/products/9999')
      .send({ price: 50 });
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

/* ══════════════════════════════════════════
   PUT /api/products/:id
   ══════════════════════════════════════════ */
describe('PUT /api/products/:id', function() {
  test('updates product fully', async function() {
    var res = await request(app)
      .put('/api/products/2')
      .send({
        name:        'Razor X50 Updated',
        price:       95.99,
        image:       'https://test.com/img.svg',
        description: 'Updated description',
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Razor X50 Updated');
    expect(res.body.data.price).toBe(95.99);
  });

  test('returns 400 when required fields missing', async function() {
    var res = await request(app)
      .put('/api/products/1')
      .send({ name: 'Only Name' });
    expect(res.statusCode).toBe(400);
  });
});

/* ══════════════════════════════════════════
   DELETE /api/products/:id
   ══════════════════════════════════════════ */
describe('DELETE /api/products/:id', function() {
  var tempId;

  beforeAll(async function() {
    var res = await request(app)
      .post('/api/products')
      .send({ name: 'Temp Delete', price: 1, image: 'x.svg', description: 'temp' });
    tempId = res.body.data.id;
  });

  test('deletes existing product', async function() {
    var res = await request(app).delete('/api/products/' + tempId);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/dihapus/i);
  });

  test('returns 404 after deletion', async function() {
    var res = await request(app).delete('/api/products/' + tempId);
    expect(res.statusCode).toBe(404);
  });
});

/* ══════════════════════════════════════════
   404 HANDLER
   ══════════════════════════════════════════ */
describe('404 Handler', function() {
  test('returns 404 for unknown endpoint', async function() {
    var res = await request(app).get('/api/unknown-endpoint');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
