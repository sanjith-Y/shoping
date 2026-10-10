/**
 * ShopSmart — Brand Navigation & Showroom Controller
 * Powers brand.html and brand filters across catalog
 */

'use strict';

const BrandNavigation = {
  activeBrand: null,
  activeSeries: 'all',
  activeProductType: 'all',
  sortBy: 'featured',

  /**
   * Initialize Brand Showroom Page (brand.html)
   */
  async initBrandShowroom() {
    await window.ShopSmartCatalog.load();
    const urlParams = new URLSearchParams(window.location.search);
    const brandParam = urlParams.get('brand');

    if (!brandParam) {
      this.renderBrandDirectory();
      return;
    }

    this.activeBrand = brandParam;
    this.renderBrandHeader();
    this.renderFilterPills();
    this.renderBrandProducts();
  },

  /**
   * Render Brand Header with Stats and Categories
   */
  renderBrandHeader() {
    const headerContainer = document.getElementById('brandHeaderContainer');
    const breadcrumbContainer = document.getElementById('brandBreadcrumbs');

    const brandData = window.ShopSmartCatalog.getBrandByName(this.activeBrand);
    const prods = window.ShopSmartCatalog.getProductsByBrand(this.activeBrand);

    if (breadcrumbContainer) {
      breadcrumbContainer.innerHTML = `
        <nav class="breadcrumb-nav">
          <ol class="breadcrumb-list">
            <li class="breadcrumb-item"><a href="index.html">Home</a></li>
            <li class="breadcrumb-item"><a href="brand.html">Brands</a></li>
            <li class="breadcrumb-item active" aria-current="page">${this.activeBrand}</li>
          </ol>
        </nav>
      `;
    }

    if (headerContainer) {
      const categoriesText = brandData && brandData.categories ? brandData.categories.join(' • ') : '';
      headerContainer.innerHTML = `
        <div class="brand-hero-card">
          <div class="brand-hero-info">
            <span class="hero-pill">Official Verified Brand</span>
            <h1 class="brand-hero-title">${this.activeBrand}</h1>
            <p class="brand-hero-desc">Explore genuine ${this.activeBrand} products backed by authentic manufacturer warranty, verified specifications, and express delivery in Coimbatore and across India.</p>
            <div class="brand-hero-meta">
              <span><strong>${prods.length}</strong> Products Cataloged</span>
              <span>Categories: <strong>${categoriesText}</strong></span>
            </div>
          </div>
        </div>
      `;
    }
  },

  /**
   * Render Series and Product Type Filter Pills
   */
  renderFilterPills() {
    const seriesContainer = document.getElementById('brandSeriesFilters');
    const typeContainer = document.getElementById('brandTypeFilters');

    const prods = window.ShopSmartCatalog.getProductsByBrand(this.activeBrand);
    const seriesSet = new Set();
    const typesSet = new Set();

    prods.forEach(p => {
      if (p.series) seriesSet.add(p.series);
      if (p.productType) typesSet.add(p.productType);
    });

    if (seriesContainer && seriesSet.size > 0) {
      seriesContainer.innerHTML = `
        <span class="filter-pill-label">Series:</span>
        <button class="filter-pill ${this.activeSeries === 'all' ? 'active' : ''}" onclick="BrandNavigation.setSeriesFilter('all')">All Series</button>
        ${Array.from(seriesSet).sort().map(s => `
          <button class="filter-pill ${this.activeSeries === s ? 'active' : ''}" onclick="BrandNavigation.setSeriesFilter('${s.replace(/'/g, "\\'")}')">${s}</button>
        `).join('')}
      `;
    }

    if (typeContainer && typesSet.size > 0) {
      typeContainer.innerHTML = `
        <span class="filter-pill-label">Type:</span>
        <button class="filter-pill ${this.activeProductType === 'all' ? 'active' : ''}" onclick="BrandNavigation.setTypeFilter('all')">All Types</button>
        ${Array.from(typesSet).sort().map(t => `
          <button class="filter-pill ${this.activeProductType === t ? 'active' : ''}" onclick="BrandNavigation.setTypeFilter('${t.replace(/'/g, "\\'")}')">${t}</button>
        `).join('')}
      `;
    }
  },

  setSeriesFilter(series) {
    this.activeSeries = series;
    this.renderFilterPills();
    this.renderBrandProducts();
  },

  setTypeFilter(type) {
    this.activeProductType = type;
    this.renderFilterPills();
    this.renderBrandProducts();
  },

  setSortBy(sort) {
    this.sortBy = sort;
    this.renderBrandProducts();
  },

  /**
   * Filter and Render Brand Products
   */
  renderBrandProducts() {
    const grid = document.getElementById('brandProductsGrid');
    const countEl = document.getElementById('brandResultsCount');
    if (!grid) return;

    let prods = window.ShopSmartCatalog.getProductsByBrand(this.activeBrand);

    if (this.activeSeries !== 'all') {
      prods = prods.filter(p => p.series === this.activeSeries);
    }

    if (this.activeProductType !== 'all') {
      prods = prods.filter(p => p.productType === this.activeProductType);
    }

    // Sort
    if (this.sortBy === 'price-asc') prods.sort((a, b) => a.price - b.price);
    else if (this.sortBy === 'price-desc') prods.sort((a, b) => b.price - a.price);
    else if (this.sortBy === 'rating') prods.sort((a, b) => b.rating - a.rating);
    else if (this.sortBy === 'discount') prods.sort((a, b) => b.discount - a.discount);

    if (countEl) {
      countEl.textContent = `Showing ${prods.length} ${this.activeBrand} products`;
    }

    if (prods.length === 0) {
      grid.innerHTML = `
        <div class="no-results-box" style="grid-column: 1 / -1;">
          <i data-lucide="filter-x"></i>
          <h3>No matching ${this.activeBrand} products found</h3>
          <p>Try resetting the series or product type filters.</p>
          <button class="btn btn-outline" onclick="BrandNavigation.setSeriesFilter('all'); BrandNavigation.setTypeFilter('all');">Reset Filters</button>
        </div>
      `;
      if (window.ShopSmartUtils && window.ShopSmartUtils.refreshIcons) window.ShopSmartUtils.refreshIcons();
      return;
    }

    grid.innerHTML = prods.map(p => window.ShopSmartProductRenderer ? window.ShopSmartProductRenderer.renderProductCard(p) : `
      <div class="product-card">
        <img src="${p.image}" alt="${p.name}">
        <h4>${p.name}</h4>
        <p>₹${p.price.toLocaleString('en-IN')}</p>
      </div>
    `).join('');

    if (window.ShopSmartUtils && window.ShopSmartUtils.refreshIcons) {
      window.ShopSmartUtils.refreshIcons();
    }
  },

  /**
   * Brand Directory Index (when no ?brand parameter is provided)
   */
  renderBrandDirectory() {
    const container = document.getElementById('brandDirectoryContainer');
    const mainSection = document.getElementById('brandShowroomSection');
    if (mainSection) mainSection.style.display = 'none';
    if (!container) return;

    container.style.display = 'block';
    const brands = window.ShopSmartCatalog.getBrands();

    container.innerHTML = `
      <div class="brand-directory-header">
        <h1>All Brands Directory (${brands.length})</h1>
        <p>Browse products by leading global and national brands.</p>
        <div class="brand-search-box">
          <input type="text" id="brandDirectorySearch" placeholder="Search brands..." oninput="BrandNavigation.filterBrandDirectory(this.value)">
        </div>
      </div>
      <div class="brand-cards-grid" id="brandDirectoryGrid">
        ${brands.map(b => `
          <a href="brand.html?brand=${encodeURIComponent(b.name)}" class="brand-showcase-card">
            <h3>${b.name}</h3>
            <span class="brand-count-badge">${b.productCount} Products</span>
            <p class="brand-cats-sub">${b.categories.join(', ')}</p>
          </a>
        `).join('')}
      </div>
    `;
  },

  filterBrandDirectory(query) {
    const grid = document.getElementById('brandDirectoryGrid');
    if (!grid) return;

    const q = (query || '').toLowerCase().trim();
    const brands = window.ShopSmartCatalog.getBrands().filter(b => b.name.toLowerCase().includes(q));

    grid.innerHTML = brands.map(b => `
      <a href="brand.html?brand=${encodeURIComponent(b.name)}" class="brand-showcase-card">
        <h3>${b.name}</h3>
        <span class="brand-count-badge">${b.productCount} Products</span>
        <p class="brand-cats-sub">${b.categories.join(', ')}</p>
      </a>
    `).join('');
  }
};

window.BrandNavigation = BrandNavigation;

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.endsWith('brand.html') || window.location.pathname.includes('brand')) {
    BrandNavigation.initBrandShowroom();
  }
});
