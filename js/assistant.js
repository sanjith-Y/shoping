/**
 * ShopSmart — Smart Shopping Assistant
 * Interprets natural language queries against real catalog data and explains recommendation rationale
 */

'use strict';

/**
 * Parse natural language user prompt and query actual catalog
 * @param {string} userQuery
 * @returns {Object} { message, products, explanation }
 */
function askAssistant(userQuery) {
  const q = (userQuery || '').toLowerCase().trim();
  if (!q) {
    return {
      message: "Hello! I am your ShopSmart Shopping Assistant. Ask me anything like 'Show phones under ₹20,000' or 'Find gaming accessories'.",
      products: [],
      explanation: ""
    };
  }

  // Extract budget constraint if present (e.g. "under 20000", "under ₹1500", "within 5000")
  let maxPrice = null;
  const priceMatch = q.match(/(?:under|below|less than|within|budget of)\s*(?:₹|rs\.?|inr)?\s*([0-9,]+)/i);
  if (priceMatch) {
    maxPrice = parseInt(priceMatch[1].replace(/,/g, ''), 10);
  }

  // Identify categories
  const matchedCategories = [];
  const categoriesList = [
    'Mobiles and Tablets', 'Laptops and Computers', 'Audio and Accessories',
    'Men’s Fashion', 'Women’s Fashion', 'Footwear', 'Home and Kitchen',
    'Home Appliances', 'Beauty and Personal Care', 'Sports and Fitness',
    'Books and Stationery', 'Gaming', 'Bags and Travel', 'Furniture and Home Decor',
    'Toys and Accessories'
  ];

  const keywordMap = {
    'phone': 'Mobiles and Tablets',
    'mobile': 'Mobiles and Tablets',
    'tablet': 'Mobiles and Tablets',
    'ipad': 'Mobiles and Tablets',
    'laptop': 'Laptops and Computers',
    'macbook': 'Laptops and Computers',
    'computer': 'Laptops and Computers',
    'audio': 'Audio and Accessories',
    'headphone': 'Audio and Accessories',
    'earbud': 'Audio and Accessories',
    'speaker': 'Audio and Accessories',
    'men': 'Men’s Fashion',
    'shirt': 'Men’s Fashion',
    'women': 'Women’s Fashion',
    'saree': 'Women’s Fashion',
    'dress': 'Women’s Fashion',
    'shoe': 'Footwear',
    'sneaker': 'Footwear',
    'boot': 'Footwear',
    'kitchen': 'Home and Kitchen',
    'mixer': 'Home and Kitchen',
    'cookware': 'Home and Kitchen',
    'appliance': 'Home Appliances',
    'fridge': 'Home Appliances',
    'washing machine': 'Home Appliances',
    'beauty': 'Beauty and Personal Care',
    'skincare': 'Beauty and Personal Care',
    'serum': 'Beauty and Personal Care',
    'sport': 'Sports and Fitness',
    'fitness': 'Sports and Fitness',
    'dumbbell': 'Sports and Fitness',
    'book': 'Books and Stationery',
    'programming': 'Books and Stationery',
    'pen': 'Books and Stationery',
    'notebook': 'Books and Stationery',
    'gaming': 'Gaming',
    'mouse': 'Gaming',
    'keyboard': 'Gaming',
    'controller': 'Gaming',
    'bag': 'Bags and Travel',
    'backpack': 'Bags and Travel',
    'luggage': 'Bags and Travel',
    'suitcase': 'Bags and Travel',
    'furniture': 'Furniture and Home Decor',
    'sofa': 'Furniture and Home Decor',
    'lamp': 'Furniture and Home Decor',
    'decor': 'Furniture and Home Decor',
    'toy': 'Toys and Accessories',
    'lego': 'Toys and Accessories',
    'game': 'Toys and Accessories'
  };

  for (const [kw, cat] of Object.entries(keywordMap)) {
    if (q.includes(kw) && !matchedCategories.includes(cat)) {
      matchedCategories.push(cat);
    }
  }

  // Get complete product list
  const allProducts = (window.ShopSmartCatalog && window.ShopSmartCatalog.getProducts().length > 0) 
    ? window.ShopSmartCatalog.getProducts() 
    : (typeof PRODUCTS !== 'undefined' ? PRODUCTS : []);

  // Detect brands in catalog
  const matchedBrands = [];
  const knownBrands = window.ShopSmartCatalog && window.ShopSmartCatalog.getBrands().length > 0
    ? window.ShopSmartCatalog.getBrands().map(b => b.name)
    : ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'boAt', 'Sony', 'JBL', 'Nike', 'Adidas', 'Puma', 'ASUS', 'HP', 'Dell', 'Lenovo', 'LG', 'Prestige', 'Philips', 'Logitech', 'LEGO'];

  for (const b of knownBrands) {
    const bLower = b.toLowerCase();
    if (q.includes(bLower) && !matchedBrands.includes(b)) {
      matchedBrands.push(b);
    }
  }

  // Filter products
  let results = allProducts.filter(p => p.stock > 0);

  if (matchedBrands.length > 0) {
    results = results.filter(p => matchedBrands.some(b => p.brand.toLowerCase() === b.toLowerCase()));
  }

  if (matchedCategories.length > 0) {
    results = results.filter(p => matchedCategories.includes(p.category));
  }

  if (maxPrice !== null) {
    results = results.filter(p => p.price <= maxPrice);
  }

  // Free text search matching if still many results or brand/cat weren't matched
  const terms = q.replace(/(show|find|suggest|search|compare|for|under|below|within|rupees|₹|rs|me|a|an|the)/gi, '').trim().split(/\s+/).filter(Boolean);
  if (terms.length > 0 && (results.length > 6 || (matchedBrands.length === 0 && matchedCategories.length === 0))) {
    const scored = results.map(p => {
      const pText = (p.name + ' ' + p.brand + ' ' + (p.series || '') + ' ' + (p.productType || '') + ' ' + p.description).toLowerCase();
      let matchCount = 0;
      for (const t of terms) {
        if (pText.includes(t)) matchCount++;
      }
      return { product: p, score: matchCount };
    }).filter(item => item.score > 0);

    if (scored.length > 0) {
      scored.sort((a, b) => b.score - a.score || b.product.rating - a.product.rating);
      results = scored.map(s => s.product);
    }
  }

  // If still empty and budget is specified, fall back to closest price matches
  if (results.length === 0 && maxPrice !== null) {
    results = allProducts.filter(p => p.price <= maxPrice).slice(0, 4);
  }

  // Limit to top 6
  results = results.slice(0, 6);

  let explanation = `Found ${results.length} verified catalog products`;
  if (matchedBrands.length > 0) explanation += ` for brand "${matchedBrands.join(', ')}"`;
  if (matchedCategories.length > 0) explanation += ` in "${matchedCategories.join(', ')}"`;
  if (maxPrice !== null) explanation += ` priced under ${window.ShopSmartUtils.formatINR(maxPrice)}`;
  explanation += `. Sourced directly from our authentic catalog with live pricing.`;

  return {
    message: results.length > 0
      ? `Here are the best matching items from our live catalog:`
      : `I couldn't find an exact match for "${userQuery}". Try asking for a specific brand (e.g. "Samsung", "Nike", "Sony") or category.`,
    products: results,
    explanation
  };
}

/**
 * Render Assistant Chat Conversation
 */
function renderAssistantResponse(query) {
  const chatMessages = document.getElementById('assistantMessages');
  if (!chatMessages) return;

  // Add User Message
  const userMsgEl = document.createElement('div');
  userMsgEl.style.cssText = 'align-self: flex-end; background-color: var(--primary); color: #fff; padding: 12px 18px; border-radius: 16px 16px 4px 16px; max-width: 80%; margin-bottom: 12px; font-size: 0.9375rem;';
  userMsgEl.textContent = query;
  chatMessages.appendChild(userMsgEl);

  // Generate response
  const response = askAssistant(query);

  const botMsgEl = document.createElement('div');
  botMsgEl.style.cssText = 'align-self: flex-start; background-color: var(--bg-surface); border: 1px solid var(--border-color); padding: 16px; border-radius: 16px 16px 16px 4px; max-width: 90%; margin-bottom: 16px; font-size: 0.9375rem;';

  let botHtml = `
    <div style="font-weight: 600; margin-bottom: 6px;">${response.message}</div>
    <div class="text-muted" style="font-size: 0.8125rem; margin-bottom: 14px;">${response.explanation}</div>
  `;

  if (response.products.length > 0) {
    botHtml += `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px;">
        ${response.products.map(p => `
          <div style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px; background-color: var(--bg-card); display: flex; flex-direction: column;">
            <img src="${p.image}" alt="${p.name}" style="height: 100px; object-fit: contain; margin-bottom: 6px;">
            <div style="font-size: 0.6875rem; color: var(--text-subtle); text-transform: uppercase;">${p.brand}</div>
            <a href="product-details.html?id=${p.id}" style="font-size: 0.8125rem; font-weight: 600; line-height: 1.25; margin-bottom: 4px;">${p.name}</a>
            <div style="font-weight: 700; color: var(--primary); font-size: 0.9375rem; margin-top: auto;">${window.ShopSmartUtils.formatINR(p.price)}</div>
            <button class="btn btn-primary btn-sm btn-block" style="margin-top: 6px;" onclick="window.ShopSmartCart.addToCart('${p.id}')">Add to Cart</button>
          </div>
        `).join('')}
      </div>
    `;
  }

  botMsgEl.innerHTML = botHtml;
  chatMessages.appendChild(botMsgEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  window.ShopSmartUtils.refreshIcons();
}

// Global Export
window.ShopSmartAssistant = {
  askAssistant,
  renderAssistantResponse
};
