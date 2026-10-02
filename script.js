/**
 * Razor Z90s -- Product Detail Page
 * Vanilla ES6+ JavaScript
 */

"use strict";

/* =====================================================
   1. PRODUCT DATA
   ===================================================== */
const PRODUCT = {
  brand: "Razor Audio",
  name: "Razor Z90s",
  variants: [
    {
      id: "matte-black",
      label: "Matte Black",
      price: 129.99,
      images: {
        front: "img/matte-black-front.svg",
        side: "img/matte-black-side.svg",
      },
    },
    {
      id: "silver-aluminum",
      label: "Silver Aluminum",
      price: 159.99,
      images: {
        front: "img/silver-aluminum-front.svg",
        side: "img/silver-aluminum-side.svg",
      },
    },
    {
      id: "matte-blue",
      label: "Matte Blue",
      price: 149.99,
      images: {
        front: "img/matte-blue-front.svg",
        side: "img/matte-blue-side.svg",
      },
    },
  ],
};

/* =====================================================
   2. APPLICATION STATE
   ===================================================== */
const state = {
  selectedVariantId: "matte-black",
  activeView: "front", // 'front' | 'side'
  quantity: 1,
  rating: 0,
  isWishlisted: false,
  cart: [],
};

/* =====================================================
   3. DOM REFERENCES
   ===================================================== */
const $ = (id) => document.getElementById(id);
const $$ = (sel, ctx) => (ctx || document).querySelectorAll(sel);

const dom = {
  btnHamburger: $("btnHamburger"),
  navDrawer: $("navDrawer"),
  navOverlay: $("navOverlay"),
  btnCloseNav: $("btnCloseNav"),
  btnCartHeader: $("btnCartHeader"),
  cartBadge: $("cartBadge"),
  mainProductImg: $("mainProductImg"),
  zoomContainer: $("zoomContainer"),
  btnZoomIn: $("btnZoomIn"),
  btnZoomOut: $("btnZoomOut"),
  btnZoomReset: $("btnZoomReset"),
  thumbItems: $$(".thumb-item"),
  priceDisplay: $("priceDisplay"),
  variantSelectedName: $("variantSelectedName"),
  variantInputs: $$('input[name="productVariant"]'),
  variantLabels: $$(".variant-option"),
  qtyValue: $("qtyValue"),
  btnQtyMinus: $("btnQtyMinus"),
  btnQtyPlus: $("btnQtyPlus"),
  starBtns: $$(".star-btn"),
  ratingText: $("ratingText"),
  btnAddToCart: $("btnAddToCart"),
  btnWishlist: $("btnWishlist"),
  toastNotif: $("toastNotif"),
  accordionWrap: $("accordionWrap"),
  cartOverlay: $("cartOverlay"),
  cartDrawer: $("cartDrawer"),
  btnCloseCart: $("btnCloseCart"),
  cartEmptyState: $("cartEmptyState"),
  cartItemsList: $("cartItemsList"),
  cartSubtotal: $("cartSubtotal"),
  btnCheckout: $("btnCheckout"),
};

/* =====================================================
   4. UTILITIES
   ===================================================== */

function formatPrice(v) {
  return "$" + v.toFixed(2);
}

function getSelectedVariant() {
  return PRODUCT.variants.find(function (v) {
    return v.id === state.selectedVariantId;
  });
}

var toastTimer = null;
function showToast(msg, type) {
  var el = dom.toastNotif;
  clearTimeout(toastTimer);
  el.textContent = msg;
  el.classList.remove("is-wishlist");
  if (type === "wishlist") el.classList.add("is-wishlist");
  el.classList.add("is-visible");
  toastTimer = setTimeout(function () {
    el.classList.remove("is-visible");
  }, 2800);
}

function pulseBadge() {
  dom.cartBadge.classList.remove("pulse");
  void dom.cartBadge.offsetWidth;
  dom.cartBadge.classList.add("pulse");
  dom.cartBadge.addEventListener(
    "animationend",
    function () {
      dom.cartBadge.classList.remove("pulse");
    },
    { once: true },
  );
}

/* =====================================================
   5. THEME
   ===================================================== */
function applyTheme(variantId) {
  document.documentElement.setAttribute("data-theme", variantId);
}

/* =====================================================
   6. GALLERY IMAGE SWAP
   ===================================================== */

/**
 * Swap the main product image with a fade transition.
 * @param {string} src  - new image src
 * @param {string} alt  - new alt text
 */
function swapMainImage(src, alt) {
  var img = dom.mainProductImg;

  // Fade out
  img.classList.add("is-swapping");

  setTimeout(function () {
    img.src = src;
    if (alt) img.alt = alt;
    // Fade in after src change
    img.onload = function () {
      img.classList.remove("is-swapping");
      img.onload = null;
    };
    // Fallback if already cached
    setTimeout(function () {
      img.classList.remove("is-swapping");
    }, 120);
  }, 200);

  // Reset zoom on image change
  zoomReset();
}

/**
 * Update both thumbnails (front & side) src for the active variant.
 */
function updateThumbnails() {
  var variant = getSelectedVariant();
  dom.thumbItems.forEach(function (btn) {
    var view = btn.dataset.view; // 'front' or 'side'
    var imgEl = btn.querySelector("img");
    if (!imgEl || !view) return;
    imgEl.src = variant.images[view];
    imgEl.alt =
      "Razor Z90s " +
      variant.label +
      " - tampilan " +
      (view === "front" ? "depan" : "samping");
  });
}

/**
 * Activate a specific thumbnail view.
 * @param {'front'|'side'} view
 */
function activateView(view) {
  state.activeView = view;
  var variant = getSelectedVariant();

  dom.thumbItems.forEach(function (btn) {
    var isMatch = btn.dataset.view === view;
    btn.classList.toggle("active", isMatch);
    btn.setAttribute("aria-pressed", isMatch ? "true" : "false");
  });

  swapMainImage(
    variant.images[view],
    "Razor Z90s " +
      variant.label +
      " - tampilan " +
      (view === "front" ? "depan" : "samping"),
  );
}

/* =====================================================
   7. RENDER FUNCTIONS
   ===================================================== */

function renderPrice() {
  dom.priceDisplay.textContent = formatPrice(getSelectedVariant().price);
}

function renderQty() {
  dom.qtyValue.textContent = state.quantity;
  dom.btnQtyMinus.disabled = state.quantity <= 1;
  dom.btnQtyMinus.setAttribute("aria-disabled", state.quantity <= 1);
}

function renderRating(hoverValue) {
  hoverValue = hoverValue || 0;
  dom.starBtns.forEach(function (btn) {
    var v = parseInt(btn.dataset.value, 10);
    var active = v <= state.rating;
    var hovered = hoverValue > 0 && v <= hoverValue;
    btn.classList.toggle("is-active", active && !hoverValue);
    btn.classList.toggle("is-hovered", hovered);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });
  var labels = ["", "Sangat Buruk", "Buruk", "Cukup", "Bagus", "Sangat Bagus"];
  dom.ratingText.textContent =
    state.rating > 0
      ? state.rating + "/5 - " + labels[state.rating]
      : "Belum ada penilaian";
}

function renderVariants() {
  dom.variantLabels.forEach(function (label) {
    var input = label.querySelector('input[type="radio"]');
    label.classList.toggle("active", input.value === state.selectedVariantId);
  });
  dom.variantSelectedName.textContent = getSelectedVariant().label;
}

function getCartTotalQty() {
  return state.cart.reduce(function (s, i) {
    return s + i.qty;
  }, 0);
}
function getCartSubtotal() {
  return state.cart.reduce(function (s, i) {
    return s + i.price * i.qty;
  }, 0);
}

function renderCartBadge() {
  var total = getCartTotalQty();
  dom.cartBadge.textContent = total;
  dom.cartBadge.setAttribute("data-count", total);
  dom.cartBadge.setAttribute("aria-label", total + " item di keranjang");
}

function renderCartDrawer() {
  var hasItems = state.cart.length > 0;
  dom.cartEmptyState.classList.toggle("is-hidden", hasItems);
  var footer = dom.cartDrawer.querySelector(".cart-drawer-footer");
  if (footer) footer.style.display = hasItems ? "" : "none";

  dom.cartItemsList.innerHTML = "";
  state.cart.forEach(function (item, index) {
    var li = document.createElement("li");
    li.className = "cart-item";
    li.setAttribute("data-index", index);
    li.innerHTML =
      '<img src="' +
      item.image +
      '" alt="' +
      item.variantLabel +
      '" class="cart-item-img" loading="lazy" />' +
      '<div class="cart-item-info">' +
      '<span class="cart-item-brand">' +
      PRODUCT.brand +
      "</span>" +
      '<span class="cart-item-name">' +
      PRODUCT.name +
      "</span>" +
      '<span class="cart-item-variant">' +
      item.variantLabel +
      "</span>" +
      '<div class="cart-item-qty-row">' +
      '<div class="cart-item-qty-control">' +
      '<button class="cart-qty-btn btn-cart-minus" data-index="' +
      index +
      '" ' +
      (item.qty <= 1 ? "disabled" : "") +
      ">&#8722;</button>" +
      '<span class="cart-qty-value">' +
      item.qty +
      "</span>" +
      '<button class="cart-qty-btn btn-cart-plus" data-index="' +
      index +
      '">+</button>' +
      "</div>" +
      '<span class="cart-item-price">' +
      formatPrice(item.price * item.qty) +
      "</span>" +
      "</div>" +
      "</div>" +
      '<div class="cart-item-actions">' +
      '<button class="btn-remove-item" data-index="' +
      index +
      '" aria-label="Hapus item">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>' +
      "</button>" +
      "</div>";
    dom.cartItemsList.appendChild(li);
  });

  dom.cartSubtotal.textContent = formatPrice(getCartSubtotal());
}

/* =====================================================
   8. NAV DRAWER
   ===================================================== */
function openNavDrawer() {
  dom.navDrawer.classList.add("is-open");
  dom.navOverlay.classList.add("is-visible");
  dom.btnHamburger.classList.add("is-open");
  dom.navDrawer.setAttribute("aria-hidden", "false");
  dom.navOverlay.setAttribute("aria-hidden", "false");
  dom.btnHamburger.setAttribute("aria-expanded", "true");
  document.body.classList.add("drawer-open");
  var first = dom.navDrawer.querySelector(".nav-drawer-link");
  if (first) first.focus();
}
function closeNavDrawer() {
  dom.navDrawer.classList.remove("is-open");
  dom.navOverlay.classList.remove("is-visible");
  dom.btnHamburger.classList.remove("is-open");
  dom.navDrawer.setAttribute("aria-hidden", "true");
  dom.navOverlay.setAttribute("aria-hidden", "true");
  dom.btnHamburger.setAttribute("aria-expanded", "false");
  if (!dom.cartDrawer.classList.contains("is-open"))
    document.body.classList.remove("drawer-open");
  dom.btnHamburger.focus();
}

/* =====================================================
   9. CART DRAWER
   ===================================================== */
function openCartDrawer() {
  renderCartDrawer();
  dom.cartDrawer.classList.add("is-open");
  dom.cartOverlay.classList.add("is-visible");
  dom.cartDrawer.setAttribute("aria-hidden", "false");
  dom.cartOverlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("drawer-open");
  dom.btnCloseCart.focus();
}
function closeCartDrawer() {
  dom.cartDrawer.classList.remove("is-open");
  dom.cartOverlay.classList.remove("is-visible");
  dom.cartDrawer.setAttribute("aria-hidden", "true");
  dom.cartOverlay.setAttribute("aria-hidden", "true");
  if (!dom.navDrawer.classList.contains("is-open"))
    document.body.classList.remove("drawer-open");
  dom.btnCartHeader.focus();
}

/* =====================================================
   10. CART LOGIC
   ===================================================== */
function addToCart() {
  var variant = getSelectedVariant();
  var idx = state.cart.findIndex(function (i) {
    return i.variantId === variant.id;
  });
  if (idx >= 0) {
    state.cart[idx].qty += state.quantity;
  } else {
    state.cart.push({
      variantId: variant.id,
      variantLabel: variant.label,
      price: variant.price,
      qty: state.quantity,
      image: variant.images.front,
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
  var item = state.cart[index];
  if (!item) return;
  var newQty = item.qty + delta;
  if (newQty < 1) {
    removeCartItem(index);
    return;
  }
  item.qty = newQty;
  renderCartDrawer();
  renderCartBadge();
}

/* =====================================================
   11. IMAGE ZOOM
   ===================================================== */
var zoom = {
  scale: 1,
  minScale: 1,
  maxScale: 4,
  step: 0.5,
  offsetX: 0,
  offsetY: 0,
  isDragging: false,
  startX: 0,
  startY: 0,
};

function clampOffset(scale, ox, oy) {
  var c = dom.zoomContainer;
  var maxX = Math.max(0, (c.offsetWidth * (scale - 1)) / 2);
  var maxY = Math.max(0, (c.offsetHeight * (scale - 1)) / 2);
  return {
    x: Math.min(maxX, Math.max(-maxX, ox)),
    y: Math.min(maxY, Math.max(-maxY, oy)),
  };
}

function applyZoom(animate) {
  var img = dom.mainProductImg;
  img.style.transition =
    animate !== false ? "transform 0.2s cubic-bezier(.4,0,.2,1)" : "none";
  img.style.transform =
    "scale(" +
    zoom.scale +
    ") translate(" +
    zoom.offsetX / zoom.scale +
    "px," +
    zoom.offsetY / zoom.scale +
    "px)";
  dom.zoomContainer.classList.toggle("is-zoomed", zoom.scale > 1);
}

function zoomIn() {
  zoom.scale = Math.min(zoom.maxScale, zoom.scale + zoom.step);
  var c = clampOffset(zoom.scale, zoom.offsetX, zoom.offsetY);
  zoom.offsetX = c.x;
  zoom.offsetY = c.y;
  applyZoom();
}
function zoomOut() {
  zoom.scale = Math.max(zoom.minScale, zoom.scale - zoom.step);
  if (zoom.scale === zoom.minScale) {
    zoom.offsetX = 0;
    zoom.offsetY = 0;
  } else {
    var c = clampOffset(zoom.scale, zoom.offsetX, zoom.offsetY);
    zoom.offsetX = c.x;
    zoom.offsetY = c.y;
  }
  applyZoom();
}
function zoomReset() {
  zoom.scale = 1;
  zoom.offsetX = 0;
  zoom.offsetY = 0;
  applyZoom();
}

function handleWheelZoom(e) {
  e.preventDefault();
  var rect = dom.zoomContainer.getBoundingClientRect();
  var mx = e.clientX - rect.left - rect.width / 2;
  var my = e.clientY - rect.top - rect.height / 2;
  var delta = e.deltaY < 0 ? zoom.step : -zoom.step;
  var ns = Math.min(zoom.maxScale, Math.max(zoom.minScale, zoom.scale + delta));
  if (ns === zoom.scale) return;
  var sd = ns / zoom.scale;
  zoom.offsetX = mx + (zoom.offsetX - mx) * sd;
  zoom.offsetY = my + (zoom.offsetY - my) * sd;
  zoom.scale = ns;
  if (zoom.scale === zoom.minScale) {
    zoom.offsetX = 0;
    zoom.offsetY = 0;
  } else {
    var c = clampOffset(zoom.scale, zoom.offsetX, zoom.offsetY);
    zoom.offsetX = c.x;
    zoom.offsetY = c.y;
  }
  applyZoom(false);
}

var lastTouchDist = 0;
function getTouchDist(t) {
  return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
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
    var dist = getTouchDist(e.touches);
    var delta = (dist - lastTouchDist) / 120;
    lastTouchDist = dist;
    zoom.scale = Math.min(
      zoom.maxScale,
      Math.max(zoom.minScale, zoom.scale + delta),
    );
    if (zoom.scale === zoom.minScale) {
      zoom.offsetX = 0;
      zoom.offsetY = 0;
    } else {
      var c = clampOffset(zoom.scale, zoom.offsetX, zoom.offsetY);
      zoom.offsetX = c.x;
      zoom.offsetY = c.y;
    }
    applyZoom(false);
  } else if (e.touches.length === 1 && zoom.isDragging && zoom.scale > 1) {
    e.preventDefault();
    zoom.offsetX = e.touches[0].clientX - zoom.startX;
    zoom.offsetY = e.touches[0].clientY - zoom.startY;
    var c2 = clampOffset(zoom.scale, zoom.offsetX, zoom.offsetY);
    zoom.offsetX = c2.x;
    zoom.offsetY = c2.y;
    applyZoom(false);
  }
}
function handleTouchEnd() {
  zoom.isDragging = false;
}
function handleMouseDown(e) {
  if (zoom.scale <= 1) return;
  zoom.isDragging = true;
  zoom.startX = e.clientX - zoom.offsetX;
  zoom.startY = e.clientY - zoom.offsetY;
  dom.zoomContainer.style.cursor = "grabbing";
}
function handleMouseMove(e) {
  if (!zoom.isDragging) return;
  zoom.offsetX = e.clientX - zoom.startX;
  zoom.offsetY = e.clientY - zoom.startY;
  var c = clampOffset(zoom.scale, zoom.offsetX, zoom.offsetY);
  zoom.offsetX = c.x;
  zoom.offsetY = c.y;
  applyZoom(false);
}
function handleMouseUp() {
  zoom.isDragging = false;
  dom.zoomContainer.style.cursor = zoom.scale > 1 ? "move" : "grab";
}

/* =====================================================
   12. ACCORDION
   ===================================================== */
function toggleAccordion(trigger) {
  var panelId = trigger.getAttribute("aria-controls");
  var panel = document.getElementById(panelId);
  var isExpanded = trigger.getAttribute("aria-expanded") === "true";

  $$(".accordion-trigger", dom.accordionWrap).forEach(function (other) {
    if (other !== trigger) {
      other.setAttribute("aria-expanded", "false");
      document
        .getElementById(other.getAttribute("aria-controls"))
        .setAttribute("hidden", "");
    }
  });

  if (isExpanded) {
    trigger.setAttribute("aria-expanded", "false");
    panel.setAttribute("hidden", "");
  } else {
    trigger.setAttribute("aria-expanded", "true");
    panel.removeAttribute("hidden");
    if (window.innerWidth <= 900) {
      setTimeout(function () {
        trigger.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  }
}

/* =====================================================
   13. FOCUS TRAP
   ===================================================== */
function trapFocus(e) {
  if (e.key !== "Tab") return;
  var focusables = Array.from(
    e.currentTarget.querySelectorAll(
      'a,button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])',
    ),
  ).filter(function (el) {
    return !el.closest("[hidden]");
  });
  if (!focusables.length) return;
  var first = focusables[0];
  var last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

/* =====================================================
   14. EVENT LISTENERS
   ===================================================== */
function initEventListeners() {
  /* Nav drawer */
  dom.btnHamburger.addEventListener("click", function () {
    dom.navDrawer.classList.contains("is-open")
      ? closeNavDrawer()
      : openNavDrawer();
  });
  dom.btnCloseNav.addEventListener("click", closeNavDrawer);
  dom.navOverlay.addEventListener("click", closeNavDrawer);

  /* Cart drawer */
  dom.btnCartHeader.addEventListener("click", openCartDrawer);
  dom.btnCloseCart.addEventListener("click", closeCartDrawer);
  dom.cartOverlay.addEventListener("click", closeCartDrawer);

  /* Cart item controls (delegation) */
  dom.cartItemsList.addEventListener("click", function (e) {
    var minus = e.target.closest(".btn-cart-minus");
    var plus = e.target.closest(".btn-cart-plus");
    var remove = e.target.closest(".btn-remove-item");
    if (minus) changeCartItemQty(parseInt(minus.dataset.index, 10), -1);
    if (plus) changeCartItemQty(parseInt(plus.dataset.index, 10), 1);
    if (remove) removeCartItem(parseInt(remove.dataset.index, 10));
  });

  /* Checkout */
  dom.btnCheckout.addEventListener("click", function () {
    showToast("Terima kasih! Proses checkout sedang disimulasikan.", "cart");
    closeCartDrawer();
  });

  /* Variant selection */
  dom.variantInputs.forEach(function (input) {
    input.addEventListener("change", function () {
      state.selectedVariantId = input.value;
      renderVariants();
      renderPrice();
      applyTheme(input.value);
      updateThumbnails();
      activateView(state.activeView); // re-show current view in new variant colour
    });
  });

  dom.variantLabels.forEach(function (label) {
    label.addEventListener("click", function () {
      var input = label.querySelector('input[type="radio"]');
      if (!input) return;
      state.selectedVariantId = input.value;
      renderVariants();
      renderPrice();
      applyTheme(input.value);
      updateThumbnails();
      activateView(state.activeView);
    });
  });

  /* Thumbnail click — switch front / side view */
  dom.thumbItems.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var view = btn.dataset.view;
      if (view) activateView(view);
    });
    btn.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        var view = btn.dataset.view;
        if (view) activateView(view);
      }
    });
  });

  /* Quantity */
  dom.btnQtyMinus.addEventListener("click", function () {
    if (state.quantity > 1) {
      state.quantity--;
      renderQty();
    }
  });
  dom.btnQtyPlus.addEventListener("click", function () {
    state.quantity++;
    renderQty();
  });

  /* Star rating */
  dom.starBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.rating = parseInt(btn.dataset.value, 10);
      renderRating();
    });
    btn.addEventListener("mouseenter", function () {
      renderRating(parseInt(btn.dataset.value, 10));
    });
    btn.addEventListener("mouseleave", function () {
      renderRating();
    });
    btn.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        state.rating = parseInt(btn.dataset.value, 10);
        renderRating();
      }
    });
  });

  /* Add to Cart */
  dom.btnAddToCart.addEventListener("click", function () {
    addToCart();
    var orig = dom.btnAddToCart.textContent;
    dom.btnAddToCart.textContent = "Added to Cart!";
    dom.btnAddToCart.classList.add("is-added");
    setTimeout(function () {
      dom.btnAddToCart.textContent = orig;
      dom.btnAddToCart.classList.remove("is-added");
    }, 2000);
    openCartDrawer();
  });

  /* Wishlist */
  dom.btnWishlist.addEventListener("click", function () {
    state.isWishlisted = !state.isWishlisted;
    dom.btnWishlist.classList.toggle("is-active", state.isWishlisted);
    dom.btnWishlist.setAttribute(
      "aria-pressed",
      state.isWishlisted ? "true" : "false",
    );
    dom.btnWishlist.setAttribute(
      "aria-label",
      state.isWishlisted
        ? "Hapus dari daftar keinginan"
        : "Simpan ke daftar keinginan",
    );
    showToast(
      state.isWishlisted
        ? "Razor Z90s ditambahkan ke Wishlist!"
        : "Razor Z90s dihapus dari Wishlist.",
      "wishlist",
    );
  });

  /* Accordion */
  $$(".accordion-trigger", dom.accordionWrap).forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      toggleAccordion(trigger);
    });
    trigger.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleAccordion(trigger);
      }
    });
  });

  /* Zoom buttons */
  dom.btnZoomIn.addEventListener("click", zoomIn);
  dom.btnZoomOut.addEventListener("click", zoomOut);
  dom.btnZoomReset.addEventListener("click", zoomReset);
  dom.zoomContainer.addEventListener("wheel", handleWheelZoom, {
    passive: false,
  });
  dom.zoomContainer.addEventListener("mousedown", handleMouseDown);
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
  dom.zoomContainer.addEventListener("touchstart", handleTouchStart, {
    passive: false,
  });
  dom.zoomContainer.addEventListener("touchmove", handleTouchMove, {
    passive: false,
  });
  dom.zoomContainer.addEventListener("touchend", handleTouchEnd);
  dom.zoomContainer.addEventListener("dblclick", function () {
    zoom.scale > 1 ? zoomReset() : zoomIn();
  });

  /* Escape */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (dom.cartDrawer.classList.contains("is-open")) closeCartDrawer();
      else if (dom.navDrawer.classList.contains("is-open")) closeNavDrawer();
    }
  });

  /* Focus traps */
  dom.cartDrawer.addEventListener("keydown", trapFocus);
  dom.navDrawer.addEventListener("keydown", trapFocus);
}

/* =====================================================
   15. INIT
   ===================================================== */
function init() {
  var footer = dom.cartDrawer.querySelector(".cart-drawer-footer");
  if (footer) footer.style.display = "none";

  applyTheme(state.selectedVariantId);
  renderPrice();
  renderQty();
  renderRating();
  renderVariants();
  renderCartBadge();
  updateThumbnails();

  initEventListeners();
  console.info("[Razor Z90s PDP] Ready.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
