/**
 * ShopSmart — Product Comparison Controller
 * Compare up to 4 items with category-adaptive technical & lifestyle attributes
 */

'use strict';

const COMPARE_STORAGE_KEY = 'shopsmart_compare_items';
const MAX_COMPARE_LIMIT = 4;

function getCompareList() {
  try {
    const raw = localStorage.getItem(COMPARE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function addToCompare(productId) {
  const list = getCompareList();
  const product = (window.ShopSmartCatalog && window.ShopSmartCatalog.getProductById(productId)) || 
                  (typeof PRODUCTS !== 'undefined' ? PRODUCTS.find(p => p.id === productId) : null);
  if (!product) return;

  if (list.includes(productId)) {
    window.ShopSmartUtils.showToast(`${product.name} is already in comparison table.`, 'info');
    return;
  }

  if (list.length >= MAX_COMPARE_LIMIT) {
    window.ShopSmartUtils.showToast(`You can compare up to ${MAX_COMPARE_LIMIT} items at a time. Remove one first.`, 'warning');
    return;
  }

  list.push(productId);
  localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(list));
  updateCompareBadges();
  window.ShopSmartUtils.showToast(`Added ${product.name} to compare list.`, 'success');
  renderCompareTable();
}

function removeFromCompare(productId) {
  let list = getCompareList();
  list = list.filter(id => id !== productId);
  localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(list));
  updateCompareBadges();
  renderCompareTable();
  window.ShopSmartUtils.showToast('Item removed from comparison.', 'info');
}

function clearCompare() {
  localStorage.removeItem(COMPARE_STORAGE_KEY);
  updateCompareBadges();
  renderCompareTable();
  window.ShopSmartUtils.showToast('Comparison list cleared.', 'info');
}

function updateCompareBadges() {
  const list = getCompareList();
  const badges = document.querySelectorAll('.compare-badge-count');
  badges.forEach(b => {
    b.textContent = list.length;
    b.classList.toggle('hidden', list.length === 0);
  });
}

function renderCompareTable() {
  const container = document.getElementById('compareContainer');
  if (!container) return;

  const list = getCompareList();
  if (list.length === 0) {
    container.innerHTML = `
      <div class="text-center" style="padding: 60px 20px;">
        <i data-lucide="columns-3" style="width: 56px; height: 56px; margin: 0 auto 16px; color: var(--text-subtle);"></i>
        <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 8px;">No Products to Compare</h2>
        <p class="text-muted" style="margin-bottom: 24px;">Browse items in the catalog and click the comparison icon to view side-by-side specs.</p>
        <a href="products.html" class="btn btn-primary btn-lg">Browse Products</a>
      </div>
    `;
    window.ShopSmartUtils.refreshIcons();
    return;
  }

  const getP = id => (window.ShopSmartCatalog && window.ShopSmartCatalog.getProductById(id)) || 
                     (typeof PRODUCTS !== 'undefined' ? PRODUCTS.find(p => p.id === id) : null);
  const products = list.map(getP).filter(Boolean);

  let html = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <div>Comparing <strong>${products.length} of ${MAX_COMPARE_LIMIT}</strong> products</div>
      <button class="btn btn-secondary btn-sm" onclick="window.ShopSmartCompare.clearCompare()">
        <i data-lucide="trash-2"></i> Clear All
      </button>
    </div>
    <div style="overflow-x: auto;">
      <table class="compare-table">
        <thead>
          <tr>
            <th style="min-width: 180px;">Feature</th>
            ${products.map(p => `
              <th style="min-width: 220px; text-align: center;">
                <div style="margin-bottom: 10px;">
                  <img src="${p.image}" alt="${p.name}" style="height: 140px; margin: 0 auto 10px; object-fit: contain;">
                  <div style="font-size: 0.875rem; font-weight: 600; line-height: 1.3; margin-bottom: 4px;">${p.name}</div>
                  <div style="color: var(--primary); font-weight: 700; font-size: 1.125rem;">${window.ShopSmartUtils.formatINR(p.price)}</div>
                </div>
                <div style="display: flex; gap: 6px; justify-content: center;">
                  <button class="btn btn-primary btn-sm" onclick="window.ShopSmartCart.addToCart('${p.id}')">Add to Cart</button>
                  <button class="btn btn-secondary btn-sm" onclick="window.ShopSmartCompare.removeFromCompare('${p.id}')">Remove</button>
                </div>
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Category</strong></td>
            ${products.map(p => `<td>${p.category}</td>`).join('')}
          </tr>
          <tr>
            <td><strong>Brand</strong></td>
            ${products.map(p => `<td>${p.brand}</td>`).join('')}
          </tr>
          <tr>
            <td><strong>Rating</strong></td>
            ${products.map(p => `<td>${p.rating} ★ (${p.reviewCount} reviews)</td>`).join('')}
          </tr>
          <tr>
            <td><strong>Stock Availability</strong></td>
            ${products.map(p => `<td><span class="${p.stock > 0 ? 'text-success' : 'text-danger'} font-semibold">${p.stock > 0 ? `In Stock (${p.stock} units)` : 'Out of Stock'}</span></td>`).join('')}
          </tr>
          <tr>
            <td><strong>Discount</strong></td>
            ${products.map(p => `<td>${p.discountPercent > 0 ? `<span class="text-danger font-semibold">${p.discountPercent}% OFF</span>` : 'Regular Price'}</td>`).join('')}
          </tr>
          <tr>
            <td><strong>Key Highlights</strong></td>
            ${products.map(p => `<td><ul style="list-style: disc; padding-left: 16px; font-size: 0.8125rem;">${(p.highlights || []).map(h => `<li>${h}</li>`).join('')}</ul></td>`).join('')}
          </tr>
          <tr>
            <td><strong>Category Specs</strong></td>
            ${products.map(p => `<td>${formatSpecs(p.specs)}</td>`).join('')}
          </tr>
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;
  window.ShopSmartUtils.refreshIcons();
}

function formatSpecs(specs) {
  if (!specs || Object.keys(specs).length === 0) return 'Standard Specifications';
  return Object.entries(specs).map(([k, v]) => `<div><strong style="text-transform: capitalize;">${k}:</strong> ${v}</div>`).join('');
}

// Global Export
window.ShopSmartCompare = {
  getCompareList,
  addToCompare,
  removeFromCompare,
  clearCompare,
  updateCompareBadges,
  renderCompareTable
};
