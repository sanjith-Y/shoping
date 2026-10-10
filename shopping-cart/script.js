/**
 * ShopEase — Online Shopping Cart Web Application
 * Master JavaScript Application Logic (Vanilla JS)
 * Configured for Coimbatore, Tamil Nadu, India
 */

'use strict';

/* ==========================================================================
   1. Master Product Catalog Reference
   ========================================================================== */
// Master 120-product catalog loaded via products.js
const productCatalog = (typeof PRODUCTS !== 'undefined' && Array.isArray(PRODUCTS)) ? PRODUCTS : [];

/* ==========================================================================
   2. State Management & Constants
   ========================================================================== */
const BUSINESS_CONFIG = {
  city: 'Coimbatore',
  state: 'Tamil Nadu',
  country: 'India',
  currency: 'INR',
  locale: 'en-IN',
  timeZone: 'Asia/Kolkata',
  storeAddress: 'ShopEase Retail Hub, D.B. Road, R.S. Puram, Coimbatore, Tamil Nadu - 641002, India'
};

const STORAGE_KEYS = {
  CART: 'shopease_cart_v1',
  COUPON: 'shopease_coupon_v1',
  WISHLIST: 'shopease_wishlist_v1'
};

// Available Coupons Database
const COUPONS = {
  SAVE10: {
    code: 'SAVE10',
    description: '10% discount on cart subtotal',
    type: 'PERCENTAGE',
    value: 0.10,
    minSubtotal: 0
  },
  SAVE200: {
    code: 'SAVE200',
    description: 'Flat ₹200 off on orders of ₹2,000 or more',
    type: 'FLAT',
    value: 200,
    minSubtotal: 2000
  },
  FREESHIP: {
    code: 'FREESHIP',
    description: 'Free Delivery waiver (waives ₹99 delivery fee)',
    type: 'FREESHIP',
    value: 0,
    minSubtotal: 0
  }
};

const DELIVERY_SETTINGS = {
  THRESHOLD_FREE: 999, // Orders ₹999 or more get free delivery
  STANDARD_CHARGE: 99
};

const TAX_RATE = 0.18; // 18% GST (Illustrative)

// Application Global State
const appState = {
  cart: [], // Array of { productId, quantity }
  wishlist: [], // Array of product IDs
  appliedCoupon: null, // String code or null
  filters: {
    search: '',
    category: 'All',
    minPrice: null,
    maxPrice: null,
    minRating: 0,
    inStockOnly: false,
    wishlistOnly: false,
    sort: 'featured'
  },
  activeModalProductId: null,
  activeModalQuantity: 1
};

/* ==========================================================================
   3. Utility & Formatting Helpers
   ========================================================================== */

/**
 * Format currency amount with Indian Rupee (₹) and proper thousand separators
 * @param {number} amount
 * @returns {string} e.g. "₹4,499"
 */
function formatCurrency(amount) {
  const rounded = Math.round(Number(amount) || 0);
  return new Intl.NumberFormat(BUSINESS_CONFIG.locale, {
    style: 'currency',
    currency: BUSINESS_CONFIG.currency,
    maximumFractionDigits: 0
  }).format(rounded);
}

/**
 * Helper to get a product by ID from the master catalog
 * @param {string} id
 * @returns {Object|undefined}
 */
function getProductById(id) {
  return productCatalog.find(p => p.id === id);
}

/**
 * Generates an SVG star rating representation
 * @param {number} rating
 * @returns {string} HTML string of SVG stars
 */
function generateStarRatingHtml(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.4;
  let html = '';
  
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      html += `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    } else if (i === fullStars && hasHalfStar) {
      html += `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77V2z"/></svg>`;
    } else {
      html += `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    }
  }
  return html;
}

/**
 * Refresh Lucide icons in dynamically inserted elements
 */
function refreshIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

/**
 * Display a temporary toast notification to the user
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconSvg = '';
  if (type === 'success') {
    iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
  } else if (type === 'error') {
    iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
  } else {
    iconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
  }

  toast.innerHTML = `
    ${iconSvg}
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Auto dismiss after 3500ms
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 250);
  }, 3500);
}

/**
 * Show a reusable confirmation dialog modal
 * @param {string} title
 * @param {string} message
 * @param {Function} onConfirm
 */
function showConfirmDialog(title, message, onConfirm) {
  const modal = document.getElementById('customConfirmModal');
  const titleEl = document.getElementById('confirmDialogTitle');
  const msgEl = document.getElementById('confirmDialogMessage');
  const cancelBtn = document.getElementById('dialogCancelBtn');
  const acceptBtn = document.getElementById('dialogAcceptBtn');

  titleEl.textContent = title;
  msgEl.textContent = message;

  modal.classList.remove('hidden');

  function cleanup() {
    modal.classList.add('hidden');
    cancelBtn.removeEventListener('click', onCancel);
    acceptBtn.removeEventListener('click', onAccept);
  }

  function onCancel() {
    cleanup();
  }

  function onAccept() {
    cleanup();
    if (typeof onConfirm === 'function') onConfirm();
  }

  cancelBtn.addEventListener('click', onCancel);
  acceptBtn.addEventListener('click', onAccept);
}

/* ==========================================================================
   4. LocalStorage Persistence Logic
   ========================================================================== */

/**
 * Save current cart and applied coupon to LocalStorage
 */
function saveCartToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(appState.cart));
    if (appState.appliedCoupon) {
      localStorage.setItem(STORAGE_KEYS.COUPON, appState.appliedCoupon);
    } else {
      localStorage.removeItem(STORAGE_KEYS.COUPON);
    }
  } catch (error) {
    console.warn('Unable to persist cart data to LocalStorage:', error);
  }
}

/**
 * Safely load and validate cart from LocalStorage on initialization
 */
function loadCartFromStorage() {
  try {
    const rawCart = localStorage.getItem(STORAGE_KEYS.CART);
    if (rawCart) {
      const parsedCart = JSON.parse(rawCart);
      if (Array.isArray(parsedCart)) {
        appState.cart = parsedCart.filter(item => {
          if (!item || typeof item.productId !== 'string') return false;
          const product = getProductById(item.productId);
          if (!product) return false;
          item.quantity = Math.max(1, Math.min(Number(item.quantity) || 1, product.stock));
          return true;
        });
      }
    }

    const savedCoupon = localStorage.getItem(STORAGE_KEYS.COUPON);
    if (savedCoupon && COUPONS[savedCoupon.toUpperCase()]) {
      appState.appliedCoupon = savedCoupon.toUpperCase();
    } else {
      appState.appliedCoupon = null;
    }
  } catch (error) {
    console.warn('Corrupted cart data encountered in LocalStorage. Resetting to defaults:', error);
    appState.cart = [];
    appState.appliedCoupon = null;
  }
}

/**
 * Save wishlist items to LocalStorage
 */
function saveWishlistToStorage() {
  try {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(appState.wishlist));
  } catch (error) {
    console.warn('Unable to persist wishlist data:', error);
  }
}

/**
 * Load wishlist items from LocalStorage
 */
function loadWishlistFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        appState.wishlist = parsed.filter(id => typeof id === 'string' && getProductById(id));
      }
    }
  } catch (error) {
    appState.wishlist = [];
  }
}

/**
 * Toggle a product in/out of the user's wishlist
 * @param {string} productId
 */
function toggleWishlist(productId) {
  const product = getProductById(productId);
  if (!product) return;

  const idx = appState.wishlist.indexOf(productId);
  if (idx > -1) {
    appState.wishlist.splice(idx, 1);
    showToast(`Removed "${product.name}" from your wishlist.`, 'info');
  } else {
    appState.wishlist.push(productId);
    showToast(`Saved "${product.name}" to your wishlist!`, 'success');
  }

  saveWishlistToStorage();
  updateWishlistBadge();
  renderProducts();

  if (appState.activeModalProductId === productId) {
    updateModalWishlistState(productId);
  }
}

/**
 * Update the Wishlist counter badge in the navbar
 */
function updateWishlistBadge() {
  const badge = document.getElementById('wishlistBadge');
  if (badge) {
    badge.textContent = appState.wishlist.length;
  }
}

/**
 * Update the active state of the wishlist button inside the modal
 * @param {string} productId
 */
function updateModalWishlistState(productId) {
  const btn = document.getElementById('modalWishlistBtn');
  if (!btn) return;
  const isWishlisted = appState.wishlist.includes(productId);
  btn.classList.toggle('active', isWishlisted);
}

/* ==========================================================================
   5. Financial & Tax Calculations
   ========================================================================== */

/**
 * Calculate product selling price subtotal
 * @returns {number}
 */
function calculateSubtotal() {
  return appState.cart.reduce((sum, item) => {
    const product = getProductById(item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
}

/**
 * Calculate total catalog savings
 * @returns {number}
 */
function calculateProductDiscount() {
  return appState.cart.reduce((sum, item) => {
    const product = getProductById(item.productId);
    if (!product) return sum;
    const itemSavings = Math.max(0, (product.originalPrice - product.price) * item.quantity);
    return sum + itemSavings;
  }, 0);
}

/**
 * Calculate coupon discount based on applied coupon code rules
 * @param {number} subtotal
 * @returns {number}
 */
function calculateCouponDiscount(subtotal) {
  if (!appState.appliedCoupon || subtotal <= 0) return 0;
  
  const coupon = COUPONS[appState.appliedCoupon];
  if (!coupon) return 0;

  if (coupon.type === 'PERCENTAGE') {
    return Math.round(subtotal * coupon.value);
  } else if (coupon.type === 'FLAT') {
    if (subtotal >= coupon.minSubtotal) {
      return Math.min(subtotal, coupon.value);
    }
    return 0;
  } else if (coupon.type === 'FREESHIP') {
    return 0;
  }
  return 0;
}

/**
 * Calculate GST (18% illustrative on taxable amount)
 * @param {number} taxableAmount
 * @returns {number}
 */
function calculateGST(taxableAmount) {
  return Math.round(Math.max(0, taxableAmount) * TAX_RATE);
}

/**
 * Calculate delivery charge based on subtotal and coupon rules
 * @param {number} subtotal
 * @param {string|null} couponCode
 * @returns {number}
 */
function calculateDeliveryCharge(subtotal, couponCode) {
  if (subtotal === 0) return 0;
  if (couponCode === 'FREESHIP') return 0;
  if (subtotal >= DELIVERY_SETTINGS.THRESHOLD_FREE) return 0;
  return DELIVERY_SETTINGS.STANDARD_CHARGE;
}

/**
 * Calculate all totals together and return comprehensive summary
 * @returns {Object}
 */
function calculateAllTotals() {
  const subtotal = calculateSubtotal();
  const productDiscount = calculateProductDiscount();
  
  let activeCoupon = appState.appliedCoupon;
  let couponDiscount = 0;
  
  if (activeCoupon) {
    const couponDef = COUPONS[activeCoupon];
    if (couponDef && subtotal < couponDef.minSubtotal) {
      couponDiscount = 0;
    } else {
      couponDiscount = calculateCouponDiscount(subtotal);
    }
  }

  const taxableAmount = Math.max(0, subtotal - couponDiscount);
  const gst = calculateGST(taxableAmount);
  const deliveryCharge = calculateDeliveryCharge(subtotal, activeCoupon);
  const grandTotal = Math.max(0, taxableAmount + gst + deliveryCharge);

  return {
    subtotal,
    productDiscount,
    couponCode: activeCoupon,
    couponDiscount,
    taxableAmount,
    gst,
    deliveryCharge,
    grandTotal,
    totalItems: appState.cart.reduce((count, item) => count + item.quantity, 0)
  };
}

/* ==========================================================================
   6. Shopping Cart Operations
   ========================================================================== */

/**
 * Add a product to the cart or increment its quantity
 * @param {string} productId
 * @param {number} quantityToAdd
 */
function addToCart(productId, quantityToAdd = 1) {
  const product = getProductById(productId);
  if (!product) {
    showToast('Product not found.', 'error');
    return;
  }

  const existingItemIndex = appState.cart.findIndex(i => i.productId === productId);

  if (existingItemIndex > -1) {
    const currentQty = appState.cart[existingItemIndex].quantity;
    const newQty = currentQty + quantityToAdd;

    if (newQty > product.stock) {
      showToast(`Cannot add more. Maximum available stock is ${product.stock} units!`, 'error');
      appState.cart[existingItemIndex].quantity = product.stock;
    } else {
      appState.cart[existingItemIndex].quantity = newQty;
      showToast(`Updated "${product.name}" quantity to ${newQty}.`, 'success');
    }
  } else {
    if (quantityToAdd > product.stock) {
      showToast(`Only ${product.stock} units are currently in stock!`, 'error');
      return;
    }
    appState.cart.push({
      productId,
      quantity: quantityToAdd
    });
    showToast(`Added "${product.name}" to your cart!`, 'success');
  }

  saveCartToStorage();
  renderCart();
  updateCartBadge();
  animateCartBadge();
}

/**
 * Update the quantity of an existing item in the cart
 * @param {string} productId
 * @param {number} newQuantity
 */
function updateQuantity(productId, newQuantity) {
  const product = getProductById(productId);
  if (!product) return;

  const itemIndex = appState.cart.findIndex(i => i.productId === productId);
  if (itemIndex === -1) return;

  const targetQty = Number(newQuantity);

  if (targetQty < 1) {
    removeFromCart(productId);
    return;
  }

  if (targetQty > product.stock) {
    showToast(`Cannot exceed maximum available stock of ${product.stock} units.`, 'error');
    appState.cart[itemIndex].quantity = product.stock;
  } else {
    appState.cart[itemIndex].quantity = targetQty;
  }

  saveCartToStorage();
  renderCart();
  updateCartBadge();
}

/**
 * Remove an item from the cart
 * @param {string} productId
 */
function removeFromCart(productId) {
  const product = getProductById(productId);
  appState.cart = appState.cart.filter(i => i.productId !== productId);

  saveCartToStorage();
  renderCart();
  updateCartBadge();

  if (product) {
    showToast(`Removed "${product.name}" from cart.`, 'info');
  }
}

/**
 * Clear all items from the cart
 */
function clearCart() {
  if (appState.cart.length === 0) {
    showToast('Your cart is already empty.', 'info');
    return;
  }

  showConfirmDialog(
    'Clear Shopping Cart?',
    'Are you sure you want to remove all items from your cart? This cannot be undone.',
    () => {
      appState.cart = [];
      appState.appliedCoupon = null;
      saveCartToStorage();
      renderCart();
      updateCartBadge();
      showToast('Shopping cart has been cleared.', 'info');
    }
  );
}

/**
 * Update live item-count badge on the navbar cart button
 */
function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  const count = appState.cart.reduce((sum, item) => sum + item.quantity, 0);
  if (badge) {
    badge.textContent = count;
  }
}

/**
 * Animate the cart badge with a bounce effect
 */
function animateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  badge.classList.remove('bump');
  void badge.offsetWidth;
  badge.classList.add('bump');
}

/**
 * Apply a coupon code
 * @param {string} code
 */
function applyCoupon(code) {
  const cleanCode = (code || '').trim().toUpperCase();

  if (!cleanCode) {
    setCouponFeedback('Please enter a coupon code.', 'error');
    return;
  }

  const totals = calculateAllTotals();
  if (totals.subtotal <= 0) {
    setCouponFeedback('Your cart is empty. Add products before applying a coupon.', 'error');
    return;
  }

  if (!COUPONS[cleanCode]) {
    setCouponFeedback(`Invalid coupon "${cleanCode}". Try SAVE10, SAVE200, or FREESHIP.`, 'error');
    return;
  }

  if (appState.appliedCoupon === cleanCode) {
    setCouponFeedback(`Coupon "${cleanCode}" is already active on this order.`, 'error');
    return;
  }

  const couponDef = COUPONS[cleanCode];

  if (totals.subtotal < couponDef.minSubtotal) {
    setCouponFeedback(
      `Coupon ${cleanCode} requires a minimum order subtotal of ${formatCurrency(couponDef.minSubtotal)} (Current: ${formatCurrency(totals.subtotal)}).`,
      'error'
    );
    return;
  }

  appState.appliedCoupon = cleanCode;
  saveCartToStorage();
  renderCart();
  setCouponFeedback(`Coupon "${cleanCode}" applied successfully!`, 'success');
  showToast(`Coupon "${cleanCode}" applied!`, 'success');
}

/**
 * Remove currently applied coupon
 */
function removeCoupon() {
  if (!appState.appliedCoupon) return;
  const removedCode = appState.appliedCoupon;
  appState.appliedCoupon = null;
  saveCartToStorage();
  renderCart();
  setCouponFeedback(`Coupon "${removedCode}" was removed.`, 'info');
  showToast(`Coupon removed.`, 'info');
}

/**
 * Set feedback message under coupon input
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 */
function setCouponFeedback(message, type) {
  const el = document.getElementById('couponFeedbackMessage');
  if (!el) return;
  el.textContent = message;
  el.className = `coupon-feedback-message ${type}`;
  el.classList.remove('hidden');

  setTimeout(() => {
    el.classList.add('hidden');
  }, 4500);
}

/* ==========================================================================
   7. Rendering Cart Interface & Calculations
   ========================================================================== */

/**
 * Render the slide-out cart drawer contents and update order summary
 */
function renderCart() {
  const itemsContainer = document.getElementById('cartItemsContainer');
  const emptyState = document.getElementById('cartEmptyState');
  const cartFooter = document.getElementById('cartDrawerFooter');
  const cartHeaderCount = document.getElementById('cartHeaderCount');
  const deliveryBar = document.getElementById('deliveryThresholdBar');

  const totals = calculateAllTotals();

  if (cartHeaderCount) {
    cartHeaderCount.textContent = totals.totalItems;
  }

  if (appState.cart.length === 0) {
    if (itemsContainer) itemsContainer.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    if (cartFooter) cartFooter.classList.add('hidden');
    if (deliveryBar) deliveryBar.classList.add('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');
  if (cartFooter) cartFooter.classList.remove('hidden');
  if (deliveryBar) deliveryBar.classList.remove('hidden');

  const deliveryText = document.getElementById('deliveryThresholdText');
  const progressFill = document.getElementById('deliveryProgressFill');
  if (deliveryText && progressFill) {
    if (totals.subtotal >= DELIVERY_SETTINGS.THRESHOLD_FREE || appState.appliedCoupon === 'FREESHIP') {
      deliveryText.innerHTML = `🎉 Congratulations! You have unlocked <strong>FREE Delivery</strong>!`;
      progressFill.style.width = '100%';
    } else {
      const remaining = DELIVERY_SETTINGS.THRESHOLD_FREE - totals.subtotal;
      const percent = Math.min(100, Math.round((totals.subtotal / DELIVERY_SETTINGS.THRESHOLD_FREE) * 100));
      deliveryText.innerHTML = `Add <strong>${formatCurrency(remaining)}</strong> more to get <strong>FREE Delivery</strong>!`;
      progressFill.style.width = `${percent}%`;
    }
  }

  if (itemsContainer) {
    itemsContainer.innerHTML = appState.cart.map(item => {
      const product = getProductById(item.productId);
      if (!product) return '';

      const itemSubtotal = product.price * item.quantity;
      const isMinusDisabled = item.quantity <= 1;
      const isPlusDisabled = item.quantity >= product.stock;

      return `
        <div class="cart-item-card" data-product-id="${product.id}">
          <img 
            src="${product.image}" 
            alt="${product.name}" 
            class="cart-item-img ${product.imageFit === 'contain' ? 'img-contain' : ''}"
            onerror="this.onerror=null; this.src='assets/product-fallback.svg';"
          >
          <div class="cart-item-details">
            <h4 class="cart-item-title" title="${product.name}">${product.name}</h4>
            <span class="cart-item-unit-price">${formatCurrency(product.price)} each</span>
            <div class="cart-item-qty-row">
              <div class="cart-qty-ctrl">
                <button 
                  type="button" 
                  class="cart-qty-btn btn-cart-minus" 
                  data-id="${product.id}" 
                  ${isMinusDisabled ? 'disabled' : ''} 
                  aria-label="Decrease quantity"
                >
                  <i data-lucide="minus"></i>
                </button>
                <span class="cart-qty-num">${item.quantity}</span>
                <button 
                  type="button" 
                  class="cart-qty-btn btn-cart-plus" 
                  data-id="${product.id}" 
                  ${isPlusDisabled ? 'disabled' : ''} 
                  aria-label="Increase quantity"
                >
                  <i data-lucide="plus"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="cart-item-right">
            <button 
              type="button" 
              class="cart-item-remove-btn" 
              data-id="${product.id}" 
              title="Remove product" 
              aria-label="Remove ${product.name}"
            >
              <i data-lucide="trash-2"></i>
            </button>
            <span class="cart-item-subtotal">${formatCurrency(itemSubtotal)}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  const appliedPill = document.getElementById('appliedCouponPill');
  const appliedCodeSpan = document.getElementById('appliedCouponCode');
  const appliedDescSpan = document.getElementById('appliedCouponDesc');
  const couponInput = document.getElementById('couponInput');

  if (appState.appliedCoupon && COUPONS[appState.appliedCoupon]) {
    const couponInfo = COUPONS[appState.appliedCoupon];
    if (appliedPill) appliedPill.classList.remove('hidden');
    if (appliedCodeSpan) appliedCodeSpan.textContent = couponInfo.code;
    if (appliedDescSpan) {
      if (couponInfo.type === 'PERCENTAGE') {
        appliedDescSpan.textContent = `– 10% Off (${formatCurrency(totals.couponDiscount)})`;
      } else if (couponInfo.type === 'FLAT') {
        appliedDescSpan.textContent = `– Flat ${formatCurrency(couponInfo.value)} Off`;
      } else if (couponInfo.type === 'FREESHIP') {
        appliedDescSpan.textContent = `– Free Shipping Waived`;
      }
    }
    if (couponInput) couponInput.value = '';
  } else {
    if (appliedPill) appliedPill.classList.add('hidden');
  }

  const calcSubtotal = document.getElementById('calcSubtotal');
  const calcProductDiscount = document.getElementById('calcProductDiscount');
  const calcProductDiscountRow = document.getElementById('calcProductDiscountRow');
  const calcCouponRow = document.getElementById('calcCouponRow');
  const calcCouponLabel = document.getElementById('calcCouponLabel');
  const calcCouponDiscount = document.getElementById('calcCouponDiscount');
  const calcTaxable = document.getElementById('calcTaxableAmount');
  const calcGST = document.getElementById('calcGST');
  const calcDelivery = document.getElementById('calcDelivery');
  const calcGrandTotal = document.getElementById('calcGrandTotal');

  if (calcSubtotal) calcSubtotal.textContent = formatCurrency(totals.subtotal);

  if (calcProductDiscount && calcProductDiscountRow) {
    if (totals.productDiscount > 0) {
      calcProductDiscount.textContent = `– ${formatCurrency(totals.productDiscount)}`;
      calcProductDiscountRow.classList.remove('hidden');
    } else {
      calcProductDiscountRow.classList.add('hidden');
    }
  }

  if (calcCouponRow && calcCouponDiscount && calcCouponLabel) {
    if (totals.couponDiscount > 0 || appState.appliedCoupon === 'FREESHIP') {
      calcCouponRow.classList.remove('hidden');
      calcCouponLabel.textContent = appState.appliedCoupon;
      calcCouponDiscount.textContent = `– ${formatCurrency(totals.couponDiscount)}`;
    } else {
      calcCouponRow.classList.add('hidden');
    }
  }

  if (calcTaxable) calcTaxable.textContent = formatCurrency(totals.taxableAmount);
  if (calcGST) calcGST.textContent = formatCurrency(totals.gst);

  if (calcDelivery) {
    if (totals.deliveryCharge === 0) {
      calcDelivery.innerHTML = '<span class="text-success font-semibold">FREE</span>';
    } else {
      calcDelivery.textContent = formatCurrency(totals.deliveryCharge);
    }
  }

  if (calcGrandTotal) calcGrandTotal.textContent = formatCurrency(totals.grandTotal);

  refreshIcons();
}

/* ==========================================================================
   8. Product Catalog Rendering, Filtering & Sorting
   ========================================================================== */

/**
 * Filter products based on search, category, price range, rating, stock, and wishlist
 * @returns {Array<Object>}
 */
function filterProducts() {
  const { search, category, minPrice, maxPrice, minRating, inStockOnly, wishlistOnly } = appState.filters;

  return productCatalog.filter(product => {
    // 1. Wishlist Only Filter
    if (wishlistOnly && !appState.wishlist.includes(product.id)) {
      return false;
    }

    // 2. Search Query Match (by name, brand, category, or description)
    if (search) {
      const q = search.toLowerCase().trim();
      const nameMatch = product.name.toLowerCase().includes(q);
      const brandMatch = product.brand ? product.brand.toLowerCase().includes(q) : false;
      const catMatch = product.category.toLowerCase().includes(q);
      const descMatch = product.description.toLowerCase().includes(q);
      if (!nameMatch && !brandMatch && !catMatch && !descMatch) return false;
    }

    // 3. Category Filter Match
    if (category && category !== 'All') {
      const normFilter = category.toLowerCase().replace(/[–—]/g, '-').trim();
      const normCat = product.category.toLowerCase().replace(/[–—]/g, '-').trim();
      if (normCat !== normFilter && !normCat.startsWith(normFilter + ' -') && !normCat.startsWith(normFilter + ' –')) {
        return false;
      }
    }

    // 4. Price Range Filter Match
    if (minPrice !== null && !isNaN(minPrice)) {
      if (product.price < minPrice) return false;
    }
    if (maxPrice !== null && !isNaN(maxPrice)) {
      if (product.price > maxPrice) return false;
    }

    // 5. Minimum Star Rating Filter Match
    if (minRating > 0) {
      if (product.rating < minRating) return false;
    }

    // 6. In-Stock Only Filter Match
    if (inStockOnly) {
      if (product.stock <= 0) return false;
    }

    return true;
  });
}

/**
 * Sort products by selected criteria
 * @param {Array<Object>} productsList
 * @param {string} criteria
 * @returns {Array<Object>}
 */
function sortProducts(productsList, criteria) {
  const sorted = [...productsList];

  switch (criteria) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'discount':
      return sorted.sort((a, b) => b.discountPercent - a.discountPercent);
    case 'newest':
      return sorted.reverse();
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'featured':
    default:
      return sorted;
  }
}

/**
 * Render dynamic product cards into the catalog grid container
 */
function renderProducts() {
  const gridContainer = document.getElementById('productsGrid');
  const emptyState = document.getElementById('emptyCatalogState');
  const countBadge = document.getElementById('resultsCountBadge');
  const emptyMessage = document.getElementById('emptyCatalogMessage');

  if (!gridContainer) return;

  const filtered = filterProducts();
  const sorted = sortProducts(filtered, appState.filters.sort);

  if (countBadge) {
    countBadge.textContent = `Showing ${sorted.length} of ${productCatalog.length} products`;
  }

  if (sorted.length === 0) {
    gridContainer.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    if (emptyMessage) {
      if (appState.filters.wishlistOnly) {
        emptyMessage.textContent = 'Your wishlist is currently empty. Click the heart icon on any product to save it here!';
      } else if (appState.filters.search) {
        emptyMessage.textContent = `No products found matching "${appState.filters.search}". Try clearing search or adjusting your filters.`;
      } else {
        emptyMessage.textContent = 'No products match the selected category, price, or rating parameters.';
      }
    }
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  gridContainer.innerHTML = sorted.map(product => {
    let stockStatusHtml = '';
    if (product.stock > 10) {
      stockStatusHtml = `<span class="stock-pill stock-in">In Stock</span>`;
    } else if (product.stock > 0) {
      stockStatusHtml = `<span class="stock-pill stock-low">Only ${product.stock} left!</span>`;
    } else {
      stockStatusHtml = `<span class="stock-pill stock-out">Out of Stock</span>`;
    }

    const isWishlisted = appState.wishlist.includes(product.id);
    const fitClass = product.imageFit === 'contain' ? 'img-contain' : 'img-cover';

    return `
      <article class="product-card" data-product-id="${product.id}">
        
        <div class="product-image-container">
          <img 
            src="${product.image}" 
            alt="${product.name}" 
            class="product-image ${fitClass}"
            loading="lazy"
            onerror="this.onerror=null; this.src='assets/product-fallback.svg';"
          >
          
          <!-- Card Wishlist Button -->
          <button 
            type="button" 
            class="card-wishlist-btn ${isWishlisted ? 'active' : ''}" 
            data-id="${product.id}" 
            title="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}"
            aria-label="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}"
          >
            <i data-lucide="heart"></i>
          </button>

          ${product.discountPercent > 0 ? `<span class="discount-badge">${product.discountPercent}% OFF</span>` : ''}
          ${product.badge ? `<span class="product-badge-secondary">${product.badge}</span>` : ''}
        </div>

        <div class="product-body">
          <div class="product-category-row">
            <span class="product-category-label">${product.category}</span>
            ${stockStatusHtml}
          </div>

          <div class="product-brand-tag">${product.brand || ''}</div>

          <h3 class="product-title" title="${product.name}">${product.name}</h3>

          <div class="product-rating-row">
            <div class="rating-stars">
              ${generateStarRatingHtml(product.rating)}
            </div>
            <span class="rating-score">${product.rating}</span>
            <span class="rating-count">(${product.reviewCount})</span>
          </div>

          <div class="product-price-row">
            <span class="selling-price">${formatCurrency(product.price)}</span>
            ${product.originalPrice > product.price ? `<span class="original-price">${formatCurrency(product.originalPrice)}</span>` : ''}
            ${product.originalPrice > product.price ? `<span class="savings-tag">Save ${formatCurrency(product.originalPrice - product.price)}</span>` : ''}
          </div>

          <div class="product-actions-row">
            <button 
              type="button" 
              class="btn btn-primary btn-add-cart" 
              data-id="${product.id}" 
              aria-label="Add ${product.name} to cart"
            >
              <i data-lucide="shopping-cart"></i>
              <span>Add</span>
            </button>
            
            <button 
              type="button" 
              class="btn btn-secondary btn-details" 
              data-id="${product.id}" 
              aria-label="Quick view ${product.name}"
            >
              <i data-lucide="eye"></i>
              <span>View</span>
            </button>
          </div>
        </div>

      </article>
    `;
  }).join('');

  refreshIcons();
}

/**
 * Synchronize category card styles when category changes
 * @param {string} categoryName
 */
function updateCategoryCardsUi(categoryName) {
  const cards = document.querySelectorAll('.category-card');
  cards.forEach(card => {
    if (card.dataset.category && card.dataset.category.toLowerCase() === categoryName.toLowerCase()) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });

  const select = document.getElementById('categoryFilterSelect');
  if (select) {
    select.value = categoryName;
  }
}

/**
 * Reset all active filter parameters
 */
function resetAllFilters() {
  appState.filters = {
    search: '',
    category: 'All',
    minPrice: null,
    maxPrice: null,
    minRating: 0,
    inStockOnly: false,
    wishlistOnly: false,
    sort: 'featured'
  };

  const globalSearch = document.getElementById('globalSearchInput');
  const mobileSearch = document.getElementById('mobileSearchInput');
  const clearBtn = document.getElementById('clearSearchBtn');
  const minPriceInput = document.getElementById('minPriceInput');
  const maxPriceInput = document.getElementById('maxPriceInput');
  const sortSelect = document.getElementById('sortSelect');
  const categorySelect = document.getElementById('categoryFilterSelect');
  const ratingSelect = document.getElementById('ratingFilterSelect');
  const inStockCheckbox = document.getElementById('inStockOnlyCheckbox');

  if (globalSearch) globalSearch.value = '';
  if (mobileSearch) mobileSearch.value = '';
  if (clearBtn) clearBtn.classList.add('hidden');
  if (minPriceInput) minPriceInput.value = '';
  if (maxPriceInput) maxPriceInput.value = '';
  if (sortSelect) sortSelect.value = 'featured';
  if (categorySelect) categorySelect.value = 'All';
  if (ratingSelect) ratingSelect.value = '0';
  if (inStockCheckbox) inStockCheckbox.checked = false;

  updateCategoryCardsUi('All');
  const openWishlistBtn = document.getElementById('openWishlistBtn');
  if (openWishlistBtn) openWishlistBtn.classList.remove('active');

  renderProducts();
  showToast('Filters reset to default.', 'info');
}

/* ==========================================================================
   9. Product Details Modal Management
   ========================================================================== */

/**
 * Open Product Details Modal with specific product information & related items
 * @param {string} productId
 */
function openProductModal(productId) {
  const product = getProductById(productId);
  if (!product) return;

  appState.activeModalProductId = productId;
  appState.activeModalQuantity = 1;

  const modal = document.getElementById('productModal');
  const modalImg = document.getElementById('modalProductImage');
  const modalBadge = document.getElementById('modalProductBadge');
  const modalCategory = document.getElementById('modalProductCategory');
  const modalBrand = document.getElementById('modalProductBrand');
  const modalTitle = document.getElementById('modalProductTitle');
  const modalStars = document.getElementById('modalProductStars');
  const modalScore = document.getElementById('modalProductScore');
  const modalReviews = document.getElementById('modalProductReviews');
  const modalPrice = document.getElementById('modalProductPrice');
  const modalOrigPrice = document.getElementById('modalProductOriginalPrice');
  const modalSavings = document.getElementById('modalProductSavings');
  const modalStock = document.getElementById('modalProductStock');
  const modalDesc = document.getElementById('modalProductDescription');
  const modalHighlights = document.getElementById('modalProductHighlights');
  const modalQtyInput = document.getElementById('modalQtyInput');
  const modalRelatedGrid = document.getElementById('modalRelatedGrid');

  if (modalImg) {
    modalImg.src = product.image;
    modalImg.className = product.imageFit === 'contain' ? 'img-contain' : 'img-cover';
    modalImg.onerror = () => { modalImg.src = 'assets/product-fallback.svg'; };
  }

  if (modalBadge) {
    if (product.discountPercent > 0) {
      modalBadge.textContent = `${product.discountPercent}% OFF`;
      modalBadge.classList.remove('hidden');
    } else {
      modalBadge.classList.add('hidden');
    }
  }

  if (modalCategory) modalCategory.textContent = product.category;
  if (modalBrand) modalBrand.textContent = product.brand ? `• ${product.brand}` : '';
  if (modalTitle) modalTitle.textContent = product.name;
  if (modalStars) modalStars.innerHTML = generateStarRatingHtml(product.rating);
  if (modalScore) modalScore.textContent = product.rating;
  if (modalReviews) modalReviews.textContent = `(${product.reviewCount} customer reviews)`;
  if (modalPrice) modalPrice.textContent = formatCurrency(product.price);
  
  if (modalOrigPrice) {
    if (product.originalPrice > product.price) {
      modalOrigPrice.textContent = formatCurrency(product.originalPrice);
      modalOrigPrice.classList.remove('hidden');
    } else {
      modalOrigPrice.classList.add('hidden');
    }
  }

  if (modalSavings) {
    if (product.originalPrice > product.price) {
      modalSavings.textContent = `You Save ${formatCurrency(product.originalPrice - product.price)}`;
      modalSavings.classList.remove('hidden');
    } else {
      modalSavings.classList.add('hidden');
    }
  }

  if (modalStock) {
    if (product.stock > 10) {
      modalStock.innerHTML = `<i data-lucide="check-circle-2"></i><span>In Stock (${product.stock} units available)</span>`;
      modalStock.style.color = '#065f46';
    } else if (product.stock > 0) {
      modalStock.innerHTML = `<i data-lucide="alert-circle"></i><span>Hurry! Only ${product.stock} units left!</span>`;
      modalStock.style.color = '#b45309';
    } else {
      modalStock.innerHTML = `<i data-lucide="x-circle"></i><span>Currently Out of Stock</span>`;
      modalStock.style.color = '#991b1b';
    }
  }

  if (modalDesc) modalDesc.textContent = product.description;

  if (modalHighlights) {
    modalHighlights.innerHTML = (product.highlights || []).map(h => `<li>${h}</li>`).join('');
  }

  if (modalQtyInput) {
    modalQtyInput.value = 1;
    modalQtyInput.max = product.stock;
  }

  updateModalWishlistState(productId);

  // Render 3 Related Products from the same category
  if (modalRelatedGrid) {
    const relatedProducts = productCatalog
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 3);

    modalRelatedGrid.innerHTML = relatedProducts.map(rel => `
      <div class="modal-related-card" data-id="${rel.id}" title="View ${rel.name}">
        <img 
          src="${rel.image}" 
          alt="${rel.name}" 
          class="modal-related-img ${rel.imageFit === 'contain' ? 'img-contain' : ''}"
          onerror="this.onerror=null; this.src='assets/product-fallback.svg';"
        >
        <div class="modal-related-name">${rel.name}</div>
        <div class="modal-related-price">${formatCurrency(rel.price)}</div>
      </div>
    `).join('');
  }

  modal.classList.remove('hidden');
  document.body.classList.add('no-scroll');
  refreshIcons();
}

/**
 * Close Product Details Modal
 */
function closeProductModal() {
  const modal = document.getElementById('productModal');
  if (modal) modal.classList.add('hidden');
  document.body.classList.remove('no-scroll');
  appState.activeModalProductId = null;
  appState.activeModalQuantity = 1;
}

/* ==========================================================================
   10. Drawer & Modal Toggle Functions
   ========================================================================== */

function openCart() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (drawer && overlay) {
    renderCart();
    overlay.classList.remove('hidden');
    drawer.classList.remove('hidden');
    drawer.classList.remove('closing');
    document.body.classList.add('no-scroll');
  }
}

function closeCart() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (drawer && overlay) {
    drawer.classList.add('closing');
    setTimeout(() => {
      drawer.classList.add('hidden');
      overlay.classList.add('hidden');
      drawer.classList.remove('closing');
      document.body.classList.remove('no-scroll');
    }, 250);
  }
}

function openCheckout() {
  if (appState.cart.length === 0) {
    showToast('Your cart is empty. Please add items before checking out.', 'error');
    return;
  }

  closeCart();

  const checkoutModal = document.getElementById('checkoutModal');
  const totals = calculateAllTotals();

  const itemsContainer = document.getElementById('checkoutItemsList');
  if (itemsContainer) {
    itemsContainer.innerHTML = appState.cart.map(item => {
      const product = getProductById(item.productId);
      if (!product) return '';
      return `
        <div class="checkout-item-mini">
          <img src="${product.image}" alt="${product.name}" class="co-mini-img ${product.imageFit === 'contain' ? 'img-contain' : ''}" onerror="this.onerror=null; this.src='assets/product-fallback.svg';">
          <div class="co-mini-details">
            <div class="co-mini-name">${product.name}</div>
            <div class="co-mini-qty">Qty: ${item.quantity} &bull; ${formatCurrency(product.price)}</div>
          </div>
          <div class="co-mini-price">${formatCurrency(product.price * item.quantity)}</div>
        </div>
      `;
    }).join('');
  }

  const coSubtotal = document.getElementById('coSubtotal');
  const coCouponRow = document.getElementById('coCouponRow');
  const coCouponDiscount = document.getElementById('coCouponDiscount');
  const coTaxable = document.getElementById('coTaxable');
  const coGST = document.getElementById('coGST');
  const coDelivery = document.getElementById('coDelivery');
  const coGrandTotal = document.getElementById('coGrandTotal');
  const placeOrderBtnText = document.getElementById('placeOrderBtnText');

  if (coSubtotal) coSubtotal.textContent = formatCurrency(totals.subtotal);

  if (coCouponRow && coCouponDiscount) {
    if (totals.couponDiscount > 0) {
      coCouponRow.classList.remove('hidden');
      coCouponDiscount.textContent = `– ${formatCurrency(totals.couponDiscount)}`;
    } else {
      coCouponRow.classList.add('hidden');
    }
  }

  if (coTaxable) coTaxable.textContent = formatCurrency(totals.taxableAmount);
  if (coGST) coGST.textContent = formatCurrency(totals.gst);
  if (coDelivery) {
    coDelivery.innerHTML = totals.deliveryCharge === 0 ? '<span class="text-success font-semibold">FREE</span>' : formatCurrency(totals.deliveryCharge);
  }
  if (coGrandTotal) coGrandTotal.textContent = formatCurrency(totals.grandTotal);
  if (placeOrderBtnText) placeOrderBtnText.textContent = `Place Demo Order (${formatCurrency(totals.grandTotal)})`;

  if (checkoutModal) {
    checkoutModal.classList.remove('hidden');
    document.body.classList.add('no-scroll');
  }

  refreshIcons();
}

function closeCheckout() {
  const checkoutModal = document.getElementById('checkoutModal');
  if (checkoutModal) checkoutModal.classList.add('hidden');
  document.body.classList.remove('no-scroll');
}

/* ==========================================================================
   11. Checkout Validation & Simulated Order Placement
   ========================================================================== */

/**
 * Validate customer checkout form fields
 * @returns {boolean}
 */
function validateCheckoutForm() {
  let isValid = true;

  const nameInput = document.getElementById('custName');
  const emailInput = document.getElementById('custEmail');
  const phoneInput = document.getElementById('custPhone');
  const houseInput = document.getElementById('addrHouse');
  const streetInput = document.getElementById('addrStreet');
  const cityInput = document.getElementById('addrCity');
  const stateInput = document.getElementById('addrState');
  const pinInput = document.getElementById('addrPin');

  const errName = document.getElementById('errCustName');
  const errEmail = document.getElementById('errCustEmail');
  const errPhone = document.getElementById('errCustPhone');
  const errHouse = document.getElementById('errAddrHouse');
  const errStreet = document.getElementById('errAddrStreet');
  const errCity = document.getElementById('errAddrCity');
  const errState = document.getElementById('errAddrState');
  const errPin = document.getElementById('errAddrPin');

  [nameInput, emailInput, phoneInput, houseInput, streetInput, cityInput, stateInput, pinInput].forEach(input => {
    if (input) input.classList.remove('is-invalid');
  });
  [errName, errEmail, errPhone, errHouse, errStreet, errCity, errState, errPin].forEach(err => {
    if (err) err.classList.add('hidden');
  });

  // Name validation (min 3 characters)
  if (!nameInput || !nameInput.value || nameInput.value.trim().length < 3) {
    if (nameInput) nameInput.classList.add('is-invalid');
    if (errName) errName.classList.remove('hidden');
    isValid = false;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailInput || !emailInput.value || !emailRegex.test(emailInput.value.trim())) {
    if (emailInput) emailInput.classList.add('is-invalid');
    if (errEmail) errEmail.classList.remove('hidden');
    isValid = false;
  }

  // Indian Phone validation (10 digits starting with 6-9)
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneInput || !phoneInput.value || !phoneRegex.test(phoneInput.value.trim())) {
    if (phoneInput) phoneInput.classList.add('is-invalid');
    if (errPhone) errPhone.classList.remove('hidden');
    isValid = false;
  }

  // House / Flat validation
  if (!houseInput || !houseInput.value || houseInput.value.trim().length === 0) {
    if (houseInput) houseInput.classList.add('is-invalid');
    if (errHouse) errHouse.classList.remove('hidden');
    isValid = false;
  }

  // Street validation
  if (!streetInput || !streetInput.value || streetInput.value.trim().length === 0) {
    if (streetInput) streetInput.classList.add('is-invalid');
    if (errStreet) errStreet.classList.remove('hidden');
    isValid = false;
  }

  // City validation
  if (!cityInput || !cityInput.value || cityInput.value.trim().length === 0) {
    if (cityInput) cityInput.classList.add('is-invalid');
    if (errCity) errCity.classList.remove('hidden');
    isValid = false;
  }

  // State validation
  if (!stateInput || !stateInput.value || stateInput.value.trim() === '') {
    if (stateInput) stateInput.classList.add('is-invalid');
    if (errState) errState.classList.remove('hidden');
    isValid = false;
  }

  // Indian PIN Code validation (6 digits)
  const pinRegex = /^[1-9][0-9]{5}$/;
  if (!pinInput || !pinInput.value || !pinRegex.test(pinInput.value.trim())) {
    if (pinInput) pinInput.classList.add('is-invalid');
    if (errPin) errPin.classList.remove('hidden');
    isValid = false;
  }

  return isValid;
}

/**
 * Handle order submission and simulate order placement
 * @param {Event} e
 */
function placeOrder(e) {
  if (e) e.preventDefault();

  if (appState.cart.length === 0) {
    showToast('Your cart is empty. Add products to place an order.', 'error');
    return;
  }

  if (!validateCheckoutForm()) {
    showToast('Please fix the highlighted fields in the form.', 'error');
    return;
  }

  const nameEl = document.getElementById('custName');
  const emailEl = document.getElementById('custEmail');
  const phoneEl = document.getElementById('custPhone');
  const houseEl = document.getElementById('addrHouse');
  const streetEl = document.getElementById('addrStreet');
  const cityEl = document.getElementById('addrCity');
  const stateEl = document.getElementById('addrState');
  const pinEl = document.getElementById('addrPin');

  const name = nameEl ? nameEl.value.trim() : '';
  const email = emailEl ? emailEl.value.trim() : '';
  const phone = phoneEl ? phoneEl.value.trim() : '';
  const house = houseEl ? houseEl.value.trim() : '';
  const street = streetEl ? streetEl.value.trim() : '';
  const city = cityEl ? cityEl.value.trim() : '';
  const state = stateEl ? stateEl.value.trim() : '';
  const pin = pinEl ? pinEl.value.trim() : '';

  const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked');
  let paymentMethodLabel = 'Cash on Delivery';
  if (selectedPayment) {
    if (selectedPayment.value === 'UPI') paymentMethodLabel = 'Demo UPI Simulation';
    else if (selectedPayment.value === 'CARD') paymentMethodLabel = 'Demo Card Simulation';
  }

  const totals = calculateAllTotals();
  const orderId = `SE-2026-${Math.floor(10000 + Math.random() * 90000)}`;

  // Calculate estimated delivery date (4 days from today in Asia/Kolkata timezone)
  const deliveryDateObj = new Date();
  deliveryDateObj.setDate(deliveryDateObj.getDate() + 4);
  const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: BUSINESS_CONFIG.timeZone };
  const estimatedDeliveryString = deliveryDateObj.toLocaleDateString(BUSINESS_CONFIG.locale, options);

  const purchasedItems = [...appState.cart];

  const confirmedOrderId = document.getElementById('confirmedOrderId');
  const confirmedCustName = document.getElementById('confirmedCustomerName');
  const confirmedPayment = document.getElementById('confirmedPaymentMethod');
  const confirmedAddress = document.getElementById('confirmedAddress');
  const confirmedDate = document.getElementById('confirmedDeliveryDate');
  const confirmedItemsList = document.getElementById('confirmedItemsList');
  const confirmedTotal = document.getElementById('confirmedTotalAmount');

  if (confirmedOrderId) confirmedOrderId.textContent = orderId;
  if (confirmedCustName) confirmedCustName.textContent = name;
  if (confirmedPayment) confirmedPayment.textContent = paymentMethodLabel;
  if (confirmedAddress) confirmedAddress.textContent = `${house}, ${street}, ${city}, ${state} - ${pin}`;
  if (confirmedDate) confirmedDate.textContent = estimatedDeliveryString;
  if (confirmedTotal) confirmedTotal.textContent = formatCurrency(totals.grandTotal);

  if (confirmedItemsList) {
    confirmedItemsList.innerHTML = purchasedItems.map(item => {
      const product = getProductById(item.productId);
      if (!product) return '';
      return `
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8125rem;">
          <span>${product.name} × <strong>${item.quantity}</strong></span>
          <span style="font-weight: 600;">${formatCurrency(product.price * item.quantity)}</span>
        </div>
      `;
    }).join('');
  }

  // Clear cart in state & storage
  appState.cart = [];
  appState.appliedCoupon = null;
  saveCartToStorage();
  updateCartBadge();
  renderCart();

  // Reset checkout form and restore default Coimbatore, Tamil Nadu
  const form = document.getElementById('checkoutForm');
  if (form) {
    form.reset();
    const cityInput = document.getElementById('addrCity');
    const stateInput = document.getElementById('addrState');
    if (cityInput) cityInput.value = BUSINESS_CONFIG.city;
    if (stateInput) stateInput.value = BUSINESS_CONFIG.state;
  }

  closeCheckout();
  const confirmModal = document.getElementById('orderConfirmModal');
  if (confirmModal) {
    confirmModal.classList.remove('hidden');
    document.body.classList.add('no-scroll');
  }

  refreshIcons();
}

/* ==========================================================================
   12. Legal & Information Modals Helper
   ========================================================================== */
function openInfoModal(title, contentHtml) {
  const modal = document.getElementById('infoModal');
  const titleEl = document.getElementById('infoModalTitle');
  const bodyEl = document.getElementById('infoModalBody');
  if (titleEl) titleEl.textContent = title;
  if (bodyEl) bodyEl.innerHTML = contentHtml;
  if (modal) {
    modal.classList.remove('hidden');
    document.body.classList.add('no-scroll');
  }
}

function closeInfoModal() {
  const modal = document.getElementById('infoModal');
  if (modal) modal.classList.add('hidden');
  document.body.classList.remove('no-scroll');
}

/* ==========================================================================
   13. Event Listeners & Interactive Wiring
   ========================================================================== */

function setupEventListeners() {

  // Sticky Header Scroll Effect
  window.addEventListener('scroll', () => {
    const header = document.getElementById('mainHeader');
    if (header) {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  });

  // Search Input Listeners (Global & Mobile)
  const globalSearchInput = document.getElementById('globalSearchInput');
  const mobileSearchInput = document.getElementById('mobileSearchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');

  function handleSearchUpdate(query) {
    appState.filters.search = query;
    if (clearSearchBtn) {
      if (query.trim()) {
        clearSearchBtn.classList.remove('hidden');
      } else {
        clearSearchBtn.classList.add('hidden');
      }
    }
    renderProducts();
  }

  if (globalSearchInput) {
    globalSearchInput.addEventListener('input', (e) => {
      handleSearchUpdate(e.target.value);
      if (mobileSearchInput) mobileSearchInput.value = e.target.value;
    });
  }

  if (mobileSearchInput) {
    mobileSearchInput.addEventListener('input', (e) => {
      handleSearchUpdate(e.target.value);
      if (globalSearchInput) globalSearchInput.value = e.target.value;
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (globalSearchInput) globalSearchInput.value = '';
      if (mobileSearchInput) mobileSearchInput.value = '';
      handleSearchUpdate('');
      globalSearchInput.focus();
    });
  }

  // Mobile Hamburger Menu Toggle
  const mobileToggleBtn = document.getElementById('mobileMenuToggle');
  const mobileDrawer = document.getElementById('mobileNavDrawer');
  const menuOpenIcon = document.getElementById('menuOpenIcon');
  const menuCloseIcon = document.getElementById('menuCloseIcon');

  if (mobileToggleBtn && mobileDrawer) {
    mobileToggleBtn.addEventListener('click', () => {
      const isExpanded = mobileDrawer.classList.toggle('hidden');
      mobileToggleBtn.setAttribute('aria-expanded', !isExpanded);
      if (menuOpenIcon && menuCloseIcon) {
        menuOpenIcon.classList.toggle('hidden');
        menuCloseIcon.classList.toggle('hidden');
      }
    });

    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.add('hidden');
        if (menuOpenIcon) menuOpenIcon.classList.remove('hidden');
        if (menuCloseIcon) menuCloseIcon.classList.add('hidden');
      });
    });
  }

  // Wishlist Navbar Button Toggle
  const openWishlistBtn = document.getElementById('openWishlistBtn');
  if (openWishlistBtn) {
    openWishlistBtn.addEventListener('click', () => {
      appState.filters.wishlistOnly = !appState.filters.wishlistOnly;
      openWishlistBtn.classList.toggle('active', appState.filters.wishlistOnly);
      
      const countBadge = document.getElementById('resultsCountBadge');
      if (appState.filters.wishlistOnly) {
        showToast(`Filtering by your Wishlist (${appState.wishlist.length} saved items).`, 'info');
      } else {
        showToast('Restored full catalog view.', 'info');
      }
      
      renderProducts();
      const catalogEl = document.getElementById('catalog');
      if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Category Grid Buttons Click
  const categoryGrid = document.getElementById('categoriesGrid');
  if (categoryGrid) {
    categoryGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.category-card');
      if (!btn) return;
      const cat = btn.dataset.category;
      appState.filters.category = cat;
      appState.filters.wishlistOnly = false;
      if (openWishlistBtn) openWishlistBtn.classList.remove('active');
      updateCategoryCardsUi(cat);
      renderProducts();

      const catalogEl = document.getElementById('catalog');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Category Select Dropdown
  const catSelect = document.getElementById('categoryFilterSelect');
  if (catSelect) {
    catSelect.addEventListener('change', (e) => {
      const cat = e.target.value;
      appState.filters.category = cat;
      appState.filters.wishlistOnly = false;
      if (openWishlistBtn) openWishlistBtn.classList.remove('active');
      updateCategoryCardsUi(cat);
      renderProducts();
    });
  }

  // Price Range Filter Controls
  const minPriceInput = document.getElementById('minPriceInput');
  const maxPriceInput = document.getElementById('maxPriceInput');
  const applyPriceBtn = document.getElementById('applyPriceFilterBtn');

  if (applyPriceBtn) {
    applyPriceBtn.addEventListener('click', () => {
      const minVal = minPriceInput.value ? Number(minPriceInput.value) : null;
      const maxVal = maxPriceInput.value ? Number(maxPriceInput.value) : null;

      if (minVal !== null && maxVal !== null && minVal > maxVal) {
        showToast('Min price cannot be greater than Max price.', 'error');
        return;
      }

      appState.filters.minPrice = minVal;
      appState.filters.maxPrice = maxVal;
      renderProducts();
      showToast('Price filter applied.', 'info');
    });
  }

  // Rating Filter Select
  const ratingSelect = document.getElementById('ratingFilterSelect');
  if (ratingSelect) {
    ratingSelect.addEventListener('change', (e) => {
      appState.filters.minRating = Number(e.target.value) || 0;
      renderProducts();
    });
  }

  // In-Stock Only Checkbox
  const inStockCheckbox = document.getElementById('inStockOnlyCheckbox');
  if (inStockCheckbox) {
    inStockCheckbox.addEventListener('change', (e) => {
      appState.filters.inStockOnly = e.target.checked;
      renderProducts();
    });
  }

  // Sort Dropdown
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      appState.filters.sort = e.target.value;
      renderProducts();
    });
  }

  // Reset Filter Buttons
  const resetBtn = document.getElementById('resetFiltersBtn');
  const emptyResetBtn = document.getElementById('emptyResetBtn');
  if (resetBtn) resetBtn.addEventListener('click', resetAllFilters);
  if (emptyResetBtn) emptyResetBtn.addEventListener('click', resetAllFilters);

  // Hero Section Actions
  const heroDeals = document.getElementById('heroDealsBtn');
  if (heroDeals) {
    heroDeals.addEventListener('click', () => {
      appState.filters.sort = 'discount';
      if (sortSelect) sortSelect.value = 'discount';
      renderProducts();
      const catalogEl = document.getElementById('catalog');
      if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
      showToast('Sorted by highest discount!', 'info');
    });
  }

  // Catalog Product Grid Event Delegation (Wishlist, Add to Cart & Details)
  const productsGrid = document.getElementById('productsGrid');
  if (productsGrid) {
    productsGrid.addEventListener('click', (e) => {
      // 1. Wishlist Heart Button clicked
      const wishBtn = e.target.closest('.card-wishlist-btn');
      if (wishBtn) {
        e.stopPropagation();
        const id = wishBtn.dataset.id;
        toggleWishlist(id);
        return;
      }

      // 2. Add to Cart button clicked
      const addBtn = e.target.closest('.btn-add-cart');
      if (addBtn) {
        e.stopPropagation();
        const id = addBtn.dataset.id;
        addToCart(id, 1);
        return;
      }

      // 3. View Details button clicked
      const detailsBtn = e.target.closest('.btn-details');
      if (detailsBtn) {
        e.stopPropagation();
        const id = detailsBtn.dataset.id;
        openProductModal(id);
        return;
      }

      // 4. Card clicked anywhere else
      const card = e.target.closest('.product-card');
      if (card) {
        const id = card.dataset.productId;
        openProductModal(id);
      }
    });
  }

  // Product Modal Controls
  const productModal = document.getElementById('productModal');
  const closeProductModalBtn = document.getElementById('closeProductModalBtn');
  const modalMinusBtn = document.getElementById('modalQtyMinusBtn');
  const modalPlusBtn = document.getElementById('modalQtyPlusBtn');
  const modalQtyInput = document.getElementById('modalQtyInput');
  const modalAddToCartBtn = document.getElementById('modalAddToCartBtn');
  const modalWishlistBtn = document.getElementById('modalWishlistBtn');
  const modalRelatedGrid = document.getElementById('modalRelatedGrid');

  if (closeProductModalBtn) closeProductModalBtn.addEventListener('click', closeProductModal);

  if (productModal) {
    productModal.addEventListener('click', (e) => {
      if (e.target === productModal) closeProductModal();
    });
  }

  if (modalMinusBtn && modalPlusBtn && modalQtyInput) {
    modalMinusBtn.addEventListener('click', () => {
      const cur = Number(modalQtyInput.value) || 1;
      if (cur > 1) {
        modalQtyInput.value = cur - 1;
        appState.activeModalQuantity = cur - 1;
      }
    });

    modalPlusBtn.addEventListener('click', () => {
      const cur = Number(modalQtyInput.value) || 1;
      const product = getProductById(appState.activeModalProductId);
      if (product && cur < product.stock) {
        modalQtyInput.value = cur + 1;
        appState.activeModalQuantity = cur + 1;
      } else {
        showToast(`Maximum stock limit is ${product ? product.stock : 1} units.`, 'error');
      }
    });
  }

  if (modalAddToCartBtn) {
    modalAddToCartBtn.addEventListener('click', () => {
      if (!appState.activeModalProductId) return;
      const qty = Number(modalQtyInput.value) || 1;
      addToCart(appState.activeModalProductId, qty);
      closeProductModal();
    });
  }

  if (modalWishlistBtn) {
    modalWishlistBtn.addEventListener('click', () => {
      if (!appState.activeModalProductId) return;
      toggleWishlist(appState.activeModalProductId);
    });
  }

  if (modalRelatedGrid) {
    modalRelatedGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.modal-related-card');
      if (card && card.dataset.id) {
        openProductModal(card.dataset.id);
      }
    });
  }

  // Cart Drawer Trigger & Close Listeners
  const openCartBtn = document.getElementById('openCartBtn');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartOverlay = document.getElementById('cartOverlay');
  const continueShoppingBtn = document.getElementById('continueShoppingBtn');
  const continueShoppingEmptyBtn = document.getElementById('continueShoppingEmptyBtn');
  const clearCartBtn = document.getElementById('clearCartBtn');
  const footerOpenCartLink = document.getElementById('footerOpenCartLink');

  if (openCartBtn) openCartBtn.addEventListener('click', openCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
  if (continueShoppingBtn) continueShoppingBtn.addEventListener('click', closeCart);
  if (continueShoppingEmptyBtn) continueShoppingEmptyBtn.addEventListener('click', closeCart);
  if (clearCartBtn) clearCartBtn.addEventListener('click', clearCart);
  if (footerOpenCartLink) footerOpenCartLink.addEventListener('click', openCart);

  // Cart Items Event Delegation (Quantity +/- & Remove)
  const cartItemsContainer = document.getElementById('cartItemsContainer');
  if (cartItemsContainer) {
    cartItemsContainer.addEventListener('click', (e) => {
      const plusBtn = e.target.closest('.btn-cart-plus');
      if (plusBtn) {
        const id = plusBtn.dataset.id;
        const item = appState.cart.find(i => i.productId === id);
        if (item) updateQuantity(id, item.quantity + 1);
        return;
      }

      const minusBtn = e.target.closest('.btn-cart-minus');
      if (minusBtn) {
        const id = minusBtn.dataset.id;
        const item = appState.cart.find(i => i.productId === id);
        if (item) updateQuantity(id, item.quantity - 1);
        return;
      }

      const removeBtn = e.target.closest('.cart-item-remove-btn');
      if (removeBtn) {
        const id = removeBtn.dataset.id;
        removeFromCart(id);
        return;
      }
    });
  }

  // Coupon System Listeners
  const applyCouponBtn = document.getElementById('applyCouponBtn');
  const couponInput = document.getElementById('couponInput');
  const removeCouponBtn = document.getElementById('removeCouponBtn');

  if (applyCouponBtn && couponInput) {
    applyCouponBtn.addEventListener('click', () => {
      applyCoupon(couponInput.value);
    });

    couponInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyCoupon(couponInput.value);
      }
    });
  }

  if (removeCouponBtn) {
    removeCouponBtn.addEventListener('click', removeCoupon);
  }

  // Checkout Trigger & Modals
  const proceedToCheckoutBtn = document.getElementById('proceedToCheckoutBtn');
  const closeCheckoutBtn = document.getElementById('closeCheckoutBtn');
  const backToCartBtn = document.getElementById('backToCartBtn');
  const checkoutModal = document.getElementById('checkoutModal');
  const checkoutForm = document.getElementById('checkoutForm');

  if (proceedToCheckoutBtn) proceedToCheckoutBtn.addEventListener('click', openCheckout);
  if (closeCheckoutBtn) closeCheckoutBtn.addEventListener('click', closeCheckout);
  if (backToCartBtn) {
    backToCartBtn.addEventListener('click', () => {
      closeCheckout();
      openCart();
    });
  }

  if (checkoutModal) {
    checkoutModal.addEventListener('click', (e) => {
      if (e.target === checkoutModal) closeCheckout();
    });
  }

  const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
  const simulatedUpiBox = document.getElementById('simulatedUpiBox');
  const simulatedCardBox = document.getElementById('simulatedCardBox');

  paymentRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const val = e.target.value;
      if (simulatedUpiBox) simulatedUpiBox.classList.toggle('hidden', val !== 'UPI');
      if (simulatedCardBox) simulatedCardBox.classList.toggle('hidden', val !== 'CARD');
      refreshIcons();
    });
  });

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', placeOrder);
  }

  const confirmContinueBtn = document.getElementById('confirmContinueShoppingBtn');
  const orderConfirmModal = document.getElementById('orderConfirmModal');

  if (confirmContinueBtn && orderConfirmModal) {
    confirmContinueBtn.addEventListener('click', () => {
      orderConfirmModal.classList.add('hidden');
      document.body.classList.remove('no-scroll');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast('Welcome back! Feel free to explore more products.', 'info');
    });
  }

  // Global Keyboard Escape Key Handler
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProductModal();
      closeCart();
      closeCheckout();
      closeInfoModal();
      const confirmModal = document.getElementById('customConfirmModal');
      if (confirmModal) confirmModal.classList.add('hidden');
    }
  });

  // Footer Legal & Info Links
  const privacyLink = document.getElementById('privacyLink');
  const termsLink = document.getElementById('termsLink');
  const shippingInfoLink = document.getElementById('shippingInfoLink');
  const returnsPolicyLink = document.getElementById('returnsPolicyLink');
  const closeInfoModalBtn = document.getElementById('closeInfoModalBtn');
  const infoModalOkBtn = document.getElementById('infoModalOkBtn');

  if (privacyLink) {
    privacyLink.addEventListener('click', () => {
      openInfoModal(
        'Privacy Policy',
        '<p>At ShopEase Coimbatore, customer privacy is paramount. In this demonstration application, all customer inputs, wishlists, and cart contents are processed locally in your browser session via Web LocalStorage. No confidential credentials or sensitive personal information are transmitted to any external server.</p>'
      );
    });
  }

  if (termsLink) {
    termsLink.addEventListener('click', () => {
      openInfoModal(
        'Terms & Conditions',
        '<p>ShopEase is an educational and portfolio demonstration project showcasing Vanilla HTML5, CSS3, and JavaScript capabilities. Products, prices in INR (₹), discount vouchers, and taxes are simulated for showcase purposes.</p>'
      );
    });
  }

  if (shippingInfoLink) {
    shippingInfoLink.addEventListener('click', () => {
      openInfoModal(
        'Shipping & Delivery Information',
        '<p>Orders of ₹999 or more qualify for <strong>Free Standard Delivery</strong> across India from our Coimbatore hub. For orders below ₹999, a nominal delivery fee of ₹99 applies. Using voucher code <code>FREESHIP</code> waives standard delivery charges.</p>'
      );
    });
  }

  if (returnsPolicyLink) {
    returnsPolicyLink.addEventListener('click', () => {
      openInfoModal(
        '7-Day Hassle-Free Return Policy',
        '<p>We offer a hassle-free 7-day demo return window for unused items in original packaging. Contact customer support at <code>support@shopease.demo</code> for instant pickup assistance.</p>'
      );
    });
  }

  if (closeInfoModalBtn) closeInfoModalBtn.addEventListener('click', closeInfoModal);
  if (infoModalOkBtn) infoModalOkBtn.addEventListener('click', closeInfoModal);

  // Footer Category Links Click
  const footerCatLinks = document.querySelectorAll('.footer-cat-link');
  footerCatLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const cat = e.target.dataset.category;
      appState.filters.category = cat;
      appState.filters.wishlistOnly = false;
      if (openWishlistBtn) openWishlistBtn.classList.remove('active');
      updateCategoryCardsUi(cat);
      renderProducts();
      const catalogEl = document.getElementById('catalog');
      if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* ==========================================================================
   14. Application Initialization
   ========================================================================== */

function initApp() {
  // 1. Restore persistent cart, wishlist & coupon from LocalStorage
  loadCartFromStorage();
  loadWishlistFromStorage();

  // 2. Render initial product catalog (120 verified products)
  renderProducts();

  // 3. Render initial cart state & live badges
  renderCart();
  updateCartBadge();
  updateWishlistBadge();

  // 4. Attach event listeners
  setupEventListeners();

  // 5. Initialize Lucide icons
  refreshIcons();

  console.log(`ShopEase application initialized with ${productCatalog.length} products.`);
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
