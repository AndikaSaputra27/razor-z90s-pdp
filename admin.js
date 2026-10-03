'use strict';

/* =====================================================
   admin.js — Razor Audio Admin Panel
   Connects to local REST API: http://localhost:3000
   ===================================================== */

var API_BASE = 'http://localhost:3000';
var pendingDeleteId = null;

/* ─── DOM helpers ─── */
var $ = function(id) { return document.getElementById(id); };

/* ─── Fetch wrapper ─── */
function api(method, path, body) {
  var opts = {
    method: method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  return fetch(API_BASE + path, opts).then(function(r) { return r.json(); });
}

/* ─── Toast ─── */
var toastTimer;
function toast(msg, type) {
  var el = $('adminToast');
  clearTimeout(toastTimer);
  el.textContent = msg;
  el.className = 'admin-toast visible ' + (type || 'info');
  toastTimer = setTimeout(function() { el.classList.remove('visible'); }, 3000);
}

/* ─── Format price ─── */
function fmt(n) { return '$' + parseFloat(n).toFixed(2); }

/* =====================================================
   NAVIGATION
   ===================================================== */
function initNav() {
  document.querySelectorAll('.admin-nav-item').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var section = btn.dataset.section;
      navigateTo(section);
    });
  });
}

function navigateTo(section) {
  /* Update nav active */
  document.querySelectorAll('.admin-nav-item').forEach(function(b) {
    b.classList.toggle('active', b.dataset.section === section);
  });
  /* Update sections */
  document.querySelectorAll('.admin-section').forEach(function(s) {
    s.classList.toggle('active', s.id === 'section-' + section);
  });
  /* Load data for section */
  if (section === 'dashboard')   loadDashboard();
  if (section === 'products')    loadProducts();
  if (section === 'api-status')  loadAPIStatus();
  if (section === 'add-product') resetForm();
}

/* =====================================================
   API STATUS CHECK
   ===================================================== */
function checkAPIStatus() {
  var dot  = $('apiDot');
  var text = $('apiStatusText');
  fetch(API_BASE + '/')
    .then(function(r) { return r.json(); })
    .then(function(d) {
      if (d.success) {
        dot.className  = 'api-dot online';
        text.textContent = 'API Online';
      }
    })
    .catch(function() {
      dot.className  = 'api-dot offline';
      text.textContent = 'API Offline';
    });
}

function loadAPIStatus() {
  var container = $('apiStatusDetail');
  var endpoints = [
    { method: 'GET',    path: '/api/products',           desc: 'Semua produk' },
    { method: 'GET',    path: '/api/products/1',         desc: 'Detail produk' },
    { method: 'GET',    path: '/api/products/1/variants',desc: 'Varian produk' },
    { method: 'POST',   path: '/api/products',           desc: 'Tambah produk' },
    { method: 'PUT',    path: '/api/products/:id',       desc: 'Update penuh' },
    { method: 'PATCH',  path: '/api/products/:id',       desc: 'Update sebagian' },
    { method: 'DELETE', path: '/api/products/:id',       desc: 'Hapus produk' },
  ];

  /* Test GET endpoints */
  var tests = [
    fetch(API_BASE + '/').then(function(r) { return { path: '/',                  ok: r.ok, status: r.status }; }).catch(function() { return { path: '/', ok: false, status: 0 }; }),
    fetch(API_BASE + '/api/products').then(function(r) { return { path: '/api/products', ok: r.ok, status: r.status }; }).catch(function() { return { path: '/api/products', ok: false, status: 0 }; }),
    fetch(API_BASE + '/api/products/1').then(function(r) { return { path: '/api/products/1', ok: r.ok, status: r.status }; }).catch(function() { return { path: '/api/products/1', ok: false, status: 0 }; }),
  ];

  container.innerHTML = '<div class="admin-loading">Mengecek endpoint...</div>';

  Promise.all(tests).then(function(results) {
    var resultsMap = {};
    results.forEach(function(r) { resultsMap[r.path] = r; });

    var html = '<div class="api-status-grid">';
    endpoints.forEach(function(ep) {
      var testResult = resultsMap[ep.path];
      var statusHtml = '';
      if (testResult) {
        statusHtml = testResult.ok
          ? '<span class="api-endpoint-status" style="color:#2a7a4b">&#10003; ' + testResult.status + ' OK</span>'
          : '<span class="api-endpoint-status" style="color:#e74c3c">&#10007; Offline</span>';
      } else {
        statusHtml = '<span class="api-endpoint-status" style="color:#888">— Tidak ditest</span>';
      }
      html +=
        '<div class="api-endpoint-card">' +
          '<span class="api-endpoint-method method-' + ep.method.toLowerCase() + '">' + ep.method + '</span>' +
          '<span class="api-endpoint-path">' + ep.path + '</span>' +
          '<p style="font-size:.75rem;color:var(--color-muted);margin-top:.25rem">' + ep.desc + '</p>' +
          statusHtml +
        '</div>';
    });
    html += '</div>';
    container.innerHTML = html;
  });
}

/* =====================================================
   DASHBOARD
   ===================================================== */
function loadDashboard() {
  api('GET', '/api/products?limit=50')
    .then(function(res) {
      if (!res.success) { $('recentProducts').innerHTML = '<div class="admin-loading">Gagal memuat data.</div>'; return; }
      var all = res.data;

      /* Stats */
      $('statTotal').textContent    = res.meta.total;
      $('statInStock').textContent  = all.filter(function(p) { return p.inStock; }).length;
      var avg = all.reduce(function(s, p) { return s + p.price; }, 0) / (all.length || 1);
      $('statAvgPrice').textContent = fmt(avg);
      var top = all.reduce(function(best, p) { return p.rating > best ? p.rating : best; }, 0);
      $('statTopRating').textContent = top > 0 ? top + ' ★' : '—';

      /* Recent list */
      var html = '<div class="recent-list">';
      all.slice(0, 4).forEach(function(p) {
        html +=
          '<div class="recent-item">' +
            '<img src="' + p.image + '" alt="' + p.name + '" class="recent-img" />' +
            '<div><div class="recent-name">' + p.name + '</div><div class="recent-cat">' + p.category + '</div></div>' +
            '<span class="recent-price">' + fmt(p.price) + '</span>' +
          '</div>';
      });
      html += '</div>';
      $('recentProducts').innerHTML = html;
    })
    .catch(function() {
      $('recentProducts').innerHTML = '<div class="admin-loading" style="color:#e74c3c">API tidak dapat dihubungi. Pastikan server berjalan di port 3000.</div>';
    });
}

/* =====================================================
   PRODUCTS TABLE
   ===================================================== */
function loadProducts(search) {
  var url = '/api/products?limit=50';
  if (search) url += '&search=' + encodeURIComponent(search);
  $('productsTableBody').innerHTML = '<tr><td colspan="8" class="admin-loading">Memuat...</td></tr>';

  api('GET', url)
    .then(function(res) {
      if (!res.success || !res.data.length) {
        $('productsTableBody').innerHTML = '<tr><td colspan="8" class="admin-loading">Tidak ada produk ditemukan.</td></tr>';
        return;
      }
      var html = '';
      res.data.forEach(function(p) {
        html +=
          '<tr>' +
            '<td>#' + p.id + '</td>' +
            '<td><img src="' + p.image + '" alt="' + p.name + '" class="table-img" /></td>' +
            '<td><div class="table-name">' + p.name + '</div><div class="table-brand">' + (p.brand || 'Razor Audio') + '</div></td>' +
            '<td><span class="badge badge-blue">' + (p.category || 'wireless') + '</span></td>' +
            '<td class="table-price">' + fmt(p.price) + '</td>' +
            '<td><span class="badge ' + (p.inStock ? 'badge-green' : 'badge-red') + '">' + (p.inStock ? 'In Stock' : 'Out') + '</span></td>' +
            '<td>' + (p.rating || 0) + ' ★</td>' +
            '<td>' +
              '<div class="table-actions">' +
                '<button class="btn-table-edit" data-id="' + p.id + '" title="Edit">' +
                  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>' +
                '</button>' +
                '<button class="btn-table-delete" data-id="' + p.id + '" data-name="' + p.name + '" title="Hapus">' +
                  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>' +
                '</button>' +
              '</div>' +
            '</td>' +
          '</tr>';
      });
      $('productsTableBody').innerHTML = html;
      bindTableActions();
    })
    .catch(function() {
      $('productsTableBody').innerHTML = '<tr><td colspan="8" class="admin-loading" style="color:#e74c3c">API tidak dapat dihubungi.</td></tr>';
    });
}

function bindTableActions() {
  document.querySelectorAll('.btn-table-edit').forEach(function(btn) {
    btn.addEventListener('click', function() { editProduct(parseInt(btn.dataset.id, 10)); });
  });
  document.querySelectorAll('.btn-table-delete').forEach(function(btn) {
    btn.addEventListener('click', function() { showDeleteModal(parseInt(btn.dataset.id, 10), btn.dataset.name); });
  });
}

/* =====================================================
   ADD / EDIT PRODUCT FORM
   ===================================================== */
function resetForm() {
  $('editProductId').value = '';
  $('formSectionTitle').textContent = 'Tambah Produk';
  $('btnSubmitForm').textContent = 'Simpan Produk';
  $('productForm').reset();
  $('fBrand').value = 'Razor Audio';
  $('fInStock').checked = true;
  $('formResult').textContent = '';
  $('formResult').className = 'form-result';
}

function editProduct(id) {
  api('GET', '/api/products/' + id).then(function(res) {
    if (!res.success) { toast('Gagal memuat produk.', 'error'); return; }
    var p = res.data;
    $('editProductId').value = p.id;
    $('formSectionTitle').textContent = 'Edit Produk — ' + p.name;
    $('btnSubmitForm').textContent = 'Update Produk';
    $('fName').value      = p.name || '';
    $('fBrand').value     = p.brand || 'Razor Audio';
    $('fPrice').value     = p.price || '';
    $('fCategory').value  = p.category || 'wireless';
    $('fImage').value     = p.image || '';
    $('fTagline').value   = p.tagline || '';
    $('fDesc').value      = p.description || '';
    $('fQuantity').value  = (p.variants && p.variants.quantity) ? p.variants.quantity : 0;
    $('fInStock').checked = p.inStock !== false;
    if (p.specs) {
      $('fDriver').value    = p.specs.driverSize || '';
      $('fFreq').value      = p.specs.frequencyResponse || '';
      $('fBluetooth').value = p.specs.bluetoothVersion || '';
      $('fBattery').value   = p.specs.batteryLife || '';
      $('fANC').value       = p.specs.noiseCancellation || '';
      $('fWeight').value    = p.specs.weight || '';
    }
    navigateTo('add-product');
  });
}

function validateForm() {
  var ok = true;
  var fields = [
    { id: 'fName',  err: 'errFName',  msg: 'Nama produk wajib diisi.' },
    { id: 'fPrice', err: 'errFPrice', msg: 'Harga wajib diisi dan harus angka positif.' },
    { id: 'fImage', err: 'errFImage', msg: 'URL gambar wajib diisi.' },
    { id: 'fDesc',  err: 'errFDesc',  msg: 'Deskripsi wajib diisi.' },
  ];
  fields.forEach(function(f) {
    var el  = $(f.id);
    var err = $(f.err);
    var val = el.value.trim();
    var invalid = !val || (f.id === 'fPrice' && (isNaN(parseFloat(val)) || parseFloat(val) < 0));
    err.textContent = invalid ? f.msg : '';
    el.style.borderColor = invalid ? '#e74c3c' : '';
    if (invalid) ok = false;
  });
  return ok;
}

function submitForm(e) {
  e.preventDefault();
  if (!validateForm()) return;

  var id = $('editProductId').value;
  var body = {
    name:        $('fName').value.trim(),
    brand:       $('fBrand').value.trim() || 'Razor Audio',
    tagline:     $('fTagline').value.trim(),
    price:       parseFloat($('fPrice').value),
    image:       $('fImage').value.trim(),
    category:    $('fCategory').value,
    description: $('fDesc').value.trim(),
    inStock:     $('fInStock').checked,
    variants: {
      colorOrSize: [],
      quantity:    parseInt($('fQuantity').value, 10) || 0,
    },
    specs: {
      driverSize:        $('fDriver').value.trim(),
      frequencyResponse: $('fFreq').value.trim(),
      bluetoothVersion:  $('fBluetooth').value.trim(),
      batteryLife:       $('fBattery').value.trim(),
      noiseCancellation: $('fANC').value.trim(),
      weight:            $('fWeight').value.trim(),
    },
  };

  var method = id ? 'PUT' : 'POST';
  var path   = id ? '/api/products/' + id : '/api/products';
  var btn    = $('btnSubmitForm');
  btn.disabled = true;
  btn.textContent = 'Menyimpan...';

  api(method, path, body)
    .then(function(res) {
      btn.disabled = false;
      btn.textContent = id ? 'Update Produk' : 'Simpan Produk';
      var result = $('formResult');
      if (res.success) {
        result.textContent = id ? 'Produk berhasil diupdate!' : 'Produk berhasil ditambahkan!';
        result.className = 'form-result success';
        toast(result.textContent, 'success');
        if (!id) resetForm();
        setTimeout(function() { navigateTo('products'); }, 1200);
      } else {
        result.textContent = res.message || 'Gagal menyimpan produk.';
        result.className = 'form-result error';
      }
    })
    .catch(function() {
      btn.disabled = false;
      btn.textContent = id ? 'Update Produk' : 'Simpan Produk';
      $('formResult').textContent = 'API tidak dapat dihubungi.';
      $('formResult').className = 'form-result error';
    });
}

/* =====================================================
   DELETE
   ===================================================== */
function showDeleteModal(id, name) {
  pendingDeleteId = id;
  $('deleteProductName').textContent = name;
  $('deleteModal').classList.remove('hidden');
}

function hideDeleteModal() {
  pendingDeleteId = null;
  $('deleteModal').classList.add('hidden');
}

function confirmDelete() {
  if (!pendingDeleteId) return;
  var id = pendingDeleteId;
  hideDeleteModal();
  api('DELETE', '/api/products/' + id)
    .then(function(res) {
      if (res.success) {
        toast('Produk berhasil dihapus.', 'success');
        loadProducts();
      } else {
        toast(res.message || 'Gagal menghapus produk.', 'error');
      }
    })
    .catch(function() { toast('API tidak dapat dihubungi.', 'error'); });
}

/* =====================================================
   INIT
   ===================================================== */
function init() {
  initNav();
  checkAPIStatus();
  loadDashboard();

  /* Refresh dashboard */
  var btnRefresh = $('btnRefreshDash');
  if (btnRefresh) btnRefresh.addEventListener('click', loadDashboard);

  /* API status check */
  var btnCheck = $('btnCheckAPI');
  if (btnCheck) btnCheck.addEventListener('click', function() { checkAPIStatus(); loadAPIStatus(); });

  /* Go to add product from table */
  var btnAdd = $('btnGoAddProduct');
  if (btnAdd) btnAdd.addEventListener('click', function() { resetForm(); navigateTo('add-product'); });

  /* Form submit */
  var form = $('productForm');
  if (form) form.addEventListener('submit', submitForm);

  /* Cancel form */
  var btnCancel = $('btnCancelForm');
  if (btnCancel) btnCancel.addEventListener('click', function() { navigateTo('products'); });

  /* Delete modal */
  $('btnConfirmDelete').addEventListener('click', confirmDelete);
  $('btnCancelDelete').addEventListener('click', hideDeleteModal);
  $('deleteModal').addEventListener('click', function(e) {
    if (e.target === $('deleteModal')) hideDeleteModal();
  });

  /* Search */
  var searchInput = $('adminSearch');
  var searchTimer;
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function() { loadProducts(searchInput.value); }, 300);
    });
  }

  /* Escape closes modal */
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') hideDeleteModal();
  });

  /* Auto-refresh API indicator every 30s */
  setInterval(checkAPIStatus, 30000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
