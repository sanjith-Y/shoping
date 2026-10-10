/**
 * ShopSmart — Unified Catalog Data & Navigation Layer
 * Supports asynchronous fetch() loading from JSON with zero-config fallback to window.PRODUCTS
 */

'use strict';

class CatalogManager {
  constructor() {
    this.products = [];
    this.categories = [];
    this.brands = [];
    this.isLoaded = false;
    this.loadPromise = null;
  }

  /**
   * Initialize catalog data
   */
  async load() {
    if (this.isLoaded) return this;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      // 1. Try fetching from data/*.json
      try {
        const [prodRes, catRes, brandRes] = await Promise.all([
          fetch('data/products.json').then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('data/categories.json').then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('data/brands.json').then(r => r.ok ? r.json() : null).catch(() => null)
        ]);

        if (prodRes && Array.isArray(prodRes) && prodRes.length > 0) {
          this.products = prodRes;
          this.categories = catRes || [];
          this.brands = brandRes || [];
          this.isLoaded = true;
          return this;
        }
      } catch (err) {
        console.warn('[ShopSmart Catalog] Fetch failed (likely file:// protocol), falling back to window.PRODUCTS:', err);
      }

      // 2. Synchronous fallback via window.PRODUCTS
      if (typeof window !== 'undefined' && window.PRODUCTS && Array.isArray(window.PRODUCTS)) {
        this.products = window.PRODUCTS;
        this.buildMetadataFromProducts();
        this.isLoaded = true;
        return this;
      }

      console.warn('[ShopSmart Catalog] No products found in fetch or window.PRODUCTS');
      this.isLoaded = true;
      return this;
    })();

    return this.loadPromise;
  }

  /**
   * Derive categories and brands automatically if JSON files weren't loaded
   */
  buildMetadataFromProducts() {
    const brandMap = {};
    const catMap = {};

    this.products.forEach(p => {
      // Category count
      if (!catMap[p.category]) {
        catMap[p.category] = {
          id: p.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name: p.category,
          productCount: 0,
          productTypes: new Set(),
          popularBrands: new Set()
        };
      }
      catMap[p.category].productCount++;
      if (p.productType) catMap[p.category].productTypes.add(p.productType);
      if (p.brand) catMap[p.category].popularBrands.add(p.brand);

      // Brand count
      if (!brandMap[p.brand]) {
        brandMap[p.brand] = {
          name: p.brand,
          slug: p.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          categories: new Set(),
          productCount: 0
        };
      }
      brandMap[p.brand].productCount++;
      brandMap[p.brand].categories.add(p.category);
    });

    this.categories = Object.values(catMap).map(c => ({
      ...c,
      productTypes: Array.from(c.productTypes),
      popularBrands: Array.from(c.popularBrands).slice(0, 8)
    }));

    this.brands = Object.values(brandMap).map(b => ({
      ...b,
      categories: Array.from(b.categories)
    })).sort((a, b) => a.name.localeCompare(b.name));
  }

  // --- Accessors ---

  getProducts() {
    return this.products;
  }

  getProductById(id) {
    if (!id) return null;
    return this.products.find(p => p.id === id) || null;
  }

  getCategories() {
    return this.categories;
  }

  getCategoryByName(name) {
    if (!name) return null;
    return this.categories.find(c => c.name.toLowerCase() === name.toLowerCase()) || null;
  }

  getBrands() {
    return this.brands;
  }

  getBrandByName(name) {
    if (!name) return null;
    return this.brands.find(b => b.name.toLowerCase() === name.toLowerCase()) || null;
  }

  getProductsByCategory(catName) {
    if (!catName) return [];
    return this.products.filter(p => p.category.toLowerCase() === catName.toLowerCase());
  }

  getProductsByBrand(brandName) {
    if (!brandName) return [];
    return this.products.filter(p => p.brand.toLowerCase() === brandName.toLowerCase());
  }

  getSeriesByBrand(brandName, catName = null) {
    let prods = this.getProductsByBrand(brandName);
    if (catName) {
      prods = prods.filter(p => p.category.toLowerCase() === catName.toLowerCase());
    }
    const seriesSet = new Set();
    prods.forEach(p => {
      if (p.series) seriesSet.add(p.series);
    });
    return Array.from(seriesSet).sort();
  }

  getProductTypesByCategory(catName) {
    const prods = this.getProductsByCategory(catName);
    const types = new Set();
    prods.forEach(p => {
      if (p.productType) types.add(p.productType);
    });
    return Array.from(types).sort();
  }

  getCoimbatoreDeals(limit = 8) {
    const deals = this.products.filter(p => p.isCoimbatoreLocalDeal || p.discount >= 20);
    return deals.slice(0, limit);
  }

  getTrendingProducts(limit = 8) {
    return [...this.products]
      .sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount))
      .slice(0, limit);
  }

  getNewArrivals(limit = 8) {
    return [...this.products]
      .filter(p => p.id.endsWith('001') || p.id.endsWith('002') || p.id.endsWith('003'))
      .slice(0, limit);
  }

  getRelatedProducts(productId, limit = 4) {
    const target = this.getProductById(productId);
    if (!target) return [];

    return this.products
      .filter(p => p.id !== productId && (p.category === target.category || p.brand === target.brand))
      .sort((a, b) => {
        let scoreA = (a.category === target.category ? 2 : 0) + (a.brand === target.brand ? 2 : 0) + (a.productType === target.productType ? 3 : 0);
        let scoreB = (b.category === target.category ? 2 : 0) + (b.brand === target.brand ? 2 : 0) + (b.productType === target.productType ? 3 : 0);
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }

  /**
   * Filter & Search Catalog
   */
  filterProducts(criteria = {}) {
    let result = [...this.products];

    // Global text query (search across name, brand, model, series, category, productType, specs)
    if (criteria.query && criteria.query.trim()) {
      const q = criteria.query.trim().toLowerCase();
      result = result.filter(p => {
        return (
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          (p.model && p.model.toLowerCase().includes(q)) ||
          (p.series && p.series.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q) ||
          (p.productType && p.productType.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
        );
      });
    }

    // Category filter
    if (criteria.category && criteria.category !== 'all') {
      result = result.filter(p => p.category.toLowerCase() === criteria.category.toLowerCase());
    }

    // Brand filter
    if (criteria.brand && criteria.brand !== 'all') {
      result = result.filter(p => p.brand.toLowerCase() === criteria.brand.toLowerCase());
    }

    // Product Type filter
    if (criteria.productType && criteria.productType !== 'all') {
      result = result.filter(p => p.productType && p.productType.toLowerCase() === criteria.productType.toLowerCase());
    }

    // Series filter
    if (criteria.series && criteria.series !== 'all') {
      result = result.filter(p => p.series && p.series.toLowerCase() === criteria.series.toLowerCase());
    }

    // Price range
    if (criteria.minPrice !== undefined && criteria.minPrice !== null && !isNaN(criteria.minPrice)) {
      result = result.filter(p => p.price >= Number(criteria.minPrice));
    }
    if (criteria.maxPrice !== undefined && criteria.maxPrice !== null && !isNaN(criteria.maxPrice)) {
      result = result.filter(p => p.price <= Number(criteria.maxPrice));
    }

    // Rating
    if (criteria.minRating) {
      result = result.filter(p => p.rating >= Number(criteria.minRating));
    }

    // Discount
    if (criteria.minDiscount) {
      result = result.filter(p => p.discount >= Number(criteria.minDiscount));
    }

    // In stock
    if (criteria.inStockOnly) {
      result = result.filter(p => p.stock > 0);
    }

    // Sorting
    if (criteria.sortBy) {
      switch (criteria.sortBy) {
        case 'price-asc':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'rating-desc':
          result.sort((a, b) => b.rating - a.rating);
          break;
        case 'discount-desc':
          result.sort((a, b) => b.discount - a.discount);
          break;
        case 'name-asc':
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name-desc':
          result.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case 'newest':
          result.sort((a, b) => b.id.localeCompare(a.id));
          break;
        default:
          break;
      }
    }

    return result;
  }
}

// Global Singleton Instance
window.ShopSmartCatalog = new CatalogManager();

// Automatically trigger load on script inclusion
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.ShopSmartCatalog.load());
  } else {
    window.ShopSmartCatalog.load();
  }
}
