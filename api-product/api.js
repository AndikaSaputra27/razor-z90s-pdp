/**
 * api.js — Razor Audio Frontend API Integration
 * Fetch data produk dari REST API dan populate halaman detail produk
 */

'use strict';

/* ── Konfigurasi API ── */
var API_BASE = 'http://localhost:3000';
var PRODUCT_ID = 1; // Razor Z90s

/* ── State dari API ── */
var apiProduct = null;

/**
 * Fetch detail produk dari API
 * @param {number} id
 * @returns {Promise<object>}
 */
function fetchProduct(id) {
  return fetch(API_BASE + '/api/products/' + id)
    .then(function(res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function(json) {
      if (!json.success) throw new Error(json.message);
      return json.data;
    });
}

/**
 * Populate halaman dengan data dari API
 * @param {object} product
 */
function populatePage(product) {
  apiProduct = product;

  /* ── Nama & Brand ── */
  var elBrand   = document.querySelector('.product-brand');
  var elName    = document.querySelector('.product-name');
  var elTagline = document.querySelector('.product-tagline');
  if (elBrand)   elBrand.textContent   = product.brand;
  if (elName)    elName.textContent    = product.name;
  if (elTagline) elTagline.textContent = product.tagline;

  /* ── Harga ── */
  var elPrice = document.getElementById('priceDisplay');
  if (elPrice) elPrice.textContent = '$' + product.price.toFixed(2);

  /* ── Gambar utama ── */
  var elImg = document.getElementById('mainProductImg');
  if (elImg) {
    elImg.src = product.image;
    elImg.alt = product.name;
  }

  /* ── Varian ── */
  populateVariants(product.variants.colorOrSize);

  /* ── Deskripsi (accordion) ── */
  var elDesc = document.querySelector('#acc-desc-panel .accordion-content');
  if (elDesc) {
    elDesc.innerHTML = '<p>' + product.description + '</p>';
  }

  /* ── Spesifikasi teknis (accordion table) ── */
  populateSpecs(product.specs);

  /* ── Fitur (accordion list) ── */
  populateFeatures(product.features);

  /* ── Title halaman ── */
  document.title = product.name + ' — ' + product.brand;

  /* ── Tandai halaman sudah di-populate dari API ── */
  document.documentElement.setAttribute('data-api-loaded', 'true');

  console.info('[API] Produk berhasil dimuat:', product.name);
}

/**
 * Populate varian warna dari API
 * @param {Array} variants
 */
function populateVariants(variants) {
  if (!variants || !variants.length) return;

  var container = document.querySelector('.variant-options');
  if (!container) return;

  container.innerHTML = '';

  variants.forEach(function(v, i) {
    var swatchClass = 'swatch-' + v.id.replace('matte-', '').replace('-aluminum', '');

    var label = document.createElement('label');
    label.className = 'variant-option' + (i === 0 ? ' active' : '');
    label.setAttribute('aria-label', v.label + ' - $' + v.price.toFixed(2));
    label.innerHTML =
      '<input type="radio" name="productVariant" value="' + v.id + '"' + (i === 0 ? ' checked' : '') + ' aria-label="' + v.label + ' $' + v.price.toFixed(2) + '" />' +
      '<span class="variant-swatch ' + swatchClass + '" aria-hidden="true"></span>' +
      '<span class="variant-option-name">' + v.label + '</span>' +
      '<span class="variant-option-price">$' + v.price.toFixed(2) + '</span>';

    // Simpan data image untuk swap
    label.dataset.image = v.image;
    label.dataset.price = v.price;

    container.appendChild(label);
  });

  // Update state produk dengan varian dari API
  if (window.PRODUCT && window.PRODUCT.variants) {
    window.PRODUCT.variants = variants.map(function(v) {
      return {
        id:     v.id,
        label:  v.label,
        price:  v.price,
        images: {
          front: v.image,
          side:  v.image.replace('front', 'side'),
        },
      };
    });
  }
}

/**
 * Populate tabel spesifikasi
 * @param {object} specs
 */
function populateSpecs(specs) {
  var tbody = document.querySelector('.specs-table tbody');
  if (!tbody || !specs) return;

  var rows = [
    ['Driver Size',         specs.driverSize],
    ['Frequency Response',  specs.frequencyResponse],
    ['Bluetooth Version',   specs.bluetoothVersion],
    ['Battery Life',        specs.batteryLife],
    ['Noise Cancellation',  specs.noiseCancellation],
    ['Weight',              specs.weight],
  ];

  tbody.innerHTML = '';
  rows.forEach(function(row) {
    var tr = document.createElement('tr');
    tr.innerHTML = '<td>' + row[0] + '</td><td>' + row[1] + '</td>';
    tbody.appendChild(tr);
  });
}

/**
 * Populate daftar fitur
 * @param {Array} features
 */
function populateFeatures(features) {
  var list = document.querySelector('.features-list');
  if (!list || !features || !features.length) return;

  var icons = [
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/></svg>',
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>',
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>',
  ];

  list.innerHTML = '';
  features.forEach(function(feature, i) {
    var parts = feature.split(' — ');
    var title = parts[0] || feature;
    var desc  = parts[1] || '';
    var li = document.createElement('li');
    li.innerHTML =
      '<div class="feature-icon-wrap" aria-hidden="true">' + (icons[i % icons.length]) + '</div>' +
      '<div><strong>' + title + '</strong>' + (desc ? '<p>' + desc + '</p>' : '') + '</div>';
    list.appendChild(li);
  });
}

/**
 * Tampilkan banner API status
 */
function showAPIBanner(success, message) {
  var existing = document.getElementById('apiBanner');
  if (existing) existing.remove();

  var banner = document.createElement('div');
  banner.id = 'apiBanner';
  banner.style.cssText =
    'position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;' +
    'padding:.75rem 1.25rem;border-radius:10px;font-size:.8125rem;font-weight:600;' +
    'display:flex;align-items:center;gap:.5rem;box-shadow:0 4px 16px rgba(0,0,0,.2);' +
    'transition:opacity .3s ease;' +
    (success
      ? 'background:#f0fdf4;color:#2a7a4b;border:1px solid #bbf7d0;'
      : 'background:#fff2f2;color:#904745;border:1px solid #fecaca;');
  banner.innerHTML = (success ? '🟢 ' : '🔴 ') + message;
  document.body.appendChild(banner);

  setTimeout(function() {
    banner.style.opacity = '0';
    setTimeout(function() { banner.remove(); }, 300);
  }, 4000);
}

/**
 * Init — jalankan saat DOM siap
 */
function initAPI() {
  showAPIBanner(false, 'Menghubungkan ke API...');

  fetchProduct(PRODUCT_ID)
    .then(function(product) {
      populatePage(product);
      showAPIBanner(true, 'Data dimuat dari API ✓');
    })
    .catch(function(err) {
      console.warn('[API] Gagal fetch, menggunakan data lokal:', err.message);
      showAPIBanner(false, 'API offline — menggunakan data lokal');
    });
}

/* Jalankan setelah DOM siap */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAPI);
} else {
  initAPI();
}
