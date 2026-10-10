/**
 * ShopSmart — Utilities & Global Helpers
 * Currency Formatting, Theme Controller, Toast System, Modal Helpers
 */

'use strict';

const BUSINESS_CONFIG = {
  storeName: 'ShopSmart',
  city: 'Coimbatore',
  state: 'Tamil Nadu',
  country: 'India',
  currency: 'INR',
  currencySymbol: '₹',
  locale: 'en-IN',
  timeZone: 'Asia/Kolkata',
  defaultPinCode: '641002',
  supportEmail: 'support@shopsmart.demo',
  supportPhone: '+91 1800-456-7890'
};

/**
 * Format numeric value in Indian Rupees (₹)
 * @param {number} amount
 * @param {boolean} showDecimals
 * @returns {string}
 */
function formatINR(amount, showDecimals = false) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat(BUSINESS_CONFIG.locale, {
    style: 'currency',
    currency: BUSINESS_CONFIG.currency,
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0
  }).format(num);
}

/**
 * Format a Date object in IST (Asia/Kolkata)
 * @param {Date|string|number} dateInput
 * @returns {string}
 */
function formatDateIST(dateInput) {
  const date = dateInput ? new Date(dateInput) : new Date();
  return date.toLocaleDateString(BUSINESS_CONFIG.locale, {
    timeZone: BUSINESS_CONFIG.timeZone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Refresh Lucide Icons across DOM
 */
function refreshIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

/**
 * Display a temporary Toast notification
 * @param {string} message
 * @param {'success'|'error'|'info'|'warning'} type
 */
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `<span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

/**
 * Theme Controller: Light / Dark Mode
 */
function initTheme() {
  const saved = localStorage.getItem('shopsmart_theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const target = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', target);
  localStorage.setItem('shopsmart_theme', target);
  updateThemeIcon(target);
  showToast(`Switched to ${target === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
}

function updateThemeIcon(theme) {
  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.setAttribute('title', `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`);
    themeBtn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`);
    const icon = theme === 'dark' ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
    themeBtn.innerHTML = icon;
    refreshIcons();
  }
}

/**
 * Generate 5-star rating HTML
 * @param {number} rating
 * @returns {string}
 */
function generateStarRatingHtml(rating = 5) {
  const rounded = Math.round(rating * 2) / 2;
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= rounded) {
      html += '★';
    } else if (i - 0.5 === rounded) {
      html += '★';
    } else {
      html += '☆';
    }
  }
  return html;
}

/**
 * Modal Management
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    document.body.classList.add('no-scroll');
    refreshIcons();
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    document.body.classList.remove('no-scroll');
  }
}

// Global Export
window.ShopSmartUtils = {
  BUSINESS_CONFIG,
  formatINR,
  formatDateIST,
  refreshIcons,
  showToast,
  initTheme,
  toggleTheme,
  generateStarRatingHtml,
  openModal,
  closeModal
};
