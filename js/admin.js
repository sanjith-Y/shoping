/**
 * ShopSmart — Admin Dashboard Controller
 * Product Inventory CRUD, Stock & Price Updates, Order Inspection, Sales Metrics
 */

'use strict';

const ADMIN_STORAGE_KEY = 'shopsmart_custom_products';

function getAdminProducts() {
  const customRaw = localStorage.getItem(ADMIN_STORAGE_KEY);
  const customProducts = customRaw ? JSON.parse(customRaw) : [];
  // Merge custom products with base PRODUCTS
  const base = typeof PRODUCTS !== 'undefined' ? [...PRODUCTS] : [];

  // Overwrite base with any edits
  customProducts.forEach(cp => {
    const idx = base.findIndex(b => b.id === cp.id);
    if (idx !== -1) {
      base[idx] = cp;
    } else {
      base.unshift(cp);
    }
  });
  return base;
}

function saveCustomProduct(productData) {
  const customRaw = localStorage.getItem(ADMIN_STORAGE_KEY);
  let customProducts = customRaw ? JSON.parse(customRaw) : [];

  const existingIdx = customProducts.findIndex(p => p.id === productData.id);
  if (existingIdx !== -1) {
    customProducts[existingIdx] = productData;
  } else {
    customProducts.push(productData);
  }

  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(customProducts));
  window.ShopSmartUtils.showToast(`Product "${productData.name}" saved successfully.`, 'success');
  renderAdminInventoryTable();
}

function deleteProduct(productId) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  const customRaw = localStorage.getItem(ADMIN_STORAGE_KEY);
  let customProducts = customRaw ? JSON.parse(customRaw) : [];
  customProducts = customProducts.filter(p => p.id !== productId);
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(customProducts));

  window.ShopSmartUtils.showToast('Product removed from active catalog.', 'info');
  renderAdminInventoryTable();
}

function updateStock(productId, newStock) {
  const products = getAdminProducts();
  const p = products.find(x => x.id === productId);
  if (!p) return;

  p.stock = Math.max(0, parseInt(newStock, 10) || 0);
  saveCustomProduct(p);
}

function updatePrice(productId, newPrice) {
  const products = getAdminProducts();
  const p = products.find(x => x.id === productId);
  if (!p) return;

  p.price = Math.max(1, parseInt(newPrice, 10) || 1);
  saveCustomProduct(p);
}

function renderAdminStats() {
  const products = getAdminProducts();
  const orders = window.ShopSmartOrders ? window.ShopSmartOrders.getAllOrders() : [];

  const totalProducts = products.length;
  const inStock = products.filter(p => p.stock > 0).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const outOfStock = products.filter(p => p.stock === 0).length;

  let totalSales = 0;
  orders.forEach(o => {
    if (o.breakdown && o.breakdown.grandTotal) {
      totalSales += o.breakdown.grandTotal;
    }
  });

  const statTotalProd = document.getElementById('statTotalProducts');
  const statInStock = document.getElementById('statInStock');
  const statLowStock = document.getElementById('statLowStock');
  const statTotalOrders = document.getElementById('statTotalOrders');
  const statTotalRevenue = document.getElementById('statTotalRevenue');

  if (statTotalProd) statTotalProd.textContent = totalProducts;
  if (statInStock) statInStock.textContent = inStock;
  if (statLowStock) statLowStock.textContent = lowStock;
  if (statTotalOrders) statTotalOrders.textContent = orders.length;
  if (statTotalRevenue) statTotalRevenue.textContent = window.ShopSmartUtils.formatINR(totalSales);
}

function renderAdminInventoryTable() {
  const container = document.getElementById('adminInventoryBody');
  if (!container) return;

  const products = getAdminProducts();
  renderAdminStats();

  container.innerHTML = products.map((p, idx) => {
    return `
      <tr>
        <td style="padding: 10px; font-size: 0.8125rem;">${idx + 1}</td>
        <td style="padding: 10px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${p.image}" alt="${p.name}" style="width: 40px; height: 40px; object-fit: contain; border-radius: 4px; border: 1px solid var(--border-color);">
            <div>
              <div style="font-weight: 600; font-size: 0.875rem;">${p.name}</div>
              <div style="font-size: 0.75rem; color: var(--text-subtle);">${p.category} • ${p.brand}</div>
            </div>
          </div>
        </td>
        <td style="padding: 10px;">
          <input 
            type="number" 
            value="${p.price}" 
            style="width: 100px; padding: 4px 8px; font-size: 0.875rem;" 
            onchange="window.ShopSmartAdmin.updatePrice('${p.id}', this.value)"
          >
        </td>
        <td style="padding: 10px;">
          <input 
            type="number" 
            value="${p.stock}" 
            style="width: 80px; padding: 4px 8px; font-size: 0.875rem;" 
            onchange="window.ShopSmartAdmin.updateStock('${p.id}', this.value)"
          >
        </td>
        <td style="padding: 10px;">
          <span class="hero-pill" style="font-size: 0.75rem; background-color: ${p.stock > 0 ? 'var(--success-light)' : 'var(--accent-rose-light)'}; color: ${p.stock > 0 ? 'var(--success)' : 'var(--danger)'};">
            ${p.stock > 5 ? 'In Stock' : (p.stock > 0 ? 'Low Stock' : 'Out of Stock')}
          </span>
        </td>
        <td style="padding: 10px; text-align: right;">
          <button class="btn btn-secondary btn-sm" onclick="window.ShopSmartAdmin.openEditModal('${p.id}')">Edit</button>
          <button class="btn btn-secondary btn-sm text-danger" onclick="window.ShopSmartAdmin.deleteProduct('${p.id}')">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

function openEditModal(productId) {
  const p = getAdminProducts().find(x => x.id === productId);
  if (!p) return;

  const idInput = document.getElementById('adminProdId');
  const nameInput = document.getElementById('adminProdName');
  const catInput = document.getElementById('adminProdCategory');
  const brandInput = document.getElementById('adminProdBrand');
  const priceInput = document.getElementById('adminProdPrice');
  const origPriceInput = document.getElementById('adminProdOrigPrice');
  const stockInput = document.getElementById('adminProdStock');
  const imgInput = document.getElementById('adminProdImage');
  const descInput = document.getElementById('adminProdDesc');

  if (idInput) idInput.value = p.id;
  if (nameInput) nameInput.value = p.name;
  if (catInput) catInput.value = p.category;
  if (brandInput) brandInput.value = p.brand;
  if (priceInput) priceInput.value = p.price;
  if (origPriceInput) origPriceInput.value = p.originalPrice || p.price;
  if (stockInput) stockInput.value = p.stock;
  if (imgInput) imgInput.value = p.image;
  if (descInput) descInput.value = p.description || '';

  window.ShopSmartUtils.openModal('adminProductModal');
}

function openAddModal() {
  const newId = `custom-${Date.now()}`;
  const idInput = document.getElementById('adminProdId');
  if (idInput) idInput.value = newId;

  document.getElementById('adminProductForm').reset();
  if (idInput) idInput.value = newId;

  window.ShopSmartUtils.openModal('adminProductModal');
}

function handleProductFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('adminProdId').value;
  const name = document.getElementById('adminProdName').value;
  const category = document.getElementById('adminProdCategory').value;
  const brand = document.getElementById('adminProdBrand').value;
  const price = parseInt(document.getElementById('adminProdPrice').value, 10);
  const originalPrice = parseInt(document.getElementById('adminProdOrigPrice').value, 10) || price;
  const stock = parseInt(document.getElementById('adminProdStock').value, 10);
  const image = document.getElementById('adminProdImage').value || 'assets/fallback/product-fallback.svg';
  const description = document.getElementById('adminProdDesc').value;

  const discountPercent = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  const productObj = {
    id,
    name,
    category,
    brand,
    price,
    originalPrice,
    discountPercent,
    stock,
    rating: 4.8,
    reviewCount: 150,
    badge: 'Admin Added',
    imageFit: 'contain',
    image,
    description,
    highlights: ['Added via Admin Console', 'Authentic Stock Item', 'Fast Delivery in Coimbatore'],
    specs: { source: 'Admin Console' }
  };

  saveCustomProduct(productObj);
  window.ShopSmartUtils.closeModal('adminProductModal');
}

// Global Export
window.ShopSmartAdmin = {
  getAdminProducts,
  saveCustomProduct,
  deleteProduct,
  updateStock,
  updatePrice,
  renderAdminInventoryTable,
  openEditModal,
  openAddModal,
  handleProductFormSubmit
};
