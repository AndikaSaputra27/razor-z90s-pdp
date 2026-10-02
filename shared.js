/**
 * shared.js — Razor Audio
 * Utilitas lintas halaman: dark mode, scroll reveal, nav drawer, page transitions
 */

'use strict';

/* =====================================================
   1. DARK MODE
   ===================================================== */
var DARK_KEY = 'razor-dark-mode';

function applyDarkMode(dark) {
  document.documentElement.setAttribute('data-dark', dark ? 'true' : 'false');
  localStorage.setItem(DARK_KEY, dark ? '1' : '0');
  var btn = document.getElementById('btnDarkMode');
  if (btn) {
    btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
  }
}

function initDarkMode() {
  var saved = localStorage.getItem(DARK_KEY);
  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  var dark = saved !== null ? saved === '1' : prefersDark;
  applyDarkMode(dark);

  var btn = document.getElementById('btnDarkMode');
  if (btn) {
    btn.addEventListener('click', function() {
      var isDark = document.documentElement.getAttribute('data-dark') === 'true';
      applyDarkMode(!isDark);
    });
  }

  // Listen for system preference change
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
      if (localStorage.getItem(DARK_KEY) === null) applyDarkMode(e.matches);
    });
  }
}

/* =====================================================
   2. SCROLL REVEAL ANIMATION
   ===================================================== */
function initScrollReveal() {
  var elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  if (!('IntersectionObserver' in window)) {
    // Fallback: show all immediately
    elements.forEach(function(el) { el.classList.add('revealed'); });
    return;
  }

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(function(el, i) {
    // Stagger delay for grid children
    if (el.closest('.products-grid') || el.closest('.accordion-wrap')) {
      el.style.transitionDelay = (i % 4) * 80 + 'ms';
    }
    observer.observe(el);
  });
}

/* =====================================================
   3. PAGE TRANSITION
   ===================================================== */
function initPageTransition() {
  // Add fade-in on load
  document.body.classList.add('page-enter');
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      document.body.classList.add('page-enter-active');
    });
  });

  // Fade-out before leaving
  document.querySelectorAll('a[href]').forEach(function(link) {
    var href = link.getAttribute('href');
    // Only internal .html links
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;
    if (!href.endsWith('.html') && href !== '/') return;

    link.addEventListener('click', function(e) {
      e.preventDefault();
      document.body.classList.add('page-exit');
      setTimeout(function() {
        window.location.href = href;
      }, 280);
    });
  });
}

/* =====================================================
   4. NAV DRAWER (shared across all pages)
   ===================================================== */
function initNavDrawer() {
  var btn     = document.getElementById('btnHamburger');
  var drawer  = document.getElementById('navDrawer');
  var overlay = document.getElementById('navOverlay');
  var closeBtn = document.getElementById('btnCloseNav');
  if (!btn || !drawer) return;

  function openNav() {
    drawer.classList.add('is-open');
    overlay.classList.add('is-visible');
    btn.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('drawer-open');
    var first = drawer.querySelector('.nav-drawer-link');
    if (first) first.focus();
  }

  function closeNav() {
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-visible');
    btn.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('drawer-open');
    btn.focus();
  }

  btn.addEventListener('click', function() {
    drawer.classList.contains('is-open') ? closeNav() : openNav();
  });
  if (closeBtn) closeBtn.addEventListener('click', closeNav);
  if (overlay)  overlay.addEventListener('click', closeNav);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeNav();
  });
}

/* =====================================================
   5. SMOOTH HOVER LIFT on cards
   ===================================================== */
function initCardHover() {
  document.querySelectorAll('.product-card').forEach(function(card) {
    card.addEventListener('mouseenter', function() {
      card.style.willChange = 'transform, box-shadow';
    });
    card.addEventListener('mouseleave', function() {
      card.style.willChange = '';
    });
  });
}

/* =====================================================
   6. SHARED CART (localStorage)
   ===================================================== */
var CART_KEY = 'razor-cart';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch(e) { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCartShared(name, variant, price, image) {
  var cart = getCart();
  var idx  = cart.findIndex(function(i) { return i.name === name && i.variant === variant; });
  if (idx >= 0) {
    cart[idx].qty += 1;
  } else {
    cart.push({ name: name, variant: variant, price: price, qty: 1, image: image || 'img/matte-black-front.svg' });
  }
  saveCart(cart);
  return cart;
}

function getCartTotal() {
  return getCart().reduce(function(s, i) { return s + i.price * i.qty; }, 0);
}

/* =====================================================
   7. INIT ALL
   ===================================================== */
function initShared() {
  initDarkMode();
  initNavDrawer();
  initScrollReveal();
  initPageTransition();
  initCardHover();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initShared);
} else {
  initShared();
}
