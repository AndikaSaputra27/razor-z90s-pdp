'use strict';

require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const config  = require('./config');

const app = express();

/* ══════════════════════════════════════════
   DATA PRODUK (hardcode sesuai exercise)
   ══════════════════════════════════════════ */
var products = [
  {
    id: 1,
    name: 'Razor Z90s',
    brand: 'Razor Audio',
    tagline: 'Over-Ear Wireless ANC Headphones with Spatial Sound',
    price: 129.99,
    image: 'https://andikasaputra27.github.io/razor-z90s-pdp/img/matte-black-front.svg',
    variants: {
      colorOrSize: [
        { id: 'matte-black',     label: 'Matte Black',     price: 129.99, image: 'https://andikasaputra27.github.io/razor-z90s-pdp/img/matte-black-front.svg' },
        { id: 'silver-aluminum', label: 'Silver Aluminum', price: 159.99, image: 'https://andikasaputra27.github.io/razor-z90s-pdp/img/silver-aluminum-front.svg' },
        { id: 'matte-blue',      label: 'Matte Blue',      price: 149.99, image: 'https://andikasaputra27.github.io/razor-z90s-pdp/img/matte-blue-front.svg' },
      ],
      quantity: 50,
    },
    description: 'Razor Z90s hadir dengan desain ergonomis yang mengutamakan kenyamanan pemakaian jangka panjang. Earcup berbantal memory foam melapisi telinga secara menyeluruh, meminimalkan kebocoran suara.',
    specs: {
      driverSize: '40mm Neodymium', frequencyResponse: '20Hz - 20kHz',
      bluetoothVersion: 'v5.3', batteryLife: 'Up to 50 Hours',
      noiseCancellation: 'Hybrid ANC', weight: '250g',
    },
    features: [
      'Fast Charging — 15 menit pengisian menghasilkan 3 jam pemutaran',
      'Multipoint Connection — terhubung ke 2 perangkat sekaligus',
      'Spatial Audio — soundstage 3D yang imersif',
      'Hybrid ANC — reduksi kebisingan hingga 35dB',
    ],
    category: 'wireless',
    rating: 4.8,
    reviewCount: 128,
    inStock: true,
    createdAt: new Date('2026-01-01').toISOString(),
  },
  {
    id: 2,
    name: 'Razor X50',
    brand: 'Razor Audio',
    tagline: 'On-Ear Wireless for Everyday Mobility',
    price: 89.99,
    image: 'https://andikasaputra27.github.io/razor-z90s-pdp/img/matte-blue-front.svg',
    variants: {
      colorOrSize: [
        { id: 'matte-blue',  label: 'Matte Blue',  price: 89.99, image: 'https://andikasaputra27.github.io/razor-z90s-pdp/img/matte-blue-front.svg' },
        { id: 'matte-black', label: 'Matte Black', price: 89.99, image: 'https://andikasaputra27.github.io/razor-z90s-pdp/img/matte-black-front.svg' },
      ],
      quantity: 30,
    },
    description: 'On-Ear Wireless ringan untuk mobilitas tinggi. Bluetooth 5.3 dengan 35 jam baterai.',
    specs: {
      driverSize: '32mm Dynamic', frequencyResponse: '20Hz - 20kHz',
      bluetoothVersion: 'v5.3', batteryLife: 'Up to 35 Hours',
      noiseCancellation: 'Passive', weight: '180g',
    },
    features: ['Lightweight 180g design', 'Foldable for travel', 'Multipoint Connection', 'USB-C Fast Charging'],
    category: 'wireless',
    rating: 4.5,
    reviewCount: 64,
    inStock: true,
    createdAt: new Date('2026-02-01').toISOString(),
  },
  {
    id: 3,
    name: 'Razor Pro S',
    brand: 'Razor Audio',
    tagline: 'Studio-Grade Over-Ear Headphones',
    price: 219.99,
    image: 'https://andikasaputra27.github.io/razor-z90s-pdp/img/silver-aluminum-front.svg',
    variants: {
      colorOrSize: [
        { id: 'silver-aluminum', label: 'Silver Aluminum', price: 219.99, image: 'https://andikasaputra27.github.io/razor-z90s-pdp/img/silver-aluminum-front.svg' },
      ],
      quantity: 20,
    },
    description: 'Studio-grade Over-Ear dengan driver 50mm Titanium. Respons frekuensi 10Hz-30kHz untuk monitoring profesional.',
    specs: {
      driverSize: '50mm Titanium', frequencyResponse: '10Hz - 30kHz',
      bluetoothVersion: 'v5.3 + Wired', batteryLife: 'Up to 40 Hours',
      noiseCancellation: 'Hybrid ANC Pro', weight: '290g',
    },
    features: ['Studio-grade 50mm Titanium driver', 'Detachable cable (3.5mm + USB-C)', 'Hi-Res Audio certified', 'Professional mixing mode'],
    category: 'wired',
    rating: 4.9,
    reviewCount: 42,
    inStock: true,
    createdAt: new Date('2026-03-01').toISOString(),
  },
  {
    id: 4,
    name: 'Razor Lite',
    brand: 'Razor Audio',
    tagline: 'Lightweight Wireless for Travelers',
    price: 59.99,
    image: 'https://andikasaputra27.github.io/razor-z90s-pdp/img/matte-black-side.svg',
    variants: {
      colorOrSize: [
        { id: 'matte-black',     label: 'Matte Black',     price: 59.99, image: 'https://andikasaputra27.github.io/razor-z90s-pdp/img/matte-black-side.svg' },
        { id: 'matte-blue',      label: 'Matte Blue',      price: 59.99, image: 'https://andikasaputra27.github.io/razor-z90s-pdp/img/matte-blue-side.svg' },
        { id: 'silver-aluminum', label: 'Silver Aluminum', price: 59.99, image: 'https://andikasaputra27.github.io/razor-z90s-pdp/img/silver-aluminum-side.svg' },
      ],
      quantity: 100,
    },
    description: 'Wireless ringan 180g untuk pemakaian santai. Lipat praktis, cocok untuk traveler dan komuter harian.',
    specs: {
      driverSize: '30mm Dynamic', frequencyResponse: '20Hz - 20kHz',
      bluetoothVersion: 'v5.2', batteryLife: 'Up to 25 Hours',
      noiseCancellation: 'Passive', weight: '180g',
    },
    features: ['Ultra-lightweight 180g', 'Foldable compact design', 'Voice assistant support', 'USB-C charging'],
    category: 'wireless',
    rating: 4.2,
    reviewCount: 89,
    inStock: true,
    createdAt: new Date('2026-04-01').toISOString(),
  },
];

var nextId = 5; // auto-increment ID untuk POST

/* ══════════════════════════════════════════
   MIDDLEWARE
   ══════════════════════════════════════════ */

/* CORS */
app.use(cors({ origin: config.allowedOrigin }));

/* JSON parser */
app.use(express.json());

/* Request logger */
app.use(function(req, res, next) {
  var now = new Date().toISOString();
  console.log('[' + now + '] ' + req.method + ' ' + req.path);
  next();
});

/* Response time header */
app.use(function(req, res, next) {
  var start = Date.now();
  res.on('finish', function() {
    console.log('  -> ' + res.statusCode + ' (' + (Date.now() - start) + 'ms)');
  });
  next();
});

/* ══════════════════════════════════════════
   HELPER
   ══════════════════════════════════════════ */
function findProduct(id) {
  return products.find(function(p) { return p.id === parseInt(id, 10); });
}

function findIndex(id) {
  return products.findIndex(function(p) { return p.id === parseInt(id, 10); });
}

function successResponse(res, data, statusCode, meta) {
  var body = { success: true, data: data };
  if (meta) body.meta = meta;
  return res.status(statusCode || 200).json(body);
}

function errorResponse(res, statusCode, message) {
  return res.status(statusCode).json({ success: false, message: message });
}

/* ══════════════════════════════════════════
   ROUTES
   ══════════════════════════════════════════ */

/* ── Health check ── */
app.get('/', function(req, res) {
  res.json({
    success:  true,
    message:  'Razor Audio API is running',
    version:  config.apiVersion,
    env:      config.nodeEnv,
    endpoints: [
      'GET    /api/products                — semua produk (support ?search, ?category, ?page, ?limit, ?sort)',
      'GET    /api/products/:id            — detail produk',
      'GET    /api/products/:id/variants   — varian produk',
      'POST   /api/products                — tambah produk baru',
      'PUT    /api/products/:id            — update produk',
      'PATCH  /api/products/:id            — update sebagian produk',
      'DELETE /api/products/:id            — hapus produk',
    ],
  });
});

/* ── GET /api/products — semua produk + search + filter + pagination + sort ── */
app.get('/api/products', function(req, res) {
  var result = products.slice(); // copy

  /* Search by name */
  if (req.query.search) {
    var keyword = req.query.search.toLowerCase();
    result = result.filter(function(p) {
      return p.name.toLowerCase().indexOf(keyword) !== -1 ||
             p.description.toLowerCase().indexOf(keyword) !== -1;
    });
  }

  /* Filter by category */
  if (req.query.category) {
    result = result.filter(function(p) {
      return p.category === req.query.category;
    });
  }

  /* Filter by inStock */
  if (req.query.inStock !== undefined) {
    var inStock = req.query.inStock === 'true';
    result = result.filter(function(p) { return p.inStock === inStock; });
  }

  /* Filter by price range */
  if (req.query.minPrice) {
    result = result.filter(function(p) { return p.price >= parseFloat(req.query.minPrice); });
  }
  if (req.query.maxPrice) {
    result = result.filter(function(p) { return p.price <= parseFloat(req.query.maxPrice); });
  }

  /* Sort */
  var sortBy    = req.query.sort    || 'id';
  var sortOrder = req.query.order   || 'asc';
  result.sort(function(a, b) {
    var valA = a[sortBy];
    var valB = b[sortBy];
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1  : -1;
    return 0;
  });

  /* Pagination */
  var page     = Math.max(1, parseInt(req.query.page,  10) || 1);
  var limit    = Math.min(50, parseInt(req.query.limit, 10) || 10);
  var total    = result.length;
  var totalPages = Math.ceil(total / limit);
  var offset   = (page - 1) * limit;
  var paginated = result.slice(offset, offset + limit);

  /* Slim response (tanpa specs & features untuk list) */
  var slim = paginated.map(function(p) {
    return {
      id:          p.id,
      name:        p.name,
      brand:       p.brand,
      price:       p.price,
      image:       p.image,
      category:    p.category,
      rating:      p.rating,
      reviewCount: p.reviewCount,
      inStock:     p.inStock,
    };
  });

  successResponse(res, slim, 200, {
    total:      total,
    page:       page,
    limit:      limit,
    totalPages: totalPages,
    hasNext:    page < totalPages,
    hasPrev:    page > 1,
  });
});

/* ── GET /api/products/:id — detail produk ── */
app.get('/api/products/:id', function(req, res) {
  var product = findProduct(req.params.id);
  if (!product) return errorResponse(res, 404, 'Product tidak ditemukan. ID: ' + req.params.id);
  successResponse(res, product);
});

/* ── GET /api/products/:id/variants — varian saja ── */
app.get('/api/products/:id/variants', function(req, res) {
  var product = findProduct(req.params.id);
  if (!product) return errorResponse(res, 404, 'Product tidak ditemukan.');
  successResponse(res, product.variants);
});

/* ── POST /api/products — tambah produk baru ── */
app.post('/api/products', function(req, res) {
  var body = req.body;

  /* Validasi field wajib */
  var required = ['name', 'price', 'image', 'description'];
  var missing  = required.filter(function(f) { return !body[f]; });
  if (missing.length) {
    return errorResponse(res, 400, 'Field wajib tidak lengkap: ' + missing.join(', '));
  }

  if (isNaN(parseFloat(body.price)) || parseFloat(body.price) < 0) {
    return errorResponse(res, 400, 'Price harus berupa angka positif.');
  }

  var newProduct = {
    id:          nextId++,
    name:        body.name,
    brand:       body.brand        || 'Razor Audio',
    tagline:     body.tagline      || '',
    price:       parseFloat(body.price),
    image:       body.image,
    variants:    body.variants     || { colorOrSize: [], quantity: 0 },
    description: body.description,
    specs:       body.specs        || {},
    features:    body.features     || [],
    category:    body.category     || 'wireless',
    rating:      0,
    reviewCount: 0,
    inStock:     body.inStock !== undefined ? body.inStock : true,
    createdAt:   new Date().toISOString(),
  };

  products.push(newProduct);
  res.status(201).json({ success: true, message: 'Produk berhasil ditambahkan.', data: newProduct });
});

/* ── PUT /api/products/:id — update seluruh produk ── */
app.put('/api/products/:id', function(req, res) {
  var idx = findIndex(req.params.id);
  if (idx === -1) return errorResponse(res, 404, 'Product tidak ditemukan.');

  var body     = req.body;
  var required = ['name', 'price', 'image', 'description'];
  var missing  = required.filter(function(f) { return !body[f]; });
  if (missing.length) return errorResponse(res, 400, 'Field wajib tidak lengkap: ' + missing.join(', '));

  products[idx] = {
    id:          products[idx].id,
    name:        body.name,
    brand:       body.brand        || products[idx].brand,
    tagline:     body.tagline      || products[idx].tagline,
    price:       parseFloat(body.price),
    image:       body.image,
    variants:    body.variants     || products[idx].variants,
    description: body.description,
    specs:       body.specs        || products[idx].specs,
    features:    body.features     || products[idx].features,
    category:    body.category     || products[idx].category,
    rating:      products[idx].rating,
    reviewCount: products[idx].reviewCount,
    inStock:     body.inStock !== undefined ? body.inStock : products[idx].inStock,
    createdAt:   products[idx].createdAt,
    updatedAt:   new Date().toISOString(),
  };

  successResponse(res, products[idx]);
});

/* ── PATCH /api/products/:id — update sebagian produk ── */
app.patch('/api/products/:id', function(req, res) {
  var idx = findIndex(req.params.id);
  if (idx === -1) return errorResponse(res, 404, 'Product tidak ditemukan.');

  var allowed = ['name','brand','tagline','price','image','variants','description','specs','features','category','inStock'];
  var body    = req.body;

  allowed.forEach(function(key) {
    if (body[key] !== undefined) {
      products[idx][key] = key === 'price' ? parseFloat(body[key]) : body[key];
    }
  });
  products[idx].updatedAt = new Date().toISOString();

  successResponse(res, products[idx]);
});

/* ── DELETE /api/products/:id — hapus produk ── */
app.delete('/api/products/:id', function(req, res) {
  var idx = findIndex(req.params.id);
  if (idx === -1) return errorResponse(res, 404, 'Product tidak ditemukan.');

  var deleted = products.splice(idx, 1)[0];
  res.json({ success: true, message: 'Produk berhasil dihapus.', data: { id: deleted.id, name: deleted.name } });
});

/* ── 404 handler ── */
app.use(function(req, res) {
  errorResponse(res, 404, 'Endpoint tidak ditemukan: ' + req.method + ' ' + req.path);
});

/* ── Global error handler ── */
app.use(function(err, req, res, next) {
  console.error('[ERROR]', err.message);
  errorResponse(res, 500, 'Internal server error: ' + err.message);
});

/* ══════════════════════════════════════════
   START SERVER
   ══════════════════════════════════════════ */
app.listen(config.port, function() {
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║       Razor Audio REST API           ║');
  console.log('  ╠══════════════════════════════════════╣');
  console.log('  ║  URL  : http://localhost:' + config.port + '          ║');
  console.log('  ║  ENV  : ' + config.nodeEnv + '                    ║');
  console.log('  ╠══════════════════════════════════════╣');
  console.log('  ║  GET    /api/products                ║');
  console.log('  ║  GET    /api/products/:id            ║');
  console.log('  ║  GET    /api/products/:id/variants   ║');
  console.log('  ║  POST   /api/products                ║');
  console.log('  ║  PUT    /api/products/:id            ║');
  console.log('  ║  PATCH  /api/products/:id            ║');
  console.log('  ║  DELETE /api/products/:id            ║');
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');
});

module.exports = app;
