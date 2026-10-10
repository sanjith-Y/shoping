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
    const getP = (id) => (window.ShopSmartCatalog && window.ShopSmartCatalog.getProductById(id)) || (typeof PRODUCTS !== 'undefined' ? PRODUCTS.find(p => p.id === id) : null);
    return list.map(getP).filter(Boolean);
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

        ${(product.discount || product.discountPercent) > 0 ? `<span class="card-badge-discount">${product.discount || product.discountPercent}% OFF</span>` : ''}
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
  const product = (window.ShopSmartCatalog && window.ShopSmartCatalog.getProductById(productId)) || 
                  (typeof PRODUCTS !== 'undefined' ? PRODUCTS.find(p => p.id === productId) : null);
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
  const catalogList = (window.ShopSmartCatalog && window.ShopSmartCatalog.getProducts().length > 0) ? window.ShopSmartCatalog.getProducts() : (typeof PRODUCTS !== 'undefined' ? PRODUCTS : []);
  const productId = params.get('id') || (catalogList.length > 0 ? catalogList[0].id : null);
  const product = (window.ShopSmartCatalog && window.ShopSmartCatalog.getProductById(productId)) || catalogList.find(p => p.id === productId) || null;

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
  const discountVal = product.discount || product.discountPercent || 0;
  if (discount) {
    discount.textContent = discountVal > 0 ? `${discountVal}% OFF` : '';
    discount.style.display = discountVal > 0 ? 'inline-block' : 'none';
  }
  if (stock) {
    stock.textContent = product.stock > 0 ? `In Stock (${product.stock} units available)` : 'Out of Stock';
    stock.className = product.stock > 0 ? 'text-success font-semibold' : 'text-danger font-semibold';
  }
  if (rating) rating.innerHTML = `${window.ShopSmartUtils.generateStarRatingHtml(product.rating)} <strong>${product.rating}</strong> (${product.reviewCount} verified ratings)`;
  if (desc) desc.textContent = product.description;
  if (highlights) {
    const hlList = product.highlights || (product.specifications ? Object.entries(product.specifications).slice(0, 4).map(([k, v]) => `${k}: ${v}`) : []);
    highlights.innerHTML = hlList.map(h => `<li>${h}</li>`).join('');
  }
  
  const specs = product.specifications || product.specs;
  if (specsContainer && specs) {
    specsContainer.innerHTML = Object.entries(specs).map(([k, v]) => `
      <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border-color); font-size: 0.875rem;">
        <span style="font-weight: 600; color: var(--text-main);">${k}</span>
        <span class="text-muted">${v}</span>
      </div>
    `).join('');
  }

  // Render Variants if present (colors, sizes)
  const variants = product.variants || {};
  let variantContainer = document.getElementById('pdVariantsContainer');
  if (!variantContainer && desc) {
    variantContainer = document.createElement('div');
    variantContainer.id = 'pdVariantsContainer';
    variantContainer.style.marginBottom = '20px';
    desc.parentNode.insertBefore(variantContainer, highlights ? highlights.parentNode : desc.nextSibling);
  }
  if (variantContainer) {
    let varHtml = '';
    if (product.colors && product.colors.length > 0) {
      varHtml += `
        <div style="margin-bottom: 14px;">
          <div style="font-size: 0.8125rem; font-weight: 700; margin-bottom: 6px;">Color: <span id="pdActiveColor" style="color: var(--primary); font-weight: 600;">${product.colors[0]}</span></div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${product.colors.map((c, i) => `
              <button type="button" class="btn btn-outline btn-sm ${i === 0 ? 'active' : ''}" style="padding: 4px 12px; border-radius: var(--radius-full);" onclick="document.getElementById('pdActiveColor').textContent='${c}'; this.parentNode.querySelectorAll('button').forEach(b => b.classList.remove('active')); this.classList.add('active');">${c}</button>
            `).join('')}
          </div>
        </div>
      `;
    }
    if (product.sizes && product.sizes.length > 0) {
      varHtml += `
        <div style="margin-bottom: 14px;">
          <div style="font-size: 0.8125rem; font-weight: 700; margin-bottom: 6px;">Option / Size: <span id="pdActiveSize" style="color: var(--primary); font-weight: 600;">${product.sizes[0]}</span></div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${product.sizes.map((s, i) => `
              <button type="button" class="btn btn-outline btn-sm ${i === 0 ? 'active' : ''}" style="padding: 4px 12px; border-radius: var(--radius-full);" onclick="document.getElementById('pdActiveSize').textContent='${s}'; this.parentNode.querySelectorAll('button').forEach(b => b.classList.remove('active')); this.classList.add('active');">${s}</button>
            `).join('')}
          </div>
        </div>
      `;
    }
    variantContainer.innerHTML = varHtml;
  }

  if (breadcrumb) {
    breadcrumb.innerHTML = window.ShopSmartCategoryNav ? window.ShopSmartCategoryNav.generateBreadcrumbs({
      category: product.category,
      brand: product.brand,
      productType: product.productType,
      series: product.series,
      productName: product.name
    }) : `
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
    let related = [];
    if (window.ShopSmartCatalog && window.ShopSmartCatalog.getRelatedProducts) {
      related = window.ShopSmartCatalog.getRelatedProducts(product.id, 4);
    } else if (typeof PRODUCTS !== 'undefined') {
      related = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
    }
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
  renderProductCard: createProductCardHTML,
  openQuickView,
  renderProductDetailsPage,
  trackRecentlyViewed,
  getRecentlyViewedProducts
};

window.ShopSmartProductRenderer = window.ShopSmartRenderer;
