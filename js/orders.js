/**
 * ShopSmart — Order History, Checkout Processor & Invoice Generator
 * Persists orders to Firestore (Production) or LocalStorage (Dev Mode)
 */

'use strict';

const ORDERS_STORAGE_KEY = 'shopsmart_orders';

function getAllOrders() {
  try {
    const user = window.ShopSmartAuth ? window.ShopSmartAuth.getCurrentUser() : null;
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : [];
    if (!user) return all;
    // Return orders belonging to current user or placed in guest mode
    return all.filter(o => !o.userId || o.userId === user.uid);
  } catch (e) {
    return [];
  }
}

/**
 * Save new order record
 * @param {Object} orderData
 */
async function createOrder(orderData) {
  const user = window.ShopSmartAuth ? window.ShopSmartAuth.getCurrentUser() : null;
  const orderId = `SS-2026-${Math.floor(10000 + Math.random() * 90000)}`;

  const orderRecord = {
    orderId,
    userId: user ? user.uid : null,
    customerName: orderData.name,
    customerEmail: orderData.email,
    customerPhone: orderData.phone,
    shippingAddress: {
      house: orderData.house,
      street: orderData.street,
      city: orderData.city || 'Coimbatore',
      state: orderData.state || 'Tamil Nadu',
      pin: orderData.pin || '641002'
    },
    paymentMethod: orderData.paymentMethod || 'Cash on Delivery',
    items: [...orderData.items],
    breakdown: { ...orderData.breakdown },
    status: 'Order Placed',
    statusTimeline: [
      { status: 'Order Placed', time: new Date().toISOString(), completed: true },
      { status: 'Confirmed', time: null, completed: false },
      { status: 'Shipped', time: null, completed: false },
      { status: 'Out for Delivery', time: null, completed: false },
      { status: 'Delivered', time: null, completed: false }
    ],
    createdAt: new Date().toISOString()
  };

  // 1. Production Firebase Firestore
  const fb = window.ShopSmartFirebase;
  if (fb && fb.isConfigured && fb.db) {
    try {
      await fb.db.collection('orders').doc(orderId).set(orderRecord);
    } catch (e) {
      console.warn('Firestore order save error:', e);
    }
  }

  // 2. LocalStorage Persistence
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    existing.unshift(orderRecord);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(existing));
  } catch (e) {
    console.warn('Local order storage error:', e);
  }

  return orderRecord;
}

/**
 * Render Orders History List (orders.html)
 */
function renderOrdersPage() {
  const container = document.getElementById('ordersListContainer');
  if (!container) return;

  const orders = getAllOrders();

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="text-center" style="padding: 60px 20px;">
        <i data-lucide="package" style="width: 56px; height: 56px; margin: 0 auto 16px; color: var(--text-subtle);"></i>
        <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 8px;">No Orders Placed Yet</h2>
        <p class="text-muted" style="margin-bottom: 24px;">When you place an order, its details and delivery tracking will appear here.</p>
        <a href="products.html" class="btn btn-primary btn-lg">Start Shopping</a>
      </div>
    `;
    window.ShopSmartUtils.refreshIcons();
    return;
  }

  container.innerHTML = orders.map(order => {
    return `
      <div style="background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 20px; box-shadow: var(--shadow-xs);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; padding-bottom: 16px; border-bottom: 1px solid var(--border-color); margin-bottom: 16px;">
          <div>
            <div style="font-size: 0.8125rem; color: var(--text-subtle);">Order Reference</div>
            <div style="font-weight: 700; font-size: 1.125rem; color: var(--primary);">${order.orderId}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${window.ShopSmartUtils.formatDateIST(order.createdAt)}</div>
          </div>
          <div class="text-right">
            <span class="hero-pill" style="margin-bottom: 4px; background-color: var(--success-light); color: var(--success);">
              ● ${order.status}
            </span>
            <div style="font-size: 1.125rem; font-weight: 700;">${window.ShopSmartUtils.formatINR(order.breakdown.grandTotal)}</div>
          </div>
        </div>

        <div style="margin-bottom: 16px;">
          <h4 style="font-size: 0.875rem; font-weight: 600; margin-bottom: 10px;">Purchased Items (${order.items.length})</h4>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${order.items.map(item => {
              const p = typeof PRODUCTS !== 'undefined' ? PRODUCTS.find(x => x.id === item.productId) : null;
              if (!p) return '';
              return `
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem;">
                  <span>${p.name} × <strong>${item.quantity}</strong></span>
                  <span style="font-weight: 600;">${window.ShopSmartUtils.formatINR(p.price * item.quantity)}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div style="background-color: var(--bg-subtle); padding: 12px 16px; border-radius: var(--radius-md); font-size: 0.8125rem; margin-bottom: 16px;">
          <strong>Delivering to:</strong> ${order.shippingAddress.house}, ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pin}
        </div>

        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button class="btn btn-secondary btn-sm" onclick="window.ShopSmartOrders.printInvoice('${order.orderId}')">
            <i data-lucide="printer"></i> Download Order Summary
          </button>
        </div>
      </div>
    `;
  }).join('');

  window.ShopSmartUtils.refreshIcons();
}

/**
 * Generate Printable Order Summary / Invoice
 * @param {string} orderId
 */
function printInvoice(orderId) {
  const orders = getAllOrders();
  const order = orders.find(o => o.orderId === orderId);
  if (!order) return;

  const invoiceWindow = window.open('', '_blank');
  invoiceWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Order Summary - ${order.orderId}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f766e; padding-bottom: 20px; margin-bottom: 24px; }
        .logo { font-size: 24px; font-weight: bold; color: #0f766e; }
        table { width: 100%; border-collapse: collapse; margin: 24px 0; }
        th, td { padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: left; }
        th { background: #f8fafc; }
        .total-box { margin-left: auto; width: 300px; }
        .total-row { display: flex; justify-content: space-between; padding: 6px 0; }
        .grand-total { font-size: 18px; font-weight: bold; border-top: 2px solid #0f766e; padding-top: 8px; margin-top: 8px; }
        .disclaimer { font-size: 12px; color: #64748b; margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">ShopSmart</div>
          <div>E-Commerce Retail Store</div>
          <div>Coimbatore, Tamil Nadu, India</div>
        </div>
        <div style="text-align: right;">
          <h2>Order Summary</h2>
          <div><strong>Order ID:</strong> ${order.orderId}</div>
          <div><strong>Date:</strong> ${window.ShopSmartUtils.formatDateIST(order.createdAt)}</div>
          <div><strong>Status:</strong> ${order.status}</div>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <div>
          <strong>Billed & Shipped To:</strong><br>
          ${order.customerName}<br>
          ${order.shippingAddress.house}, ${order.shippingAddress.street}<br>
          ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pin}<br>
          Phone: ${order.customerPhone} | Email: ${order.customerEmail}
        </div>
        <div style="text-align: right;">
          <strong>Payment Mode:</strong><br>
          ${order.paymentMethod}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item Description</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Unit Price</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(item => {
            const p = PRODUCTS.find(x => x.id === item.productId);
            if (!p) return '';
            return `
              <tr>
                <td>${p.name}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">${window.ShopSmartUtils.formatINR(p.price)}</td>
                <td style="text-align: right;">${window.ShopSmartUtils.formatINR(p.price * item.quantity)}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <div class="total-box">
        <div class="total-row"><span>Merchandise Subtotal:</span> <span>${window.ShopSmartUtils.formatINR(order.breakdown.merchandiseSubtotal)}</span></div>
        ${order.breakdown.couponDiscount > 0 ? `<div class="total-row" style="color: #15803d;"><span>Coupon Discount:</span> <span>– ${window.ShopSmartUtils.formatINR(order.breakdown.couponDiscount)}</span></div>` : ''}
        <div class="total-row"><span>Delivery Fee:</span> <span>${order.breakdown.deliveryFee === 0 ? 'FREE' : window.ShopSmartUtils.formatINR(order.breakdown.deliveryFee)}</span></div>
        <div class="total-row"><span>GST (18% Illustrative):</span> <span>${window.ShopSmartUtils.formatINR(order.breakdown.gstAmount)}</span></div>
        <div class="total-row grand-total"><span>Grand Total:</span> <span>${window.ShopSmartUtils.formatINR(order.breakdown.grandTotal)}</span></div>
      </div>

      <div class="disclaimer">
        * Demonstration Document: This order summary is generated by ShopSmart online application for demonstration purposes.
      </div>
      <script>window.onload = function() { window.print(); };</script>
    </body>
    </html>
  `);
  invoiceWindow.document.close();
}

// Global Export
window.ShopSmartOrders = {
  getAllOrders,
  createOrder,
  renderOrdersPage,
  printInvoice
};
