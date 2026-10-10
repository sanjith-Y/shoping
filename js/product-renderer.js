/**
 * ShopSmart — Product Card & Details Rendering Engine
 * Builds accessible, high-performance product cards, quick view modals, and recently viewed tracker
 */

'use strict';

const RECENTLY_VIEWED_KEY = 'shopsmart_recently_viewed';

function trackRecentlyViewed(productId) {
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    let list = raw ? JSON.parse(raw) : [];
    list = list.filter(id => id !== productId);
    list.unshift(productId);
    list = list.slice(0, 10); // Keep last 10
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn(e);
  }
}

function getRecentlyViewedProducts() {
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return list.map(id => typeof PRODUCTS !== 'undefined' ? PRODUCTS.find(p => p.id === id) : null).filter(Boolean);
  } catch (e) {
    return [];
  }
}

/**
 * Build Single Product Card HTML
 * @param {Object} product
 * @returns {string}
 */
function createProductCardHTML(product) {
  const isWishlisted = window.ShopSmartWishlist ? window.ShopSmartWishlist.isWishlisted(product.id) : false;
  const isOutOfStock = product.stock <= 0;

  return `
    <article class="product-card" data-product-id="${product.id}">
      <div class="product-image-container">
        <img 
          src="${product.image}" 
          alt="${product.name}" 
          class="product-image ${product.imageFit === 'contain' ? 'img-contain' : 'img-cover'}"
          loading="lazy"
          onerror="this.onerror=null; this.src='assets/fallback/product-fallback.svg';"
        >

        ${product.discountPercent > 0 ? `<span class="card-badge-discount">${product.discountPercent}% OFF</span>` : ''}
        ${product.badge ? `<span class="card-badge-tag">${product.badge}</span>` : ''}

        <div class="card-floating-actions">
          <button 
            type="button" 
            class="btn-card-action btn-wishlist-toggle ${isWishlisted ? 'active' : ''}" 
            data-id="${product.id}" 
            title="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}"
            aria-label="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}"
            onclick="window.ShopSmartWishlist.toggleWishlist('${product.id}')"
          >
            <i data-lucide="heart"></i>
          </button>
          
          <button 
            type="button" 
            class="btn-card-action" 
            title="Compare Product"
            aria-label="Compare Product"
            onclick="window.ShopSmartCompare.addToCompare('${product.id}')"
          >
            <i data-lucide="columns-3"></i>
          </button>

          <button 
            type="button" 
            class="btn-card-action" 
            title="Quick View"
            aria-label="Quick View"
            onclick="window.ShopSmartRenderer.openQuickView('${product.id}')"
          >
            <i data-lucide="eye"></i>
          </button>
        </div>
      </div>

      <div class="product-card-body">
        <div class="product-card-category">${product.category}</div>
        <a href="product-details.html?id=${product.id}" class="product-card-title" title="${product.name}">${product.name}</a>

        <div class="product-card-rating">
          <div class="rating-stars">${window.ShopSmartUtils.generateStarRatingHtml(product.rating)}</div>
          <span class="rating-score">${product.rating}</span>
          <span class="rating-reviews">(${product.reviewCount})</span>
        </div>

        <div class="product-card-price-row">
          <span class="product-current-price">${window.ShopSmartUtils.formatINR(product.price)}</span>
          ${product.originalPrice > product.price ? `<span class="product-original-price">${window.ShopSmartUtils.formatINR(product.originalPrice)}</span>` : ''}
        </div>

        <div class="product-card-actions">
          <button 
            type="button" 
            class="btn btn-primary btn-sm"
            onclick="window.ShopSmartCart.addToCart('${product.id}', 1)"
            ${isOutOfStock ? 'disabled' : ''}
          >
            <i data-lucide="shopping-cart"></i>
            <span>${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
          </button>
          <a href="product-details.html?id=${product.id}" class="btn btn-secondary btn-sm" title="View Details">
            View
          </a>
        </div>
      </div>
    </article>
  `;
}

/**
 * Open Quick View Modal
 * @param {string} productId
 */
function openQuickView(productId) {
  const product = typeof PRODUCTS !== 'undefined' ? PRODUCTS.find(p => p.id === productId) : null;
  if (!product) return;

  trackRecentlyViewed(productId);

  const modal = document.getElementById('quickViewModal');
  if (!modal) return;

  const img = document.getElementById('qvImage');
  const title = document.getElementById('qvTitle');
  const category = document.getElementById('qvCategory');
  const brand = document.getElementById('qvBrand');
  const price = document.getElementById('qvPrice');
  const origPrice = document.getElementById('qvOriginalPrice');
  const discount = document.getElementById('qvDiscount');
  const rating = document.getElementById('qvRating');
  const stock = document.getElementById('qvStock');
  const desc = document.getElementById('qvDesc');
  const highlights = document.getElementById('qvHighlights');
  const addBtn = document.getElementById('qvAddToCartBtn');
  const viewFullLink = document.getElementById('qvViewFullLink');

  if (img) img.src = product.image;
  if (title) title.textContent = product.name;
  if (category) category.textContent = product.category;
  if (brand) brand.textContent = product.brand;
  if (price) price.textContent = window.ShopSmartUtils.formatINR(product.price);
  if (origPrice) {
    origPrice.textContent = product.originalPrice > product.price ? window.ShopSmartUtils.formatINR(product.originalPrice) : '';
  }
  if (discount) {
    discount.textContent = product.discountPercent > 0 ? `${product.discountPercent}% OFF` : '';
    discount.style.display = product.discountPercent > 0 ? 'inline-block' : 'none';
  }
  if (rating) rating.innerHTML = `${window.ShopSmartUtils.generateStarRatingHtml(product.rating)} <strong>${product.rating}</strong> (${product.reviewCount} customer reviews)`;
  if (stock) {
    stock.textContent = product.stock > 0 ? `In Stock (${product.stock} units left)` : 'Currently Out of Stock';
    stock.className = product.stock > 0 ? 'text-success font-semibold' : 'text-danger font-semibold';
  }
  if (desc) desc.textContent = product.description;
  if (highlights) {
    highlights.innerHTML = (product.highlights || []).map(h => `<li>${h}</li>`).join('');
  }
  if (addBtn) {
    addBtn.disabled = product.stock <= 0;
    addBtn.onclick = () => {
      const qtyInput = document.getElementById('qvQuantity');
      const qty = qtyInput ? parseInt(qtyInput.value, 10) || 1 : 1;
      window.ShopSmartCart.addToCart(product.id, qty);
      window.ShopSmartUtils.closeModal('quickViewModal');
    };
  }
  if (viewFullLink) viewFullLink.href = `product-details.html?id=${product.id}`;

  window.ShopSmartUtils.openModal('quickViewModal');
}

/**
 * Render Product Details Page (product-details.html)
 */
function renderProductDetailsPage() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id') || (typeof PRODUCTS !== 'undefined' ? PRODUCTS[0].id : null);
  const product = typeof PRODUCTS !== 'undefined' ? PRODUCTS.find(p => p.id === productId) : null;

  if (!product) {
    const main = document.getElementById('productDetailsMain');
    if (main) main.innerHTML = '<div class="container text-center" style="padding: 60px 0;"><h2>Product not found</h2><a href="products.html" class="btn btn-primary" style="margin-top: 16px;">Browse All Products</a></div>';
    return;
  }

  trackRecentlyViewed(product.id);

  document.title = `${product.name} — ShopSmart`;

  const img = document.getElementById('pdImage');
  const title = document.getElementById('pdTitle');
  const category = document.getElementById('pdCategory');
  const brand = document.getElementById('pdBrand');
  const price = document.getElementById('pdPrice');
  const origPrice = document.getElementById('pdOrigPrice');
  const discount = document.getElementById('pdDiscount');
  const stock = document.getElementById('pdStock');
  const rating = document.getElementById('pdRating');
  const desc = document.getElementById('pdDesc');
  const highlights = document.getElementById('pdHighlights');
  const specsContainer = document.getElementById('pdSpecsContainer');
  const breadcrumb = document.getElementById('pdBreadcrumb');

  if (img) img.src = product.image;
  if (title) title.textContent = product.name;
  if (category) category.textContent = product.category;
  if (brand) brand.textContent = product.brand;
  if (price) price.textContent = window.ShopSmartUtils.formatINR(product.price);
  if (origPrice) origPrice.textContent = product.originalPrice > product.price ? window.ShopSmartUtils.formatINR(product.originalPrice) : '';
  if (discount) {
    discount.textContent = product.discountPercent > 0 ? `${product.discountPercent}% OFF` : '';
    discount.style.display = product.discountPercent > 0 ? 'inline-block' : 'none';
  }
  if (stock) {
    stock.textContent = product.stock > 0 ? `In Stock (${product.stock} units available)` : 'Out of Stock';
    stock.className = product.stock > 0 ? 'text-success font-semibold' : 'text-danger font-semibold';
  }
  if (rating) rating.innerHTML = `${window.ShopSmartUtils.generateStarRatingHtml(product.rating)} <strong>${product.rating}</strong> (${product.reviewCount} customer ratings)`;
  if (desc) desc.textContent = product.description;
  if (highlights) {
    highlights.innerHTML = (product.highlights || []).map(h => `<li>${h}</li>`).join('');
  }
  if (specsContainer && product.specs) {
    specsContainer.innerHTML = Object.entries(product.specs).map(([k, v]) => `
      <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color); font-size: 0.875rem;">
        <span style="font-weight: 600; text-transform: capitalize;">${k}</span>
        <span class="text-muted">${v}</span>
      </div>
    `).join('');
  }
  if (breadcrumb) {
    breadcrumb.innerHTML = `
      <a href="index.html">Home</a> &gt; 
      <a href="products.html?category=${encodeURIComponent(product.category)}">${product.category}</a> &gt; 
      <span>${product.name}</span>
    `;
  }

  // Setup Add to Cart button
  const addBtn = document.getElementById('pdAddToCartBtn');
  if (addBtn) {
    addBtn.disabled = product.stock <= 0;
    addBtn.onclick = () => {
      const qtyInput = document.getElementById('pdQuantityInput');
      const qty = qtyInput ? parseInt(qtyInput.value, 10) || 1 : 1;
      window.ShopSmartCart.addToCart(product.id, qty);
    };
  }

  // Setup Wishlist button
  const wishBtn = document.getElementById('pdWishlistBtn');
  if (wishBtn) {
    wishBtn.onclick = () => window.ShopSmartWishlist.toggleWishlist(product.id);
  }

  // Setup Compare button
  const compBtn = document.getElementById('pdCompareBtn');
  if (compBtn) {
    compBtn.onclick = () => window.ShopSmartCompare.addToCompare(product.id);
  }

  // Render Related Products (same category, excluding this one)
  const relatedGrid = document.getElementById('pdRelatedGrid');
  if (relatedGrid) {
    const related = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
    relatedGrid.innerHTML = related.map(p => createProductCardHTML(p)).join('');
  }

  // Render Recently Viewed Products
  const recentGrid = document.getElementById('pdRecentGrid');
  if (recentGrid) {
    const recent = getRecentlyViewedProducts().filter(p => p.id !== product.id).slice(0, 4);
    if (recent.length > 0) {
      recentGrid.innerHTML = recent.map(p => createProductCardHTML(p)).join('');
      const recentSec = document.getElementById('pdRecentSection');
      if (recentSec) recentSec.classList.remove('hidden');
    }
  }

  window.ShopSmartUtils.refreshIcons();
}

// Global Export
window.ShopSmartRenderer = {
  createProductCardHTML,
  openQuickView,
  renderProductDetailsPage,
  trackRecentlyViewed,
  getRecentlyViewedProducts
};
