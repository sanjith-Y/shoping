/**
 * ShopSmart — Shopping Cart & Price Calculation Controller
 * Supports Guest Cart (LocalStorage) and Logged-in Cart (Firestore / User-specific)
 * Calculation Order: Subtotal -> Coupon Discount -> Delivery Charge -> 18% GST -> Final Total
 */

'use strict';

const CART_CONFIG = {
  FREE_SHIPPING_THRESHOLD: 999,
  STANDARD_DELIVERY_FEE: 99,
  GST_RATE: 0.18 // 18% Illustrative GST rate
};

const AVAILABLE_COUPONS = {
  SAVE10: {
    code: 'SAVE10',
    description: '10% instant discount on merchandise subtotal',
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
    description: 'Waives the ₹99 standard delivery fee',
    type: 'FREESHIP',
    value: 0,
    minSubtotal: 0
  }
};

let activeCart = [];
let appliedCouponCode = null;

/**
 * Determine Storage Key based on authentication state
 */
function getCartStorageKey() {
  const user = window.ShopSmartAuth ? window.ShopSmartAuth.getCurrentUser() : null;
  return user ? `shopsmart_cart_${user.uid}` : 'shopsmart_cart_guest';
}

/**
 * Load cart items from storage
 */
function loadCart() {
  try {
    const key = getCartStorageKey();
    const raw = localStorage.getItem(key);
    activeCart = raw ? JSON.parse(raw) : [];

    const rawCoupon = localStorage.getItem('shopsmart_applied_coupon');
    appliedCouponCode = rawCoupon && AVAILABLE_COUPONS[rawCoupon] ? rawCoupon : null;
  } catch (e) {
    activeCart = [];
    appliedCouponCode = null;
  }
}

/**
 * Save active cart to storage
 */
function saveCart() {
  try {
    const key = getCartStorageKey();
    localStorage.setItem(key, JSON.stringify(activeCart));
    if (appliedCouponCode) {
      localStorage.setItem('shopsmart_applied_coupon', appliedCouponCode);
    } else {
      localStorage.removeItem('shopsmart_applied_coupon');
    }

    // If authenticated and production Firebase Firestore is configured
    const fb = window.ShopSmartFirebase;
    const user = window.ShopSmartAuth ? window.ShopSmartAuth.getCurrentUser() : null;
    if (fb && fb.isConfigured && fb.db && user) {
      fb.db.collection('user_carts').doc(user.uid).set({
        items: activeCart,
        coupon: appliedCouponCode,
        updatedAt: new Date().toISOString()
      }).catch(err => console.warn('Firestore cart sync error:', err));
    }
  } catch (e) {
    console.warn('Cart persistence error:', e);
  }
  updateCartBadges();
}

/**
 * Merge Guest Cart into Logged-in Cart upon login
 * @param {string} userUid
 */
function mergeGuestCart(userUid) {
  try {
    const guestRaw = localStorage.getItem('shopsmart_cart_guest');
    if (!guestRaw) return;

    const guestItems = JSON.parse(guestRaw);
    if (!Array.isArray(guestItems) || guestItems.length === 0) return;

    const userKey = `shopsmart_cart_${userUid}`;
    const userRaw = localStorage.getItem(userKey);
    let userItems = userRaw ? JSON.parse(userRaw) : [];

    let mergedCount = 0;
    guestItems.forEach(gItem => {
      const existing = userItems.find(u => u.productId === gItem.productId);
      const product = getProductById(gItem.productId);
      const maxStock = product ? product.stock : 99;

      if (existing) {
        existing.quantity = Math.min(existing.quantity + gItem.quantity, maxStock);
      } else {
        userItems.push({
          productId: gItem.productId,
          quantity: Math.min(gItem.quantity, maxStock)
        });
      }
      mergedCount++;
    });

    localStorage.setItem(userKey, JSON.stringify(userItems));
    localStorage.removeItem('shopsmart_cart_guest'); // Clear guest cart
    activeCart = userItems;
    saveCart();

    if (mergedCount > 0) {
      window.ShopSmartUtils.showToast(`Merged ${mergedCount} guest cart items into your account.`, 'info');
    }
  } catch (e) {
    console.warn('Cart merge error:', e);
  }
}

/**
 * Find product by ID
 */
function getProductById(id) {
  if (typeof PRODUCTS !== 'undefined' && Array.isArray(PRODUCTS)) {
    return PRODUCTS.find(p => p.id === id) || null;
  }
  return null;
}

/**
 * Add product to cart with stock validation
 * @param {string} productId
 * @param {number} quantity
 */
function addToCart(productId, quantity = 1) {
  const product = getProductById(productId);
  if (!product) {
    window.ShopSmartUtils.showToast('Product not found in catalog.', 'error');
    return false;
  }

  if (product.stock <= 0) {
    window.ShopSmartUtils.showToast(`${product.name} is currently out of stock.`, 'error');
    return false;
  }

  loadCart();
  const existing = activeCart.find(item => item.productId === productId);
  const currentQty = existing ? existing.quantity : 0;
  const newQty = currentQty + quantity;

  if (newQty > product.stock) {
    window.ShopSmartUtils.showToast(
      `Only ${product.stock} units available in stock. Cannot add ${newQty}.`,
      'warning'
    );
    return false;
  }

  if (existing) {
    existing.quantity = newQty;
  } else {
    activeCart.push({ productId, quantity: newQty });
  }

  saveCart();
  renderCartDrawer();
  renderCartPage();

  window.ShopSmartUtils.showToast(`Added ${product.name} to cart.`, 'success');
  return true;
}

/**
 * Update quantity of item in cart
 * @param {string} productId
 * @param {number} newQuantity
 */
function updateQuantity(productId, newQuantity) {
  const product = getProductById(productId);
  if (!product) return;

  loadCart();
  const index = activeCart.findIndex(i => i.productId === productId);
  if (index === -1) return;

  const validQty = Math.max(1, Math.min(Math.floor(newQuantity), product.stock));
  activeCart[index].quantity = validQty;

  saveCart();
  renderCartDrawer();
  renderCartPage();
}

/**
 * Remove product from cart
 * @param {string} productId
 */
function removeFromCart(productId) {
  loadCart();
  const product = getProductById(productId);
  activeCart = activeCart.filter(i => i.productId !== productId);
  saveCart();
  renderCartDrawer();
  renderCartPage();

  if (product) {
    window.ShopSmartUtils.showToast(`Removed ${product.name} from cart.`, 'info');
  }
}

/**
 * Clear all cart contents
 */
function clearCart() {
  activeCart = [];
  appliedCouponCode = null;
  saveCart();
  renderCartDrawer();
  renderCartPage();
  window.ShopSmartUtils.showToast('Your shopping cart has been cleared.', 'info');
}

/**
 * Central Price & Tax Calculation Algorithm
 * Returns exact floating-point safe monetary breakdown
 */
function calculateTotals() {
  loadCart();

  let merchandiseSubtotal = 0;
  let catalogSavings = 0;
  let totalItemsCount = 0;

  activeCart.forEach(item => {
    const product = getProductById(item.productId);
    if (product) {
      merchandiseSubtotal += product.price * item.quantity;
      if (product.originalPrice && product.originalPrice > product.price) {
        catalogSavings += (product.originalPrice - product.price) * item.quantity;
      }
      totalItemsCount += item.quantity;
    }
  });

  // Calculate Coupon Discount
  let couponDiscount = 0;
  let couponApplied = null;

  if (appliedCouponCode && AVAILABLE_COUPONS[appliedCouponCode]) {
    const coupon = AVAILABLE_COUPONS[appliedCouponCode];
    if (merchandiseSubtotal >= coupon.minSubtotal) {
      couponApplied = coupon;
      if (coupon.type === 'PERCENTAGE') {
        couponDiscount = Math.round(merchandiseSubtotal * coupon.value);
      } else if (coupon.type === 'FLAT') {
        couponDiscount = Math.min(coupon.value, merchandiseSubtotal);
      }
    }
  }

  const taxableAmount = Math.max(0, merchandiseSubtotal - couponDiscount);

  // Delivery Fee Calculation
  let deliveryFee = CART_CONFIG.STANDARD_DELIVERY_FEE;
  if (
    merchandiseSubtotal === 0 ||
    merchandiseSubtotal >= CART_CONFIG.FREE_SHIPPING_THRESHOLD ||
    (couponApplied && couponApplied.type === 'FREESHIP')
  ) {
    deliveryFee = 0;
  }

  // 18% Illustrative GST on Taxable Amount
  const gstAmount = Math.round(taxableAmount * CART_CONFIG.GST_RATE);

  // Grand Total
  const grandTotal = taxableAmount + gstAmount + deliveryFee;

  return {
    merchandiseSubtotal,
    catalogSavings,
    totalItemsCount,
    couponDiscount,
    couponApplied,
    taxableAmount,
    deliveryFee,
    gstAmount,
    grandTotal
  };
}

/**
 * Apply coupon code
 * @param {string} code
 */
function applyCoupon(code) {
  const cleanCode = (code || '').trim().toUpperCase();
  const coupon = AVAILABLE_COUPONS[cleanCode];

  if (!coupon) {
    window.ShopSmartUtils.showToast(`Invalid coupon code "${cleanCode}".`, 'error');
    return false;
  }

  const totals = calculateTotals();
  if (totals.merchandiseSubtotal < coupon.minSubtotal) {
    window.ShopSmartUtils.showToast(
      `Coupon ${cleanCode} requires a minimum subtotal of ${window.ShopSmartUtils.formatINR(coupon.minSubtotal)}.`,
      'warning'
    );
    return false;
  }

  appliedCouponCode = cleanCode;
  saveCart();
  renderCartDrawer();
  renderCartPage();

  window.ShopSmartUtils.showToast(`Coupon ${cleanCode} applied successfully!`, 'success');
  return true;
}

/**
 * Remove applied coupon
 */
function removeCoupon() {
  appliedCouponCode = null;
  saveCart();
  renderCartDrawer();
  renderCartPage();
  window.ShopSmartUtils.showToast('Coupon removed.', 'info');
}

/**
 * Update Header Cart Badges
 */
function updateCartBadges() {
  const totals = calculateTotals();
  const badges = document.querySelectorAll('.cart-badge-count');
  badges.forEach(b => {
    b.textContent = totals.totalItemsCount;
    b.classList.toggle('hidden', totals.totalItemsCount === 0);
  });
}

/**
 * Render slide-out cart drawer contents
 */
function renderCartDrawer() {
  const container = document.getElementById('cartDrawerItems');
  const footerContainer = document.getElementById('cartDrawerFooter');
  if (!container) return;

  const totals = calculateTotals();

  if (activeCart.length === 0) {
    container.innerHTML = `
      <div class="text-center" style="padding: 40px 16px;">
        <i data-lucide="shopping-cart" style="width: 48px; height: 48px; margin: 0 auto 12px; color: var(--text-subtle);"></i>
        <h4 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 6px;">Your cart is empty</h4>
        <p class="text-muted" style="font-size: 0.875rem; margin-bottom: 18px;">Looks like you haven't added anything to your cart yet.</p>
        <button class="btn btn-primary btn-sm" onclick="window.ShopSmartCart.closeCartDrawer(); window.location.href='products.html';">
          Browse Products
        </button>
      </div>
    `;
    if (footerContainer) footerContainer.classList.add('hidden');
    window.ShopSmartUtils.refreshIcons();
    return;
  }

  if (footerContainer) footerContainer.classList.remove('hidden');

  container.innerHTML = activeCart.map(item => {
    const product = getProductById(item.productId);
    if (!product) return '';
    return `
      <div class="cart-item-card">
        <img 
          src="${product.image}" 
          alt="${product.name}" 
          class="cart-item-img"
          onerror="this.onerror=null; this.src='assets/fallback/product-fallback.svg';"
        >
        <div class="cart-item-info">
          <div class="cart-item-title">${product.name}</div>
          <div class="cart-item-price">${window.ShopSmartUtils.formatINR(product.price)}</div>
          <div class="cart-qty-ctrl">
            <button class="cart-qty-btn" onclick="window.ShopSmartCart.updateQuantity('${product.id}', ${item.quantity - 1})">−</button>
            <input type="number" class="cart-qty-input" value="${item.quantity}" min="1" max="${product.stock}" onchange="window.ShopSmartCart.updateQuantity('${product.id}', this.value)">
            <button class="cart-qty-btn" onclick="window.ShopSmartCart.updateQuantity('${product.id}', ${item.quantity + 1})" ${item.quantity >= product.stock ? 'disabled' : ''}>+</button>
          </div>
        </div>
        <button class="text-danger" style="font-size: 1.125rem;" title="Remove" onclick="window.ShopSmartCart.removeFromCart('${product.id}')">
          <i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>
        </button>
      </div>
    `;
  }).join('');

  // Shipping progress
  const diff = CART_CONFIG.FREE_SHIPPING_THRESHOLD - totals.merchandiseSubtotal;
  const progressPercent = Math.min(100, (totals.merchandiseSubtotal / CART_CONFIG.FREE_SHIPPING_THRESHOLD) * 100);
  const meterBox = document.getElementById('drawerShippingMeter');
  if (meterBox) {
    if (totals.merchandiseSubtotal >= CART_CONFIG.FREE_SHIPPING_THRESHOLD) {
      meterBox.innerHTML = `
        <div class="shipping-meter-box text-success font-semibold">
          🎉 Congratulations! Your order qualifies for FREE Delivery!
        </div>
      `;
    } else {
      meterBox.innerHTML = `
        <div class="shipping-meter-box">
          Add <strong>${window.ShopSmartUtils.formatINR(diff)}</strong> more to unlock <strong>FREE Delivery</strong>!
          <div class="shipping-progress-bar">
            <div class="shipping-progress-fill" style="width: ${progressPercent}%;"></div>
          </div>
        </div>
      `;
    }
  }

  // Footer breakdown
  const subtotalEl = document.getElementById('drawerSubtotal');
  const deliveryEl = document.getElementById('drawerDelivery');
  const gstEl = document.getElementById('drawerGst');
  const totalEl = document.getElementById('drawerGrandTotal');

  if (subtotalEl) subtotalEl.textContent = window.ShopSmartUtils.formatINR(totals.merchandiseSubtotal);
  if (deliveryEl) deliveryEl.textContent = totals.deliveryFee === 0 ? 'FREE' : window.ShopSmartUtils.formatINR(totals.deliveryFee);
  if (gstEl) gstEl.textContent = window.ShopSmartUtils.formatINR(totals.gstAmount);
  if (totalEl) totalEl.textContent = window.ShopSmartUtils.formatINR(totals.grandTotal);

  window.ShopSmartUtils.refreshIcons();
}

/**
 * Render dedicated Cart page (cart.html)
 */
function renderCartPage() {
  const container = document.getElementById('cartPageItems');
  if (!container) return;

  const totals = calculateTotals();

  if (activeCart.length === 0) {
    container.innerHTML = `
      <div class="text-center" style="padding: 60px 20px;">
        <i data-lucide="shopping-bag" style="width: 56px; height: 56px; margin: 0 auto 16px; color: var(--text-subtle);"></i>
        <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 8px;">Your Shopping Cart is Empty</h2>
        <p class="text-muted" style="margin-bottom: 24px;">Discover thousands of products across 15 curated categories.</p>
        <a href="products.html" class="btn btn-primary btn-lg">Start Shopping</a>
      </div>
    `;
    const summaryCard = document.getElementById('cartPageSummaryCard');
    if (summaryCard) summaryCard.classList.add('hidden');
    window.ShopSmartUtils.refreshIcons();
    return;
  }

  const summaryCard = document.getElementById('cartPageSummaryCard');
  if (summaryCard) summaryCard.classList.remove('hidden');

  container.innerHTML = activeCart.map(item => {
    const product = getProductById(item.productId);
    if (!product) return '';
    return `
      <div class="cart-item-card" style="padding: 18px; margin-bottom: 12px; grid-template-columns: 90px 1fr auto;">
        <img 
          src="${product.image}" 
          alt="${product.name}" 
          class="cart-item-img" 
          style="width: 90px; height: 90px;"
          onerror="this.onerror=null; this.src='assets/fallback/product-fallback.svg';"
        >
        <div class="cart-item-info">
          <div class="text-muted" style="font-size: 0.75rem; text-transform: uppercase;">${product.category} • ${product.brand}</div>
          <a href="product-details.html?id=${product.id}" class="cart-item-title" style="font-size: 1rem;">${product.name}</a>
          <div class="cart-item-price" style="font-size: 1.0625rem; margin: 4px 0;">${window.ShopSmartUtils.formatINR(product.price)}</div>
          <div class="cart-qty-ctrl">
            <span style="font-size: 0.8125rem; color: var(--text-muted); margin-right: 6px;">Quantity:</span>
            <button class="cart-qty-btn" onclick="window.ShopSmartCart.updateQuantity('${product.id}', ${item.quantity - 1})">−</button>
            <input type="number" class="cart-qty-input" value="${item.quantity}" min="1" max="${product.stock}" onchange="window.ShopSmartCart.updateQuantity('${product.id}', this.value)">
            <button class="cart-qty-btn" onclick="window.ShopSmartCart.updateQuantity('${product.id}', ${item.quantity + 1})" ${item.quantity >= product.stock ? 'disabled' : ''}>+</button>
            <span style="font-size: 0.75rem; color: var(--text-subtle); margin-left: 8px;">(${product.stock} available)</span>
          </div>
        </div>
        <div style="text-align: right; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-end;">
          <div style="font-weight: 700; font-size: 1.125rem; color: var(--text-main);">
            ${window.ShopSmartUtils.formatINR(product.price * item.quantity)}
          </div>
          <button class="btn btn-secondary btn-sm" style="color: var(--danger); border-color: #fca5a5;" onclick="window.ShopSmartCart.removeFromCart('${product.id}')">
            <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i> Remove
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Page Summary elements
  const subtotalEl = document.getElementById('cartPageSubtotal');
  const savingsEl = document.getElementById('cartPageSavings');
  const discountRow = document.getElementById('cartPageDiscountRow');
  const discountEl = document.getElementById('cartPageDiscount');
  const deliveryEl = document.getElementById('cartPageDelivery');
  const gstEl = document.getElementById('cartPageGst');
  const grandTotalEl = document.getElementById('cartPageGrandTotal');

  if (subtotalEl) subtotalEl.textContent = window.ShopSmartUtils.formatINR(totals.merchandiseSubtotal);
  if (savingsEl) {
    savingsEl.textContent = window.ShopSmartUtils.formatINR(totals.catalogSavings);
    savingsEl.parentElement.classList.toggle('hidden', totals.catalogSavings === 0);
  }
  if (discountRow && discountEl) {
    if (totals.couponDiscount > 0) {
      discountRow.classList.remove('hidden');
      discountEl.textContent = `– ${window.ShopSmartUtils.formatINR(totals.couponDiscount)}`;
    } else {
      discountRow.classList.add('hidden');
    }
  }
  if (deliveryEl) deliveryEl.textContent = totals.deliveryFee === 0 ? 'FREE' : window.ShopSmartUtils.formatINR(totals.deliveryFee);
  if (gstEl) gstEl.textContent = window.ShopSmartUtils.formatINR(totals.gstAmount);
  if (grandTotalEl) grandTotalEl.textContent = window.ShopSmartUtils.formatINR(totals.grandTotal);

  window.ShopSmartUtils.refreshIcons();
}

/**
 * Open & Close Cart Drawer
 */
function openCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartDrawerOverlay');
  if (drawer && overlay) {
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.classList.add('no-scroll');
    renderCartDrawer();
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartDrawerOverlay');
  if (drawer && overlay) {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.classList.remove('no-scroll');
  }
}

// Global Export
window.ShopSmartCart = {
  loadCart,
  saveCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  calculateTotals,
  applyCoupon,
  removeCoupon,
  openCartDrawer,
  closeCartDrawer,
  renderCartDrawer,
  renderCartPage,
  mergeGuestCart,
  updateCartBadges
};
