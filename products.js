/**
 * products.js — Razor Audio Product Listing Page
 */
'use strict';

/* Filter */
function initFilter() {
  var btns  = document.querySelectorAll('.filter-btn');
  var cards = document.querySelectorAll('.product-card');
  btns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      btns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var filter = btn.dataset.filter;
      cards.forEach(function(card) {
        var cat = card.dataset.category || '';
        var show = filter === 'all' || cat.indexOf(filter) !== -1;
        card.style.display = show ? '' : 'none';
        if (show) {
          setTimeout(function() { card.classList.add('revealed'); }, 50);
        }
      });
    });
  });
}

/* Quick add to cart from product listing */
function addToCartQuick(name, variant, price) {
  var cart  = addToCartShared(name, variant, price);
  var total = cart.reduce(function(s, i) { return s + i.qty; }, 0);

  var toast = document.getElementById('cartToast');
  if (!toast) return;
  toast.textContent = name + ' (' + variant + ') ditambahkan ke keranjang!';
  toast.classList.add('is-visible');
  setTimeout(function() { toast.classList.remove('is-visible'); }, 2800);
}

document.addEventListener('DOMContentLoaded', function() {
  initFilter();
});
