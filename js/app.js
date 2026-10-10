/**
 * ShopSmart — Master Application Coordinator
 * Binds global navigation, drawer controllers, theme toggling, and auth synchronization
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Theme (Light/Dark)
  if (window.ShopSmartUtils) {
    window.ShopSmartUtils.initTheme();
  }

  // 2. Initialize Cart & Wishlist
  if (window.ShopSmartCart) {
    window.ShopSmartCart.loadCart();
    window.ShopSmartCart.updateCartBadges();
  }
  if (window.ShopSmartWishlist) {
    window.ShopSmartWishlist.loadWishlist();
    window.ShopSmartWishlist.updateWishlistBadges();
  }
  if (window.ShopSmartCompare) {
    window.ShopSmartCompare.updateCompareBadges();
  }

  // 3. Initialize Auth
  if (window.ShopSmartAuth) {
    window.ShopSmartAuth.onAuthStateChanged((user) => {
      if (user && window.ShopSmartCart) {
        window.ShopSmartCart.mergeGuestCart(user.uid);
      }
    });
  }

  // 4. Bind Global Header Controls
  bindGlobalNavigationEvents();

  // 5. Initial Icon Render
  if (window.ShopSmartUtils) {
    window.ShopSmartUtils.refreshIcons();
  }
});

function bindGlobalNavigationEvents() {
  // Theme Toggle Button
  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn && window.ShopSmartUtils) {
    themeBtn.addEventListener('click', window.ShopSmartUtils.toggleTheme);
  }

  // Cart Drawer Trigger
  const cartBtn = document.getElementById('openCartDrawerBtn');
  if (cartBtn && window.ShopSmartCart) {
    cartBtn.addEventListener('click', window.ShopSmartCart.openCartDrawer);
  }

  const closeCartBtn = document.getElementById('closeCartDrawerBtn');
  if (closeCartBtn && window.ShopSmartCart) {
    closeCartBtn.addEventListener('click', window.ShopSmartCart.closeCartDrawer);
  }

  const cartOverlay = document.getElementById('cartDrawerOverlay');
  if (cartOverlay && window.ShopSmartCart) {
    cartOverlay.addEventListener('click', window.ShopSmartCart.closeCartDrawer);
  }

  // Mobile Navigation Drawer Toggle
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const mobileDrawer = document.getElementById('mobileNavDrawer');
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.toggle('hidden');
    });
  }

  // Global Header Search Submit
  const headerSearchInput = document.querySelector('.header-search-input');
  if (headerSearchInput) {
    headerSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = headerSearchInput.value.trim();
        if (val) {
          window.location.href = `products.html?search=${encodeURIComponent(val)}`;
        }
      }
    });
  }

  // Voice Search Buttons in Header
  const voiceBtn = document.getElementById('headerVoiceSearchBtn');
  if (voiceBtn && window.ShopSmartSearch) {
    voiceBtn.addEventListener('click', () => {
      window.ShopSmartSearch.startVoiceSearch('headerSearchInput');
    });
  }

  // Image Search Modal Triggers
  const imgSearchBtn = document.getElementById('headerImageSearchBtn');
  if (imgSearchBtn && window.ShopSmartUtils) {
    imgSearchBtn.addEventListener('click', () => {
      window.ShopSmartUtils.openModal('imageSearchModal');
    });
  }

  // Logout Trigger
  const logoutBtn = document.getElementById('navLogoutBtn');
  if (logoutBtn && window.ShopSmartAuth) {
    logoutBtn.addEventListener('click', () => {
      window.ShopSmartAuth.logoutUser();
    });
  }

  // Escape key closes open modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modals = document.querySelectorAll('.modal-overlay:not(.hidden)');
      modals.forEach(m => m.classList.add('hidden'));
      document.body.classList.remove('no-scroll');
      if (window.ShopSmartCart) window.ShopSmartCart.closeCartDrawer();
    }
  });
}
