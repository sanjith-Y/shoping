/**
 * ShopSmart — Search, Multi-Filter, Voice Search & Image Search Controller
 * Full product catalog discovery system
 */

'use strict';

const searchState = {
  query: '',
  category: 'All',
  minPrice: null,
  maxPrice: null,
  minRating: 0,
  inStockOnly: false,
  brand: 'All',
  sort: 'featured'
};

/**
 * Filter and Sort entire catalog
 */
function getFilteredCatalog() {
  if (typeof PRODUCTS === 'undefined') return [];

  return PRODUCTS.filter(product => {
    // 1. Text Query Search
    if (searchState.query) {
      const q = searchState.query.toLowerCase().trim();
      const matchName = product.name.toLowerCase().includes(q);
      const matchBrand = product.brand ? product.brand.toLowerCase().includes(q) : false;
      const matchCategory = product.category.toLowerCase().includes(q);
      const matchDesc = product.description.toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchCategory && !matchDesc) return false;
    }

    // 2. Category Filter
    if (searchState.category && searchState.category !== 'All') {
      const targetCat = searchState.category.toLowerCase().replace(/&/g, 'and');
      const prodCat = product.category.toLowerCase().replace(/&/g, 'and');
      if (prodCat !== targetCat && !prodCat.startsWith(targetCat)) return false;
    }

    // 3. Price Filter
    if (searchState.minPrice !== null && !isNaN(searchState.minPrice)) {
      if (product.price < searchState.minPrice) return false;
    }
    if (searchState.maxPrice !== null && !isNaN(searchState.maxPrice)) {
      if (product.price > searchState.maxPrice) return false;
    }

    // 4. Rating Filter
    if (searchState.minRating > 0) {
      if (product.rating < searchState.minRating) return false;
    }

    // 5. Stock Filter
    if (searchState.inStockOnly) {
      if (product.stock <= 0) return false;
    }

    // 6. Brand Filter
    if (searchState.brand && searchState.brand !== 'All') {
      if (product.brand !== searchState.brand) return false;
    }

    return true;
  }).sort((a, b) => {
    switch (searchState.sort) {
      case 'price-asc': return a.price - b.price;
      case 'price-desc': return b.price - a.price;
      case 'rating': return b.rating - a.rating;
      case 'discount': return b.discountPercent - a.discountPercent;
      case 'newest': return b.id.localeCompare(a.id);
      case 'name-asc': return a.name.localeCompare(b.name);
      default: return (b.badge ? 1 : 0) - (a.badge ? 1 : 0);
    }
  });
}

/**
 * Render Catalog Page (products.html)
 */
function renderCatalogPage() {
  const container = document.getElementById('catalogProductsGrid');
  const countEl = document.getElementById('catalogResultsCount');
  if (!container) return;

  const results = getFilteredCatalog();

  if (countEl) {
    countEl.textContent = `Showing ${results.length} of ${PRODUCTS.length} products`;
  }

  if (results.length === 0) {
    container.innerHTML = `
      <div class="text-center" style="grid-column: 1 / -1; padding: 60px 20px;">
        <i data-lucide="search-x" style="width: 56px; height: 56px; margin: 0 auto 16px; color: var(--text-subtle);"></i>
        <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 8px;">No Products Found</h3>
        <p class="text-muted" style="margin-bottom: 20px;">We couldn't find any items matching your active search and filter criteria.</p>
        <button class="btn btn-secondary" onclick="window.ShopSmartSearch.resetFilters()">
          Clear All Filters
        </button>
      </div>
    `;
    window.ShopSmartUtils.refreshIcons();
    return;
  }

  container.innerHTML = results.map(p => window.ShopSmartRenderer.createProductCardHTML(p)).join('');
  window.ShopSmartUtils.refreshIcons();
}

/**
 * Reset all filter parameters
 */
function resetFilters() {
  searchState.query = '';
  searchState.category = 'All';
  searchState.minPrice = null;
  searchState.maxPrice = null;
  searchState.minRating = 0;
  searchState.inStockOnly = false;
  searchState.brand = 'All';
  searchState.sort = 'featured';

  const searchInput = document.getElementById('catalogSearchInput');
  const catSelect = document.getElementById('catalogCategorySelect');
  const minPrice = document.getElementById('catalogMinPrice');
  const maxPrice = document.getElementById('catalogMaxPrice');
  const ratingSelect = document.getElementById('catalogRatingSelect');
  const inStockCheckbox = document.getElementById('catalogInStockOnly');
  const sortSelect = document.getElementById('catalogSortSelect');

  if (searchInput) searchInput.value = '';
  if (catSelect) catSelect.value = 'All';
  if (minPrice) minPrice.value = '';
  if (maxPrice) maxPrice.value = '';
  if (ratingSelect) ratingSelect.value = '0';
  if (inStockCheckbox) inStockCheckbox.checked = false;
  if (sortSelect) sortSelect.value = 'featured';

  renderCatalogPage();
  window.ShopSmartUtils.showToast('Filters reset to default.', 'info');
}

/**
 * Voice Search using Web Speech API
 */
function startVoiceSearch(targetInputId = 'catalogSearchInput') {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    window.ShopSmartUtils.showToast('Voice Search is not supported in this browser. Please type your query.', 'warning');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-IN';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  window.ShopSmartUtils.showToast('🎙️ Listening... Speak your search query now.', 'info');

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const input = document.getElementById(targetInputId) || document.querySelector('.header-search-input');
    if (input) {
      input.value = transcript;
      searchState.query = transcript;
      renderCatalogPage();
      window.ShopSmartUtils.showToast(`Recognized: "${transcript}"`, 'success');
    }
  };

  recognition.onerror = (event) => {
    window.ShopSmartUtils.showToast(`Voice Search Error: ${event.error}`, 'error');
  };

  recognition.start();
}

/**
 * Image Search Demonstration
 */
function handleImageSearchUpload(file) {
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    window.ShopSmartUtils.showToast('Please upload a valid image file (JPG, PNG, WebP).', 'warning');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const preview = document.getElementById('imageSearchPreview');
    if (preview) {
      preview.src = e.target.result;
      preview.classList.remove('hidden');
    }

    // Demonstration matching algorithm: matches category based on dominant visual classification or tags
    const demoMatches = PRODUCTS.filter(p => p.badge || p.stock > 10).slice(0, 4);
    const resultsContainer = document.getElementById('imageSearchResults');
    if (resultsContainer) {
      resultsContainer.innerHTML = `
        <div style="margin-top: 16px;">
          <h4 style="font-size: 0.9375rem; font-weight: 600; margin-bottom: 8px;">Visually Similar Catalog Items (Demo):</h4>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
            ${demoMatches.map(p => `
              <div style="border: 1px solid var(--border-color); padding: 8px; border-radius: var(--radius-sm); text-align: center;">
                <img src="${p.image}" alt="${p.name}" style="height: 70px; object-fit: contain; margin: 0 auto 4px;">
                <div style="font-size: 0.75rem; font-weight: 600;">${p.name}</div>
                <div style="font-size: 0.8125rem; color: var(--primary); font-weight: 700;">${window.ShopSmartUtils.formatINR(p.price)}</div>
                <button class="btn btn-primary btn-sm btn-block" style="margin-top: 4px;" onclick="window.ShopSmartCart.addToCart('${p.id}')">Add</button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  };
  reader.readAsDataURL(file);
}

// Global Export
window.ShopSmartSearch = {
  searchState,
  getFilteredCatalog,
  renderCatalogPage,
  resetFilters,
  startVoiceSearch,
  handleImageSearchUpload
};
