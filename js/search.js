/**
 * ShopSmart — Search, Multi-Filter, Voice Search & Discovery Controller
 * Full product catalog discovery across 1,006 products and 15 categories
 */

'use strict';

const searchState = {
  query: '',
  category: 'All',
  brand: 'All',
  productType: 'All',
  series: 'All',
  minPrice: null,
  maxPrice: null,
  minRating: 0,
  inStockOnly: false,
  sort: 'featured'
};

/**
 * Filter and Sort entire catalog
 */
function getFilteredCatalog() {
  const prods = (typeof PRODUCTS !== 'undefined') ? PRODUCTS : (window.ShopSmartCatalog ? window.ShopSmartCatalog.getProducts() : []);
  if (!prods || prods.length === 0) return [];

  return prods.filter(product => {
    // 1. Text Query Search (name, brand, model, series, category, productType, specs)
    if (searchState.query) {
      const q = searchState.query.toLowerCase().trim();
      const matchName = product.name ? product.name.toLowerCase().includes(q) : false;
      const matchBrand = product.brand ? product.brand.toLowerCase().includes(q) : false;
      const matchModel = product.model ? product.model.toLowerCase().includes(q) : false;
      const matchSeries = product.series ? product.series.toLowerCase().includes(q) : false;
      const matchCategory = product.category ? product.category.toLowerCase().includes(q) : false;
      const matchType = product.productType ? product.productType.toLowerCase().includes(q) : false;
      const matchDesc = product.description ? product.description.toLowerCase().includes(q) : false;

      if (!matchName && !matchBrand && !matchModel && !matchSeries && !matchCategory && !matchType && !matchDesc) {
        return false;
      }
    }

    // 2. Category Filter
    if (searchState.category && searchState.category !== 'All' && searchState.category !== 'all') {
      const targetCat = searchState.category.toLowerCase().replace(/&/g, 'and').trim();
      const prodCat = (product.category || '').toLowerCase().replace(/&/g, 'and').trim();
      if (prodCat !== targetCat) return false;
    }

    // 3. Brand Filter
    if (searchState.brand && searchState.brand !== 'All' && searchState.brand !== 'all') {
      if ((product.brand || '').toLowerCase() !== searchState.brand.toLowerCase()) return false;
    }

    // 4. Product Type Filter
    if (searchState.productType && searchState.productType !== 'All' && searchState.productType !== 'all') {
      if ((product.productType || '').toLowerCase() !== searchState.productType.toLowerCase()) return false;
    }

    // 5. Series Filter
    if (searchState.series && searchState.series !== 'All' && searchState.series !== 'all') {
      if ((product.series || '').toLowerCase() !== searchState.series.toLowerCase()) return false;
    }

    // 6. Price Filter
    if (searchState.minPrice !== null && !isNaN(searchState.minPrice)) {
      if (product.price < searchState.minPrice) return false;
    }
    if (searchState.maxPrice !== null && !isNaN(searchState.maxPrice)) {
      if (product.price > searchState.maxPrice) return false;
    }

    // 7. Rating Filter
    if (searchState.minRating > 0) {
      if (product.rating < searchState.minRating) return false;
    }

    // 8. Stock Filter
    if (searchState.inStockOnly) {
      if (product.stock <= 0) return false;
    }

    return true;
  }).sort((a, b) => {
    switch (searchState.sort) {
      case 'price-asc': return a.price - b.price;
      case 'price-desc': return b.price - a.price;
      case 'rating': return b.rating - a.rating;
      case 'discount': return (b.discount || b.discountPercent || 0) - (a.discount || a.discountPercent || 0);
      case 'newest': return b.id.localeCompare(a.id);
      case 'name-asc': return a.name.localeCompare(b.name);
      default: return (b.discount || 0) - (a.discount || 0);
    }
  });
}

/**
 * Populate dynamic filters (Brands and Types) for active category
 */
function updateDynamicFilterOptions() {
  const brandSel = document.getElementById('catalogBrandSelect');
  const typeSel = document.getElementById('catalogTypeSelect');
  const prods = (typeof PRODUCTS !== 'undefined') ? PRODUCTS : [];

  let relevantProds = prods;
  if (searchState.category && searchState.category !== 'All') {
    relevantProds = prods.filter(p => p.category.toLowerCase() === searchState.category.toLowerCase());
  }

  if (brandSel) {
    const brands = Array.from(new Set(relevantProds.map(p => p.brand).filter(Boolean))).sort();
    const currBrand = searchState.brand;
    brandSel.innerHTML = '<option value="All">All Brands</option>' +
      brands.map(b => `<option value="${b}" ${b.toLowerCase() === currBrand.toLowerCase() ? 'selected' : ''}>${b}</option>`).join('');
  }

  if (typeSel) {
    const types = Array.from(new Set(relevantProds.map(p => p.productType).filter(Boolean))).sort();
    const currType = searchState.productType;
    typeSel.innerHTML = '<option value="All">All Product Types</option>' +
      types.map(t => `<option value="${t}" ${t.toLowerCase() === currType.toLowerCase() ? 'selected' : ''}>${t}</option>`).join('');
  }
}

/**
 * Render Catalog Page (products.html)
 */
function renderCatalogPage() {
  const container = document.getElementById('catalogProductsGrid');
  const countEl = document.getElementById('catalogResultsCount');
  if (!container) return;

  const results = getFilteredCatalog();
  const totalCount = typeof PRODUCTS !== 'undefined' ? PRODUCTS.length : 1006;

  if (countEl) {
    countEl.textContent = `Showing ${results.length} of ${totalCount} products`;
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
    if (window.ShopSmartUtils && window.ShopSmartUtils.refreshIcons) window.ShopSmartUtils.refreshIcons();
    return;
  }

  container.innerHTML = results.map(p => window.ShopSmartRenderer.createProductCardHTML(p)).join('');
  if (window.ShopSmartUtils && window.ShopSmartUtils.refreshIcons) window.ShopSmartUtils.refreshIcons();
}

/**
 * Reset all filter parameters
 */
function resetFilters() {
  searchState.query = '';
  searchState.category = 'All';
  searchState.brand = 'All';
  searchState.productType = 'All';
  searchState.series = 'All';
  searchState.minPrice = null;
  searchState.maxPrice = null;
  searchState.minRating = 0;
  searchState.inStockOnly = false;
  searchState.sort = 'featured';

  const searchInput = document.getElementById('catalogSearchInput');
  const catSelect = document.getElementById('catalogCategorySelect');
  const brandSelect = document.getElementById('catalogBrandSelect');
  const typeSelect = document.getElementById('catalogTypeSelect');
  const minPrice = document.getElementById('catalogMinPrice');
  const maxPrice = document.getElementById('catalogMaxPrice');
  const ratingSelect = document.getElementById('catalogRatingSelect');
  const inStockCheckbox = document.getElementById('catalogInStockOnly');
  const sortSelect = document.getElementById('catalogSortSelect');

  if (searchInput) searchInput.value = '';
  if (catSelect) catSelect.value = 'All';
  if (brandSelect) brandSelect.value = 'All';
  if (typeSelect) typeSelect.value = 'All';
  if (minPrice) minPrice.value = '';
  if (maxPrice) maxPrice.value = '';
  if (ratingSelect) ratingSelect.value = '0';
  if (inStockCheckbox) inStockCheckbox.checked = false;
  if (sortSelect) sortSelect.value = 'featured';

  updateDynamicFilterOptions();
  renderCatalogPage();
  if (window.ShopSmartUtils && window.ShopSmartUtils.showToast) {
    window.ShopSmartUtils.showToast('Filters reset to default.', 'info');
  }
}

/**
 * Voice Search using Web Speech API
 */
function startVoiceSearch(targetInputId = 'catalogSearchInput') {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    if (window.ShopSmartUtils && window.ShopSmartUtils.showToast) {
      window.ShopSmartUtils.showToast('Voice Search is not supported in this browser. Please type your query.', 'warning');
    }
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-IN';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  if (window.ShopSmartUtils && window.ShopSmartUtils.showToast) {
    window.ShopSmartUtils.showToast('🎙️ Listening... Speak your search query now.', 'info');
  }

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const input = document.getElementById(targetInputId) || document.querySelector('.header-search-input') || document.getElementById('globalSearchInput');
    if (input) {
      input.value = transcript;
      searchState.query = transcript;
      renderCatalogPage();
      if (window.ShopSmartUtils && window.ShopSmartUtils.showToast) {
        window.ShopSmartUtils.showToast(`Recognized: "${transcript}"`, 'success');
      }
    }
  };

  recognition.onerror = (event) => {
    if (window.ShopSmartUtils && window.ShopSmartUtils.showToast) {
      window.ShopSmartUtils.showToast(`Voice Search Error: ${event.error}`, 'error');
    }
  };

  recognition.start();
}

window.ShopSmartSearch = {
  searchState,
  getFilteredCatalog,
  renderCatalogPage,
  resetFilters,
  startVoiceSearch,
  updateDynamicFilterOptions
};
