/**
 * ShopSmart — Wishlist Management Controller
 * Supports Guest Wishlist (LocalStorage) and User Wishlist (Firestore / User-specific)
 */

'use strict';

let activeWishlist = [];

function getWishlistStorageKey() {
  const user = window.ShopSmartAuth ? window.ShopSmartAuth.getCurrentUser() : null;
  return user ? `shopsmart_wishlist_${user.uid}` : 'shopsmart_wishlist_guest';
}

function loadWishlist() {
  try {
    const key = getWishlistStorageKey();
    const raw = localStorage.getItem(key);
    activeWishlist = raw ? JSON.parse(raw) : [];
  } catch (e) {
    activeWishlist = [];
  }
}

function saveWishlist() {
  try {
    const key = getWishlistStorageKey();
    localStorage.setItem(key, JSON.stringify(activeWishlist));
  } catch (e) {
    console.warn('Wishlist persistence error:', e);
  }
  updateWishlistBadges();
}

function toggleWishlist(productId) {
  loadWishlist();
  const index = activeWishlist.indexOf(productId);
  const product = (window.ShopSmartCatalog && window.ShopSmartCatalog.getProductById(productId)) || 
                  (typeof PRODUCTS !== 'undefined' ? PRODUCTS.find(p => p.id === productId) : null);
  const name = product ? product.name : 'Product';

  if (index > -1) {
    activeWishlist.splice(index, 1);
    window.ShopSmartUtils.showToast(`Removed ${name} from your Wishlist.`, 'info');
  } else {
    activeWishlist.push(productId);
    window.ShopSmartUtils.showToast(`Saved ${name} to your Wishlist!`, 'success');
  }

  saveWishlist();
  updateCardWishlistButtons();
  renderWishlistPage();
}

function isWishlisted(productId) {
  loadWishlist();
  return activeWishlist.includes(productId);
}

function updateWishlistBadges() {
  loadWishlist();
  const badges = document.querySelectorAll('.wishlist-badge-count');
  badges.forEach(b => {
    b.textContent = activeWishlist.length;
    b.classList.toggle('hidden', activeWishlist.length === 0);
  });
}

function updateCardWishlistButtons() {
  loadWishlist();
  const buttons = document.querySelectorAll('.btn-wishlist-toggle');
  buttons.forEach(btn => {
    const pid = btn.dataset.id;
    const wishlisted = activeWishlist.includes(pid);
    btn.classList.toggle('active', wishlisted);
    btn.setAttribute('title', wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist');
  });
}

function renderWishlistPage() {
  const container = document.getElementById('wishlistGrid');
  if (!container) return;

  loadWishlist();

  if (activeWishlist.length === 0) {
    container.innerHTML = `
      <div class="text-center" style="grid-column: 1 / -1; padding: 60px 20px;">
        <i data-lucide="heart" style="width: 56px; height: 56px; margin: 0 auto 16px; color: var(--text-subtle);"></i>
        <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 8px;">Your Wishlist is Empty</h2>
        <p class="text-muted" style="margin-bottom: 24px;">Explore our catalog and bookmark items you love.</p>
        <a href="products.html" class="btn btn-primary btn-lg">Explore Catalog</a>
      </div>
    `;
    window.ShopSmartUtils.refreshIcons();
    return;
  }

  const getP = id => (window.ShopSmartCatalog && window.ShopSmartCatalog.getProductById(id)) || 
                     (typeof PRODUCTS !== 'undefined' ? PRODUCTS.find(p => p.id === id) : null);
  const items = activeWishlist.map(getP).filter(Boolean);

  container.innerHTML = items.map(product => {
    return `
      <div class="product-card" data-id="${product.id}">
        <div class="product-image-container">
          <img 
            src="${product.image}" 
            alt="${product.name}" 
            class="product-image ${product.imageFit === 'contain' ? 'img-contain' : 'img-cover'}"
            loading="lazy"
            onerror="this.onerror=null; this.src='assets/fallback/product-fallback.svg';"
          >
          <button 
            type="button" 
            class="btn-card-action active" 
            style="position: absolute; top: 10px; right: 10px;"
            title="Remove from Wishlist"
            onclick="window.ShopSmartWishlist.toggleWishlist('${product.id}')"
          >
            <i data-lucide="trash-2"></i>
          </button>
        </div>
        <div class="product-card-body">
          <div class="product-card-category">${product.category}</div>
          <a href="product-details.html?id=${product.id}" class="product-card-title">${product.name}</a>
          <div class="product-card-price-row">
            <span class="product-current-price">${window.ShopSmartUtils.formatINR(product.price)}</span>
            ${product.originalPrice > product.price ? `<span class="product-original-price">${window.ShopSmartUtils.formatINR(product.originalPrice)}</span>` : ''}
          </div>
          <button 
            class="btn btn-primary btn-block btn-sm"
            onclick="window.ShopSmartCart.addToCart('${product.id}'); window.ShopSmartWishlist.toggleWishlist('${product.id}');"
          >
            <i data-lucide="shopping-cart"></i> Move to Cart
          </button>
        </div>
      </div>
    `;
  }).join('');

  window.ShopSmartUtils.refreshIcons();
}

// Global Export
window.ShopSmartWishlist = {
  loadWishlist,
  saveWishlist,
  toggleWishlist,
  isWishlisted,
  updateWishlistBadges,
  updateCardWishlistButtons,
  renderWishlistPage
};
