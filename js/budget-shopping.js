/**
 * ShopSmart — Smart Budget Shopping Algorithm & Bundle Generator
 * Generates an optimal bundle of actual catalog products within the user's defined budget
 * Takes into account merchandise prices, estimated delivery fees, and 18% GST!
 */

'use strict';

let currentBudgetBundle = [];
let currentBudgetGoal = 0;

/**
 * Solve knapsack-like constraint satisfaction to build bundle within budget
 * @param {number} totalBudget
 * @param {Array<string>} selectedCategories
 * @param {string} goalText
 */
function generateBudgetBundle(totalBudget, selectedCategories = [], goalText = '') {
  const budget = Number(totalBudget);
  if (!budget || budget < 500) {
    window.ShopSmartUtils.showToast('Please enter a budget of at least ₹500.', 'warning');
    return null;
  }

  currentBudgetGoal = budget;

  const catalogList = (window.ShopSmartCatalog && window.ShopSmartCatalog.getProducts().length > 0) ? window.ShopSmartCatalog.getProducts() : (typeof PRODUCTS !== 'undefined' ? PRODUCTS : []);
  let pool = catalogList.filter(p => p.stock > 0);
  if (selectedCategories && selectedCategories.length > 0 && !selectedCategories.includes('All')) {
    pool = pool.filter(p => selectedCategories.includes(p.category));
  }

  // If goal keywords are present (e.g. "college", "gaming", "fitness")
  if (goalText) {
    const kw = goalText.toLowerCase();
    pool.sort((a, b) => {
      const aScore = (a.name.toLowerCase().includes(kw) || a.category.toLowerCase().includes(kw)) ? 1 : 0;
      const bScore = (b.name.toLowerCase().includes(kw) || b.category.toLowerCase().includes(kw)) ? 1 : 0;
      return bScore - aScore;
    });
  } else {
    // Sort by rating & discount
    pool.sort((a, b) => (b.rating * 10 + b.discountPercent) - (a.rating * 10 + a.discountPercent));
  }

  const selected = [];
  let currentMerchandiseTotal = 0;

  for (const product of pool) {
    // Estimate cost with 18% GST and delivery
    const nextMerchandise = currentMerchandiseTotal + product.price;
    const estDelivery = nextMerchandise >= 999 ? 0 : 99;
    const estGst = Math.round(nextMerchandise * 0.18);
    const estTotalWithTax = nextMerchandise + estGst + estDelivery;

    if (estTotalWithTax <= budget) {
      // Check for duplicate category diversity if pool is large
      const categoryCount = selected.filter(s => s.category === product.category).length;
      if (categoryCount < 2 || selected.length < 3) {
        selected.push(product);
        currentMerchandiseTotal = nextMerchandise;
      }
    }
  }

  currentBudgetBundle = selected;
  renderBudgetBundleUI(budget, selected);
  return selected;
}

function renderBudgetBundleUI(budget, bundle) {
  const container = document.getElementById('budgetBundleResults');
  if (!container) return;

  if (bundle.length === 0) {
    container.innerHTML = `
      <div class="text-center" style="padding: 40px 16px;">
        <i data-lucide="alert-circle" style="width: 48px; height: 48px; margin: 0 auto 12px; color: var(--accent-amber);"></i>
        <h3 style="font-weight: 700; font-size: 1.25rem; margin-bottom: 6px;">No Bundle Could Be Built</h3>
        <p class="text-muted" style="max-width: 460px; margin: 0 auto 16px;">
          We could not find products matching the selected category within ${window.ShopSmartUtils.formatINR(budget)}. Try increasing your budget or selecting more categories.
        </p>
      </div>
    `;
    window.ShopSmartUtils.refreshIcons();
    return;
  }

  let subtotal = 0;
  bundle.forEach(p => subtotal += p.price);
  const delivery = subtotal >= 999 ? 0 : 99;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst + delivery;
  const remaining = budget - total;

  let html = `
    <div class="budget-bundle-card">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: gap; margin-bottom: 16px;">
        <div>
          <span class="hero-pill" style="margin-bottom: 8px;">Smart Bundle Optimized</span>
          <h3 style="font-size: 1.375rem; font-weight: 700;">Recommended Collection (${bundle.length} Products)</h3>
          <p class="text-muted" style="font-size: 0.875rem;">Calculated to stay strictly under your ${window.ShopSmartUtils.formatINR(budget)} budget including 18% GST and shipping.</p>
        </div>
        <div class="text-right">
          <div style="font-size: 0.8125rem; color: var(--text-subtle);">Estimated Final Total</div>
          <div style="font-size: 1.75rem; font-weight: 700; color: var(--primary);">${window.ShopSmartUtils.formatINR(total)}</div>
          <div style="font-size: 0.75rem; color: var(--success); font-weight: 600;">₹${remaining} left under budget</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; margin: 20px 0;">
        ${bundle.map(p => `
          <div style="background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 12px; display: flex; flex-direction: column;">
            <img src="${p.image}" alt="${p.name}" style="height: 120px; object-fit: contain; margin-bottom: 8px;">
            <div style="font-size: 0.6875rem; color: var(--text-subtle); text-transform: uppercase;">${p.category}</div>
            <a href="product-details.html?id=${p.id}" style="font-size: 0.875rem; font-weight: 600; line-height: 1.3; margin-bottom: 6px;">${p.name}</a>
            <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 700; color: var(--primary);">${window.ShopSmartUtils.formatINR(p.price)}</span>
              <button class="btn btn-secondary btn-sm" title="Remove Item" onclick="window.ShopSmartBudget.removeBundleItem('${p.id}')">✕</button>
            </div>
          </div>
        `).join('')}
      </div>

      <div style="background-color: var(--bg-subtle); padding: 14px 18px; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div style="font-size: 0.875rem;">
          Subtotal: <strong>${window.ShopSmartUtils.formatINR(subtotal)}</strong> | 
          GST (18%): <strong>${window.ShopSmartUtils.formatINR(gst)}</strong> | 
          Delivery: <strong>${delivery === 0 ? 'FREE' : window.ShopSmartUtils.formatINR(delivery)}</strong>
        </div>
        <button class="btn btn-primary" onclick="window.ShopSmartBudget.addAllToCart()">
          <i data-lucide="shopping-cart"></i> Add All to Cart
        </button>
      </div>
    </div>
  `;

  container.innerHTML = html;
  window.ShopSmartUtils.refreshIcons();
}

function removeBundleItem(productId) {
  currentBudgetBundle = currentBudgetBundle.filter(p => p.id !== productId);
  renderBudgetBundleUI(currentBudgetGoal, currentBudgetBundle);
}

function addAllToCart() {
  if (currentBudgetBundle.length === 0) return;
  currentBudgetBundle.forEach(p => {
    window.ShopSmartCart.addToCart(p.id, 1);
  });
  window.ShopSmartUtils.showToast(`Added all ${currentBudgetBundle.length} bundle products to your cart!`, 'success');
  window.ShopSmartCart.openCartDrawer();
}

// Global Export
window.ShopSmartBudget = {
  generateBudgetBundle,
  removeBundleItem,
  addAllToCart
};
