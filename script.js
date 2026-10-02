/**
 * Razor Z90s -- Product Detail Page
 * Vanilla ES6+ JavaScript
 * All state managed client-side, zero dependencies.
 */

'use strict';

/* =====================================================
   1. PRODUCT DATA
   ===================================================== */
const PRODUCT = {
  brand:   'Razor Audio',
  name:    'Razor Z90s',
  image:   'img/razor-z90s.jpeg',
  variants: [
    { id: 'matte-black',     label: 'Matte Black',     price: 129.99 },
    { id: 'silver-aluminum', label: 'Silver Aluminum', price: 159.99 },
    { id: 'matte-blue',      label: 'Matte Blue',      price: 149.99 },
  ],
};

/* =====================================================
   2. APPLICATION STATE
   ===================================================== */
const state = {
  selectedVariantId: 'matte-black',
  quantity:          1,
  rating:            0,
  isWishlisted:      false,
  cart:              [],
};

/* =====================================================
   3. DOM REFERENCES
   ===================================================== */
const $ = (id) => document.getElementById(id);
const $$ = (sel, ctx = document) => ctx.querySelectorAll(sel);

const dom = {
  // Header
  btnHamburger:    $('btnHamburger'),
  navDrawer:       $('navDrawer'),
  navOverlay:      $('navOverlay'),
  btnCloseNav:     $('btnCloseNav'),
  btnCartHeader:   $('btnCartHeader'),
  cartBadge:       $('cartBadge'),

  // Gallery
  mainProductImg:  $('mainProductImg'),
  zoomContainer:   $('zoomContainer'),
  btnZoomIn:       $('btnZoomIn'),
  btnZoomOut:      $('btnZoomOut'),
  btnZoomReset:    $('btnZoomReset'),
  thumbItems:      $$('.thumb-item'),

  // Product info
  priceDisplay:         $('priceDisplay'),
  variantSelectedName:  $('variantSelectedName'),
  variantInputs:        $$('input[name="productVariant"]'),
  variantLabels:        $$('.variant-option'),
  qtyValue:             $('qtyValue'),
  btnQtyMinus:          $('btnQtyMinus'),
  btnQtyPlus:           $('btnQtyPlus'),
  starBtns:             $$('.star-btn'),
  ratingText:           $('ratingText'),
  btnAddToCart:         $('btnAddToCart'),
  btnWishlist:          $('btnWishlist'),
  toastNotif:           $('toastNotif'),

  // Accordion
  accordionWrap:   $('accordionWrap'),

  // Cart drawer
  cartOverlay:     $('cartOverlay'),
  cartDrawer:      $('cartDrawer'),
  btnCloseCart:    $('btnCloseCart'),
  cartDrawerBody:  $('cartDrawerBody'),
  cartEmptyState:  $('cartEmptyState'),
  cartItemsList:   $('cartItemsList'),
  cartSubtotal:    $('cartSubtotal'),
  btnCheckout:     $('btnCheckout'),
};

/* =====================================================
   4. UTILITIES
   ===================================================== */

function formatPrice(value) {
  return '$' + value.toFixed(2);
}

function getSelectedVariant() {
  return PRODUCT.variants.find((v) => v.id === state.selectedVariantId);
}

let toastTimer = null;
function showToast(message, type) {
  const el = dom.toastNotif;
  clearTimeout(toastTimer);
  el.textContent = message;
  el.classList.remove('is-wishlist');
  if (type === 'wishlist') el.classList.add('is-wishlist');
  el.classList.add('is-visible');
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2800);
}

function pulseBadge() {
  dom.cartBadge.classList.remove('pulse');
  void dom.cartBadge.offsetWidth;
  dom.cartBadge.classList.add('pulse');
  dom.cartBadge.addEventListener('animationend', () => {
    dom.cartBadge.classList.remove('pulse');
  }, { once: true });
}

/* =====================================================
   5. THEME
   ===================================================== */

/**
 * Apply color theme by setting data-theme on <html>.
 * CSS custom properties cascade instantly.
 * @param {string} variantId
 */
function applyTheme(variantId) {
  document.documentElement.setAttribute('data-theme', variantId);
}

/* =====================================================
   6. RENDER FUNCTIONS
   ===================================================== */

function renderPrice() {
  const variant = getSelectedVariant();
  dom.priceDisplay.textContent = formatPrice(variant.price);
}

function renderQty() {
  dom.qtyValue.textContent = state.quantity;
  dom.btnQtyMinus.disabled = state.quantity <= 1;
  dom.btnQtyMinus.setAttribute('aria-disabled', state.quantity <= 1);
}

function renderRating(hoverValue) {
  hoverValue = hoverValue || 0;
  dom.starBtns.forEach((btn) => {
    const v = parseInt(btn.dataset.value, 10);
    const active  = v <= state.rating;
    const hovered = hoverValue > 0 && v <= hoverValue;
    btn.classList.toggle('is-active',  active && !hoverValue);
    btn.classList.toggle('is-hovered', hovered);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });

  if (state.rating > 0) {
    const labels = ['', 'Sangat Buruk', 'Buruk', 'Cukup', 'Bagus', 'Sangat Bagus'];
    dom.ratingText.textContent = state.rating + '/5 -- ' + labels[state.rating];
  } else {
    dom.ratingText.textContent = 'Belum ada penilaian';
  }
}

function renderVariants() {
  dom.variantLabels.forEach((label) => {
    const input = label.querySelector('input[type="radio"]');
    label.classList.toggle('active', input.value === state.selectedVariantId);
  });
  const variant = getSelectedVariant();
  dom.variantSelectedName.textContent = variant.label;
}

function getCartTotalQty() {
  return state.cart.reduce((sum, item) => sum + item.qty, 0);
}

function getCartSubtotal() {
  return state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function renderCartBadge() {
  const total = getCartTotalQty();
  dom.cartBadge.textContent = total;
  dom.cartBadge.setAttribute('data-count', total);
  dom.cartBadge.setAttribute('aria-label', total + ' item di keranjang');
}

function renderCartDrawer() {
  const hasItems = state.cart.length > 0;

  dom.cartEmptyState.classList.toggle('is-hidden', hasItems);
  dom.cartDrawer.querySelector('.cart-drawer-footer').style.display = hasItems ? '' : 'none';
  dom.cartItemsList.innerHTML = '';

  state.cart.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.setAttribute('data-index', index);
    li.innerHTML =
      '<img src="' + item.image + '" alt="' + item.variantLabel + ' -- ' + PRODUCT.name + '" class="cart-item-img" loading="lazy" />' +
      '<div class="cart-item-info">' +
        '<span class="cart-item-brand">' + PRODUCT.brand + '</span>' +
        '<span class="cart-item-name">' + PRODUCT.name + '</span>' +
        '<span class="cart-item-variant">' + item.variantLabel + '</span>' +
        '<div class="cart-item-qty-row">' +
          '<div class="cart-item-qty-control">' +
            '<button class="cart-qty-btn btn-cart-minus" data-index="' + index + '" aria-label="Kurangi jumlah" ' + (item.qty <= 1 ? 'disabled' : '') + '>&#8722;</button>' +
            '<span class="cart-qty-value" aria-live="polite">' + item.qty + '</span>' +
            '<button class="cart-qty-btn btn-cart-plus" data-index="' + index + '" aria-label="Tambah jumlah">+</button>' +
          '</div>' +
          '<span class="cart-item-price">' + formatPrice(item.price * item.qty) + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="cart-item-actions">' +
        '<button class="btn-remove-item" data-index="' + index + '" aria-label="Hapus dari keranjang">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>' +
        '</button>' +
      '</div>';
    dom.cartItemsList.appendChild(li);
  });

  dom.cartSubtotal.textContent = formatPrice(getCartSubtotal());
}

/* =====================================================
   7. NAV DRAWER
   ===================================================== */

function openNavDrawer() {
  dom.navDrawer.classList.add('is-open');
  dom.navOverlay.classList.add('is-visible');
  dom.btnHamburger.classList.add('is-open');
  dom.navDrawer.setAttribute('aria-hidden', 'false');
  dom.navOverlay.setAttribute('aria-hidden', 'false');
  dom.btnHamburger.setAttribute('aria-expanded', 'true');
  document.body.classList.add('drawer-open');
  const firstLink = dom.navDrawer.querySelector('.nav-drawer-link');
  if (firstLink) firstLink.focus();
}

function closeNavDrawer() {
  dom.navDrawer.classList.remove('is-open');
  dom.navOverlay.classList.remove('is-visible');
  dom.btnHamburger.classList.remove('is-open');
  dom.navDrawer.setAttribute('aria-hidden', 'true');
  dom.navOverlay.setAttribute('aria-hidden', 'true');
  dom.btnHamburger.setAttribute('aria-expanded', 'false');
  if (!dom.cartDrawer.classList.contains('is-open')) {
    document.body.classList.remove('drawer-open');
  }
  dom.btnHamburger.focus();
}

/* =====================================================
   8. CART DRAWER
   ===================================================== */

function openCartDrawer() {
  renderCartDrawer();
  dom.cartDrawer.classList.add('is-open');
  dom.cartOverlay.classList.add('is-visible');
  dom.cartDrawer.setAttribute('aria-hidden', 'false');
  dom.cartOverlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('drawer-open');
  dom.btnCloseCart.focus();
}

function closeCartDrawer() {
  dom.cartDrawer.classList.remove('is-open');
  dom.cartOverlay.classList.remove('is-visible');
  dom.cartDrawer.setAttribute('aria-hidden', 'true');
  dom.cartOverlay.setAttribute('aria-hidden', 'true');
  if (!dom.navDrawer.classList.contains('is-open')) {
    document.body.classList.remove('drawer-open');
  }
  dom.btnCartHeader.focus();
}

/* =====================================================
   9. CART LOGIC
   ===================================================== */

function addToCart() {
  const variant = getSelectedVariant();
  const existingIndex = state.cart.findIndex((item) => item.variantId === variant.id);
  if (existingIndex >= 0) {
    state.cart[existingIndex].qty += state.quantity;
  } else {
    state.cart.push({
      variantId:    variant.id,
      variantLabel: variant.label,
      price:        variant.price,
      qty:          state.quantity,
      image:        PRODUCT.image,
    });
  }
  renderCartBadge();
  pulseBadge();
}

function removeCartItem(index) {
  state.cart.splice(index, 1);
  renderCartDrawer();
  renderCartBadge();
}

function changeCartItemQty(index, delta) {
  const item = state.cart[index];
  if (!item) return;
  const newQty = item.qty + delta;
  if (newQty < 1) { removeCartItem(index); return; }
  item.qty = newQty;
  renderCartDrawer();
  renderCartBadge();
}

/* =====================================================
   10. IMAGE ZOOM
   ===================================================== */

const zoom = {
  scale: 1, minScale: 1, maxScale: 4, step: 0.5,
  offsetX: 0, offsetY: 0,
  isDragging: false, startX: 0, startY: 0,
};

function clampOffset(scale, offsetX, offsetY) {
  const c    = dom.zoomContainer;
  const maxX = Math.max(0, (c.offsetWidth  * (scale - 1)) / 2);
  const maxY = Math.max(0, (c.offsetHeight * (scale - 1)) / 2);
  return {
    x: Math.min(maxX, Math.max(-maxX, offsetX)),
    y: Math.min(maxY, Math.max(-maxY, offsetY)),
  };
}

function applyZoom(animate) {
  const img = dom.mainProductImg;
  img.style.transition = animate !== false
    ? 'transform 0.2s cubic-bezier(.4,0,.2,1)'
    : 'none';
  img.style.transform =
    'scale(' + zoom.scale + ') translate(' +
    (zoom.offsetX / zoom.scale) + 'px, ' +
    (zoom.offsetY / zoom.scale) + 'px)';
  dom.zoomContainer.classList.toggle('is-zoomed', zoom.scale > 1);
}

function zoomIn() {
  zoom.scale = Math.min(zoom.maxScale, zoom.scale + zoom.step);
  const c = clampOffset(zoom.scale, zoom.offsetX, zoom.offsetY);
  zoom.offsetX = c.x; zoom.offsetY = c.y;
  applyZoom();
}

function zoomOut() {
  zoom.scale = Math.max(zoom.minScale, zoom.scale - zoom.step);
  if (zoom.scale === zoom.minScale) {
    zoom.offsetX = 0; zoom.offsetY = 0;
  } else {
    const c = clampOffset(zoom.scale, zoom.offsetX, zoom.offsetY);
    zoom.offsetX = c.x; zoom.offsetY = c.y;
  }
  applyZoom();
}

function zoomReset() {
  zoom.scale = 1; zoom.offsetX = 0; zoom.offsetY = 0;
  applyZoom();
}

function handleWheelZoom(e) {
  e.preventDefault();
  const rect  = dom.zoomContainer.getBoundingClientRect();
  const mouseX = e.clientX - rect.left - rect.width  / 2;
  const mouseY = e.clientY - rect.top  - rect.height / 2;
  const delta  = e.deltaY < 0 ? zoom.step : -zoom.step;
  const newScale = Math.min(zoom.maxScale, Math.max(zoom.minScale, zoom.scale + delta));
  if (newScale !== zoom.scale) {
    const scaleDiff = newScale / zoom.scale;
    zoom.offsetX = mouseX + (zoom.offsetX - mouseX) * scaleDiff;
    zoom.offsetY = mouseY + (zoom.offsetY - mouseY) * scaleDiff;
    zoom.scale   = newScale;
    if (zoom.scale === zoom.minScale) {
      zoom.offsetX = 0; zoom.offsetY = 0;
    } else {
      const c = clampOffset(zoom.scale, zoom.offsetX, zoom.offsetY);
      zoom.offsetX = c.x; zoom.offsetY = c.y;
    }
    applyZoom(false);
  }
}

let lastTouchDist = 0;
function getTouchDist(touches) {
  return Math.hypot(
    touches[0].clientX - touches[1].clientX,
    touches[0].clientY - touches[1].clientY
  );
}

function handleTouchStart(e) {
  if (e.touches.length === 2) {
    lastTouchDist = getTouchDist(e.touches);
  } else if (e.touches.length === 1 && zoom.scale > 1) {
    zoom.isDragging = true;
    zoom.startX = e.touches[0].clientX - zoom.offsetX;
    zoom.startY = e.touches[0].clientY - zoom.offsetY;
  }
}

function handleTouchMove(e) {
  if (e.touches.length === 2) {
    e.preventDefault();
    const dist  = getTouchDist(e.touches);
    const delta = (dist - lastTouchDist) / 120;
    lastTouchDist = dist;
    zoom.scale = Math.min(zoom.maxScale, Math.max(zoom.minScale, zoom.scale + delta));
    if (zoom.scale === zoom.minScale) {
      zoom.offsetX = 0; zoom.offsetY = 0;
    } else {
      const c = clampOffset(zoom.scale, zoom.offsetX, zoom.offsetY);
      zoom.offsetX = c.x; zoom.offsetY = c.y;
    }
    applyZoom(false);
  } else if (e.touches.length === 1 && zoom.isDragging && zoom.scale > 1) {
    e.preventDefault();
    zoom.offsetX = e.touches[0].clientX - zoom.startX;
    zoom.offsetY = e.touches[0].clientY - zoom.startY;
    const c = clampOffset(zoom.scale, zoom.offsetX, zoom.offsetY);
    zoom.offsetX = c.x; zoom.offsetY = c.y;
    applyZoom(false);
  }
}

function handleTouchEnd() { zoom.isDragging = false; }

function handleMouseDown(e) {
  if (zoom.scale <= 1) return;
  zoom.isDragging = true;
  zoom.startX = e.clientX - zoom.offsetX;
  zoom.startY = e.clientY - zoom.offsetY;
  dom.zoomContainer.style.cursor = 'grabbing';
}

function handleMouseMove(e) {
  if (!zoom.isDragging) return;
  zoom.offsetX = e.clientX - zoom.startX;
  zoom.offsetY = e.clientY - zoom.startY;
  const c = clampOffset(zoom.scale, zoom.offsetX, zoom.offsetY);
  zoom.offsetX = c.x; zoom.offsetY = c.y;
  applyZoom(false);
}

function handleMouseUp() {
  zoom.isDragging = false;
  dom.zoomContainer.style.cursor = zoom.scale > 1 ? 'move' : 'grab';
}

/* =====================================================
   11. ACCORDION
   ===================================================== */

function toggleAccordion(trigger) {
  const panelId    = trigger.getAttribute('aria-controls');
  const panel      = document.getElementById(panelId);
  const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

  // Close all others
  $$('.accordion-trigger', dom.accordionWrap).forEach((other) => {
    if (other !== trigger) {
      other.setAttribute('aria-expanded', 'false');
      document.getElementById(other.getAttribute('aria-controls')).setAttribute('hidden', '');
    }
  });

  if (isExpanded) {
    trigger.setAttribute('aria-expanded', 'false');
    panel.setAttribute('hidden', '');
  } else {
    trigger.setAttribute('aria-expanded', 'true');
    panel.removeAttribute('hidden');
    if (window.innerWidth <= 900) {
      setTimeout(() => trigger.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
  }
}

/* =====================================================
   12. THUMBNAIL SWITCHING
   ===================================================== */

function switchThumb(btn) {
  const src = btn.dataset.img;
  if (!src) return;
  dom.thumbItems.forEach((t) => {
    t.classList.remove('active');
    t.setAttribute('aria-pressed', 'false');
  });
  btn.classList.add('active');
  btn.setAttribute('aria-pressed', 'true');
  zoomReset();
  dom.mainProductImg.src = src;
}

/* =====================================================
   13. EVENT LISTENERS
   ===================================================== */

function trapFocus(e) {
  if (e.key !== 'Tab') return;
  const focusables = Array.from(
    e.currentTarget.querySelectorAll(
      'a, button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => !el.closest('[hidden]'));
  if (!focusables.length) return;
  const first = focusables[0];
  const last  = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault(); last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault(); first.focus();
  }
}

function initEventListeners() {

  /* Nav Drawer */
  dom.btnHamburger.addEventListener('click', () => {
    dom.navDrawer.classList.contains('is-open') ? closeNavDrawer() : openNavDrawer();
  });
  dom.btnCloseNav.addEventListener('click', closeNavDrawer);
  dom.navOverlay.addEventListener('click', closeNavDrawer);

  /* Cart Drawer */
  dom.btnCartHeader.addEventListener('click', openCartDrawer);
  dom.btnCloseCart.addEventListener('click', closeCartDrawer);
  dom.cartOverlay.addEventListener('click', closeCartDrawer);

  /* Cart item controls (delegation) */
  dom.cartItemsList.addEventListener('click', (e) => {
    const minus  = e.target.closest('.btn-cart-minus');
    const plus   = e.target.closest('.btn-cart-plus');
    const remove = e.target.closest('.btn-remove-item');
    if (minus)  changeCartItemQty(parseInt(minus.dataset.index,  10), -1);
    if (plus)   changeCartItemQty(parseInt(plus.dataset.index,   10),  1);
    if (remove) removeCartItem(parseInt(remove.dataset.index, 10));
  });

  /* Checkout */
  dom.btnCheckout.addEventListener('click', () => {
    showToast('Terima kasih! Proses checkout sedang disimulasikan.', 'cart');
    closeCartDrawer();
  });

  /* Variant Selection */
  dom.variantInputs.forEach((input) => {
    input.addEventListener('change', () => {
      state.selectedVariantId = input.value;
      renderVariants();
      renderPrice();
      applyTheme(input.value);
    });
  });

  dom.variantLabels.forEach((label) => {
    label.addEventListener('click', () => {
      const input = label.querySelector('input[type="radio"]');
      if (input) {
        state.selectedVariantId = input.value;
        renderVariants();
        renderPrice();
        applyTheme(input.value);
      }
    });
  });

  /* Quantity */
  dom.btnQtyMinus.addEventListener('click', () => {
    if (state.quantity > 1) { state.quantity--; renderQty(); }
  });
  dom.btnQtyPlus.addEventListener('click', () => {
    state.quantity++; renderQty();
  });

  /* Star Rating */
  dom.starBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      state.rating = parseInt(btn.dataset.value, 10);
      renderRating();
    });
    btn.addEventListener('mouseenter', () => renderRating(parseInt(btn.dataset.value, 10)));
    btn.addEventListener('mouseleave', () => renderRating());
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        state.rating = parseInt(btn.dataset.value, 10);
        renderRating();
      }
    });
  });

  /* Add to Cart */
  dom.btnAddToCart.addEventListener('click', () => {
    addToCart();
    const original = dom.btnAddToCart.textContent;
    dom.btnAddToCart.textContent = 'Added to Cart!';
    dom.btnAddToCart.classList.add('is-added');
    setTimeout(() => {
      dom.btnAddToCart.textContent = original;
      dom.btnAddToCart.classList.remove('is-added');
    }, 2000);
    openCartDrawer();
  });

  /* Wishlist */
  dom.btnWishlist.addEventListener('click', () => {
    state.isWishlisted = !state.isWishlisted;
    dom.btnWishlist.classList.toggle('is-active', state.isWishlisted);
    dom.btnWishlist.setAttribute('aria-pressed', state.isWishlisted ? 'true' : 'false');
    dom.btnWishlist.setAttribute('aria-label',
      state.isWishlisted ? 'Hapus dari daftar keinginan' : 'Simpan ke daftar keinginan'
    );
    showToast(
      state.isWishlisted
        ? 'Razor Z90s ditambahkan ke Wishlist!'
        : 'Razor Z90s dihapus dari Wishlist.',
      'wishlist'
    );
  });

  /* Accordion */
  $$('.accordion-trigger', dom.accordionWrap).forEach((trigger) => {
    trigger.addEventListener('click', () => toggleAccordion(trigger));
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleAccordion(trigger); }
    });
  });

  /* Thumbnails */
  dom.thumbItems.forEach((btn) => {
    btn.addEventListener('click', () => switchThumb(btn));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); switchThumb(btn); }
    });
  });

  /* Zoom Buttons */
  dom.btnZoomIn.addEventListener('click', zoomIn);
  dom.btnZoomOut.addEventListener('click', zoomOut);
  dom.btnZoomReset.addEventListener('click', zoomReset);

  /* Zoom: wheel */
  dom.zoomContainer.addEventListener('wheel', handleWheelZoom, { passive: false });

  /* Zoom: mouse drag */
  dom.zoomContainer.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);

  /* Zoom: touch */
  dom.zoomContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
  dom.zoomContainer.addEventListener('touchmove',  handleTouchMove,  { passive: false });
  dom.zoomContainer.addEventListener('touchend',   handleTouchEnd);

  /* Zoom: double-click */
  dom.zoomContainer.addEventListener('dblclick', () => {
    zoom.scale > 1 ? zoomReset() : zoomIn();
  });

  /* Escape key */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (dom.cartDrawer.classList.contains('is-open')) closeCartDrawer();
      else if (dom.navDrawer.classList.contains('is-open')) closeNavDrawer();
    }
  });

  /* Focus traps */
  dom.cartDrawer.addEventListener('keydown', trapFocus);
  dom.navDrawer.addEventListener('keydown', trapFocus);
}

/* =====================================================
   14. INIT
   ===================================================== */

function init() {
  // Hide cart footer initially
  const footer = dom.cartDrawer.querySelector('.cart-drawer-footer');
  if (footer) footer.style.display = 'none';

  // Apply default theme
  applyTheme(state.selectedVariantId);

  // Render initial state
  renderPrice();
  renderQty();
  renderRating();
  renderVariants();
  renderCartBadge();

  // Bind events
  initEventListeners();

  console.info('[Razor Z90s PDP] Initialized.');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
