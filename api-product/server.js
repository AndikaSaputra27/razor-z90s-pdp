'use strict';

const express = require('express');
const cors    = require('cors');

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── Middleware ── */
app.use(cors());
app.use(express.json());

/* ── Data Produk (hardcode sesuai exercise) ── */
const products = [
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
      driverSize:        '40mm Neodymium',
      frequencyResponse: '20Hz - 20kHz',
      bluetoothVersion:  'v5.3',
      batteryLife:       'Up to 50 Hours',
      noiseCancellation: 'Hybrid ANC',
      weight:            '250g',
    },
    features: [
      'Fast Charging — 15 menit pengisian menghasilkan 3 jam pemutaran',
      'Multipoint Connection — terhubung ke 2 perangkat sekaligus',
      'Spatial Audio — soundstage 3D yang imersif',
      'Hybrid ANC — reduksi kebisingan hingga 35dB',
    ],
    rating: 0,
    inStock: true,
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
        { id: 'matte-blue',  label: 'Matte Blue',  price: 89.99,  image: 'https://andikasaputra27.github.io/razor-z90s-pdp/img/matte-blue-front.svg' },
        { id: 'matte-black', label: 'Matte Black', price: 89.99,  image: 'https://andikasaputra27.github.io/razor-z90s-pdp/img/matte-black-front.svg' },
      ],
      quantity: 30,
    },
    description: 'On-Ear Wireless ringan untuk mobilitas tinggi. Bluetooth 5.3 dengan 35 jam baterai.',
    specs: {
      driverSize:        '32mm Dynamic',
      frequencyResponse: '20Hz - 20kHz',
      bluetoothVersion:  'v5.3',
      batteryLife:       'Up to 35 Hours',
      noiseCancellation: 'Passive',
      weight:            '180g',
    },
    features: [
      'Lightweight 180g design',
      'Foldable for travel',
      'Multipoint Connection',
      'USB-C Fast Charging',
    ],
    rating: 0,
    inStock: true,
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
      driverSize:        '50mm Titanium',
      frequencyResponse: '10Hz - 30kHz',
      bluetoothVersion:  'v5.3 + Wired',
      batteryLife:       'Up to 40 Hours',
      noiseCancellation: 'Hybrid ANC Pro',
      weight:            '290g',
    },
    features: [
      'Studio-grade 50mm Titanium driver',
      'Detachable cable (3.5mm + USB-C)',
      'Hi-Res Audio certified',
      'Professional mixing mode',
    ],
    rating: 0,
    inStock: true,
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
      driverSize:        '30mm Dynamic',
      frequencyResponse: '20Hz - 20kHz',
      bluetoothVersion:  'v5.2',
      batteryLife:       'Up to 25 Hours',
      noiseCancellation: 'Passive',
      weight:            '180g',
    },
    features: [
      'Ultra-lightweight 180g',
      'Foldable compact design',
      'Voice assistant support',
      'USB-C charging',
    ],
    rating: 0,
    inStock: true,
  },
];

/* ══════════════════════════════════════════
   ROUTES
   ══════════════════════════════════════════ */

/* Health check */
app.get('/', function(req, res) {
  res.json({
    status:  'ok',
    message: 'Razor Audio API is running',
    version: '1.0.0',
    endpoints: [
      'GET /api/products          — semua produk',
      'GET /api/products/:id      — detail produk',
      'GET /api/products/:id/variants — varian produk',
    ],
  });
});

/* GET /api/products — semua produk */
app.get('/api/products', function(req, res) {
  var result = products.map(function(p) {
    return {
      id:      p.id,
      name:    p.name,
      brand:   p.brand,
      price:   p.price,
      image:   p.image,
      inStock: p.inStock,
    };
  });
  res.json({
    success: true,
    count:   result.length,
    data:    result,
  });
});

/* GET /api/products/:id — detail produk */
app.get('/api/products/:id', function(req, res) {
  var id      = parseInt(req.params.id, 10);
  var product = products.find(function(p) { return p.id === id; });

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product tidak ditemukan. ID: ' + id,
    });
  }

  res.json({
    success: true,
    data:    product,
  });
});

/* GET /api/products/:id/variants — varian saja */
app.get('/api/products/:id/variants', function(req, res) {
  var id      = parseInt(req.params.id, 10);
  var product = products.find(function(p) { return p.id === id; });

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product tidak ditemukan.',
    });
  }

  res.json({
    success: true,
    data:    product.variants,
  });
});

/* 404 handler */
app.use(function(req, res) {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan: ' + req.method + ' ' + req.path,
  });
});

/* ── Start server ── */
app.listen(PORT, function() {
  console.log('');
  console.log('  Razor Audio API');
  console.log('  ───────────────────────────────');
  console.log('  Running  : http://localhost:' + PORT);
  console.log('  Products : http://localhost:' + PORT + '/api/products');
  console.log('  Detail   : http://localhost:' + PORT + '/api/products/1');
  console.log('  ───────────────────────────────');
  console.log('');
});

module.exports = app;
