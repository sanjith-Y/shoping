/**
 * ShopSmart — Category Navigation Controller
 * Handles 15 Category Navigation, Hierarchy, Breadcrumbs, and Subcategory Filters
 */

'use strict';

const CategoryNav = {
  /**
   * Render category bar with 15 categories and Lucide icons
   * Target container: #categoryNavStrip or #categoryDropdownMenu
   */
  async renderCategoryStrip(containerId = 'categoryNavStrip') {
    const container = document.getElementById(containerId);
    if (!container) return;

    await window.ShopSmartCatalog.load();
    const categories = window.ShopSmartCatalog.getCategories();

    // Check active category from URL
    const urlParams = new URLSearchParams(window.location.search);
    const activeCategory = urlParams.get('category') || '';

    container.innerHTML = categories.map(cat => {
      const isActive = activeCategory.toLowerCase() === cat.name.toLowerCase();
      return `
        <a href="products.html?category=${encodeURIComponent(cat.name)}" 
           class="category-nav-item ${isActive ? 'active' : ''}"
           title="${cat.name} (${cat.productCount} items)">
          <i data-lucide="${cat.icon || 'tag'}"></i>
          <span>${cat.name}</span>
        </a>
      `;
    }).join('');

    if (window.ShopSmartUtils && window.ShopSmartUtils.refreshIcons) {
      window.ShopSmartUtils.refreshIcons();
    }
  },

  /**
   * Generate breadcrumbs HTML based on hierarchy:
   * Home > Category > Brand > Product Type > Series > Product
   */
  generateBreadcrumbs({ category, brand, productType, series, productName }) {
    let crumbs = [
      { label: 'Home', url: 'index.html' }
    ];

    if (category) {
      crumbs.push({
        label: category,
        url: `products.html?category=${encodeURIComponent(category)}`
      });
    }

    if (brand) {
      crumbs.push({
        label: brand,
        url: `brand.html?brand=${encodeURIComponent(brand)}`
      });
    }

    if (productType) {
      crumbs.push({
        label: productType,
        url: `products.html?category=${encodeURIComponent(category || '')}&productType=${encodeURIComponent(productType)}`
      });
    }

    if (series) {
      crumbs.push({
        label: series,
        url: `products.html?category=${encodeURIComponent(category || '')}&brand=${encodeURIComponent(brand || '')}&series=${encodeURIComponent(series)}`
      });
    }

    if (productName) {
      crumbs.push({
        label: productName,
        url: null // Active / current page
      });
    }

    return `
      <nav class="breadcrumb-nav" aria-label="Breadcrumb">
        <ol class="breadcrumb-list">
          ${crumbs.map((c, i) => {
            const isLast = i === crumbs.length - 1;
            if (isLast || !c.url) {
              return `<li class="breadcrumb-item active" aria-current="page">${c.label}</li>`;
            }
            return `<li class="breadcrumb-item"><a href="${c.url}">${c.label}</a></li>`;
          }).join('')}
        </ol>
      </nav>
    `;
  },

  /**
   * Populate product types dynamically for a selected category
   */
  async populateProductTypes(categoryName, selectElementId) {
    const select = document.getElementById(selectElementId);
    if (!select) return;

    await window.ShopSmartCatalog.load();
    const types = window.ShopSmartCatalog.getProductTypesByCategory(categoryName);

    select.innerHTML = '<option value="all">All Product Types</option>' +
      types.map(t => `<option value="${t}">${t}</option>`).join('');
  }
};

window.ShopSmartCategoryNav = CategoryNav;

// Auto-init on load if category strip container is present
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('categoryNavStrip')) {
    CategoryNav.renderCategoryStrip('categoryNavStrip');
  }
});
