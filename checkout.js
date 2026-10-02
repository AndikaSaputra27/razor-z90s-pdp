/**
 * checkout.js — Razor Audio Checkout Page
 */
'use strict';

var COUPONS = { 'RAZOR10': 10, 'AUDIO20': 20, 'SAVE15': 15 };
var appliedDiscount = 0;
var shippingCost    = 5.00;

/* ── Order Summary ── */
function renderOrderSummary() {
  var cart  = getCart();
  var list  = document.getElementById('orderItems');
  if (!list) return;

  // Default item if cart empty
  if (!cart.length) {
    cart = [{ name: 'Razor Z90s', variant: 'Matte Black', price: 129.99, qty: 1, image: 'img/matte-black-front.svg' }];
  }

  list.innerHTML = '';
  var subtotal = 0;

  cart.forEach(function(item) {
    subtotal += item.price * item.qty;
    var li = document.createElement('li');
    li.className = 'order-item';
    li.innerHTML =
      '<img src="' + item.image + '" alt="' + item.name + '" class="order-item-img" />' +
      '<div class="order-item-info">' +
        '<span class="order-item-name">' + item.name + '</span>' +
        '<span class="order-item-variant">' + item.variant + ' &times; ' + item.qty + '</span>' +
      '</div>' +
      '<span class="order-item-price">$' + (item.price * item.qty).toFixed(2) + '</span>';
    list.appendChild(li);
  });

  updateTotals(subtotal);
}

function updateTotals(subtotal) {
  var discount = subtotal * (appliedDiscount / 100);
  var total    = subtotal + shippingCost - discount;

  var elSub  = document.getElementById('summSubtotal');
  var elShip = document.getElementById('summShipping');
  var elDisc = document.getElementById('summDiscount');
  var elTot  = document.getElementById('summTotal');
  var discRow = document.getElementById('discountRow');

  if (elSub)  elSub.textContent  = '$' + subtotal.toFixed(2);
  if (elShip) elShip.textContent = '$' + shippingCost.toFixed(2);
  if (elTot)  elTot.textContent  = '$' + Math.max(0, total).toFixed(2);

  if (appliedDiscount > 0 && discRow && elDisc) {
    discRow.classList.remove('hidden');
    elDisc.textContent = '-$' + discount.toFixed(2);
  } else if (discRow) {
    discRow.classList.add('hidden');
  }
}

/* ── Shipping cost update ── */
function initShippingOptions() {
  var costs = { regular: 5.00, express: 12.00, 'same-day': 18.00 };
  document.querySelectorAll('input[name="shipping"]').forEach(function(radio) {
    radio.addEventListener('change', function() {
      shippingCost = costs[radio.value] || 5.00;
      var cart = getCart();
      var subtotal = cart.length
        ? cart.reduce(function(s,i){ return s + i.price * i.qty; }, 0)
        : 129.99;
      updateTotals(subtotal);
    });
  });
}

/* ── Payment method toggle ── */
function initPaymentToggle() {
  var ccForm     = document.getElementById('ccForm');
  var btForm     = document.getElementById('btForm');
  var walletForm = document.getElementById('walletForm');

  document.querySelectorAll('input[name="payment"]').forEach(function(radio) {
    radio.addEventListener('change', function() {
      document.querySelectorAll('.payment-option').forEach(function(opt) { opt.classList.remove('active'); });
      radio.closest('.payment-option').classList.add('active');

      if (ccForm)     ccForm.classList.toggle('hidden',     radio.value !== 'cc');
      if (btForm)     btForm.classList.toggle('hidden',     radio.value !== 'bt');
      if (walletForm) walletForm.classList.toggle('hidden', radio.value !== 'wallet');
    });
  });
}

/* ── Card number formatting ── */
function initCardFormatting() {
  var cardNum = document.getElementById('cardNumber');
  var cardExp = document.getElementById('cardExpiry');
  if (cardNum) {
    cardNum.addEventListener('input', function() {
      var v = cardNum.value.replace(/\D/g, '').substring(0, 16);
      cardNum.value = v.replace(/(.{4})/g, '$1 ').trim();
    });
  }
  if (cardExp) {
    cardExp.addEventListener('input', function() {
      var v = cardExp.value.replace(/\D/g, '').substring(0, 4);
      if (v.length >= 3) v = v.substring(0,2) + ' / ' + v.substring(2);
      cardExp.value = v;
    });
  }
}

/* ── Coupon ── */
function initCoupon() {
  var btn = document.getElementById('btnApplyCoupon');
  var msg = document.getElementById('couponMsg');
  if (!btn) return;
  btn.addEventListener('click', function() {
    var code = (document.getElementById('couponInput').value || '').trim().toUpperCase();
    if (COUPONS[code] !== undefined) {
      appliedDiscount = COUPONS[code];
      if (msg) { msg.textContent = 'Kupon berhasil! Diskon ' + appliedDiscount + '% diterapkan.'; msg.className = 'coupon-msg success'; }
      var cart = getCart();
      var subtotal = cart.length ? cart.reduce(function(s,i){ return s + i.price * i.qty; }, 0) : 129.99;
      updateTotals(subtotal);
    } else {
      appliedDiscount = 0;
      if (msg) { msg.textContent = 'Kode kupon tidak valid.'; msg.className = 'coupon-msg error'; }
    }
  });
}

/* ── Validation ── */
function validateForm() {
  var ok = true;
  var fields = [
    { id: 'firstName', err: 'errFirstName', msg: 'Nama depan wajib diisi.' },
    { id: 'lastName',  err: 'errLastName',  msg: 'Nama belakang wajib diisi.' },
    { id: 'email',     err: 'errEmail',     msg: 'Email tidak valid.', type: 'email' },
    { id: 'phone',     err: 'errPhone',     msg: 'Nomor telepon wajib diisi.' },
    { id: 'address',   err: 'errAddress',   msg: 'Alamat wajib diisi.' },
    { id: 'city',      err: 'errCity',      msg: 'Kota wajib diisi.' },
    { id: 'postalCode',err: 'errPostalCode',msg: 'Kode pos tidak valid.', type: 'postal' },
  ];

  fields.forEach(function(f) {
    var el  = document.getElementById(f.id);
    var err = document.getElementById(f.err);
    if (!el || !err) return;
    var val = el.value.trim();
    var invalid = false;
    if (!val) { invalid = true; }
    else if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) { invalid = true; }
    else if (f.type === 'postal' && !/^\d{5}$/.test(val)) { invalid = true; }

    if (invalid) {
      err.textContent = f.msg;
      el.classList.add('is-invalid');
      ok = false;
    } else {
      err.textContent = '';
      el.classList.remove('is-invalid');
    }
  });

  // Province
  var prov = document.getElementById('province');
  var provErr = document.getElementById('errProvince');
  if (prov && provErr) {
    if (!prov.value) { provErr.textContent = 'Pilih provinsi.'; prov.classList.add('is-invalid'); ok = false; }
    else { provErr.textContent = ''; prov.classList.remove('is-invalid'); }
  }

  return ok;
}

/* ── Progress Steps ── */
function updateSteps(active) {
  document.querySelectorAll('.step').forEach(function(s) {
    var n = parseInt(s.dataset.step, 10);
    s.classList.toggle('active',    n === active);
    s.classList.toggle('completed', n < active);
  });
}

/* ── Place Order ── */
function initPlaceOrder() {
  var btn = document.getElementById('btnPlaceOrder');
  if (!btn) return;
  btn.addEventListener('click', function() {
    updateSteps(3);
    if (!validateForm()) {
      // Scroll to first error
      var first = document.querySelector('.is-invalid');
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      updateSteps(1);
      return;
    }

    updateSteps(4);

    // Loading state
    btn.disabled = true;
    var txt = document.getElementById('placeOrderText');
    if (txt) txt.textContent = 'Memproses...';

    setTimeout(function() {
      // Generate order ID
      var orderId = '#RZR-' + Math.floor(100000 + Math.random() * 900000);
      var el = document.getElementById('successOrderId');
      if (el) el.textContent = orderId;

      // Clear cart
      localStorage.removeItem('razor-cart');

      // Show success modal
      var overlay = document.getElementById('successOverlay');
      if (overlay) {
        overlay.classList.remove('hidden');
        overlay.classList.add('visible');
        overlay.querySelector('.success-modal').classList.add('pop-in');
      }
    }, 1800);
  });
}

/* ── Scroll reveal for steps ── */
function initStepReveal() {
  var sections = document.querySelectorAll('.checkout-section');
  if (!('IntersectionObserver' in window)) {
    sections.forEach(function(s) { s.classList.add('revealed'); }); return;
  }
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        var n = e.target.id === 'stepInfo' ? 1 : e.target.id === 'stepShipping' ? 2 : 3;
        updateSteps(n);
      }
    });
  }, { threshold: 0.3 });
  sections.forEach(function(s) { obs.observe(s); });
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', function() {
  renderOrderSummary();
  initShippingOptions();
  initPaymentToggle();
  initCardFormatting();
  initCoupon();
  initPlaceOrder();
  initStepReveal();
});
