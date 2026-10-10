# ShopSmart — Complete Multi-Brand E-Commerce Platform

A production-grade, human-crafted online shopping platform built with **HTML5, CSS3, Vanilla JavaScript, and Browser LocalStorage**. 

Configured specifically for **Coimbatore, Tamil Nadu, India**, ShopSmart features transparent Indian Rupee (`₹` — INR) pricing, a verified **1,006-product master catalog** across **15 distinct categories**, **219 global and Indian brands**, official series hierarchies (`CATEGORY → BRAND → PRODUCT TYPE → SERIES → PRODUCT MODEL → VARIANT`), dedicated brand showrooms, rule-based conversational assistant, budget-constrained bundle generator, voice search, and an admin management console.

---

## 📑 Table of Contents

1. [Architectural Overview & Zero-Framework Constraint](#1-architectural-overview--zero-framework-constraint)
2. [Dual-Mode Catalog Loading Engine](#2-dual-mode-catalog-loading-engine)
3. [Master Catalog Breakdown (1,006 Products / 15 Categories)](#3-master-catalog-breakdown-1006-products--15-categories)
4. [Brand Hierarchy & Dedicated Showrooms](#4-brand-hierarchy--dedicated-showrooms)
5. [Key Platform Features](#5-key-platform-features)
6. [Coimbatore & India Regional Settings](#6-coimbatore--india-regional-settings)
7. [Calculations, Taxes & Demonstrative Coupons](#7-calculations-taxes--demonstrative-coupons)
8. [Project File Structure](#8-project-file-structure)
9. [How to Run Locally](#9-how-to-run-locally)
10. [Admin Console & Quality Diagnostics](#10-admin-console--quality-diagnostics)
11. [Known Limitations & Security Considerations](#11-known-limitations--security-considerations)

---

## 1. Architectural Overview & Zero-Framework Constraint

ShopSmart adheres strictly to standard web standards:
- **No Frontend Frameworks:** Zero React, Angular, Vue, Svelte, or TypeScript.
- **No Backend / Server Runtimes:** Zero Node.js, Express, PHP, Python web backends, Firebase, or external database servers.
- **Pure Web Standards:** Semantic HTML5, Vanilla CSS3 with custom design tokens, and modular ES6+ JavaScript.
- **Client-Side Persistence:** Browser `localStorage` for non-sensitive demonstration session state (guest cart, user profile, saved addresses, wishlist, simulated orders, and comparison list).
- **Design Aesthetic:** Clean off-white canvas, crisp charcoal typography, restrained emerald/forest green accent (`#059669` / `#10b981`), accessible contrast, and zero fake AI gimmicks (no artificial review counts, no fabricated testimonial carousels).

---

## 2. Dual-Mode Catalog Loading Engine

To ensure that the application works seamlessly under any environment:

1. **Local Development HTTP Server Mode (Primary):**
   - Automatically loads `data/products.json` (1.4MB), `data/categories.json`, and `data/brands.json` via asynchronous `fetch()`.
   - Start any local development server (or Live Server) and navigate to `http://localhost:8085`.

2. **Zero-Server Direct File Mode (`file://` Protocol Fallback):**
   - Modern browsers restrict `fetch()` requests when opening `.html` files directly from disk due to CORS policies.
   - ShopSmart includes `js/products.js`, which exposes `window.PRODUCTS` as a synchronous fallback.
   - Simply double-click `index.html` on any operating system, and the complete 1,006-product catalog will render without any server required.

---

## 3. Master Catalog Breakdown (1,006 Products / 15 Categories)

Every single catalog item includes a verified name, model, official series, brand, Indian market price in INR, original MRP, discount percentage, stock availability, specifications table, color/size variants, and relevant product imagery:

| # | Category | Product Count | Leading Brands Included | Notable Series & Models |
|---|:---|:---:|:---|:---|
| 1 | **Mobiles and Tablets** | 67 | Apple, Samsung, OnePlus, Xiaomi, POCO, Realme, Vivo, OPPO, Motorola, Google, iQOO, ASUS ROG | Galaxy S24 Ultra, iPhone 16 Pro, OnePlus 12, Pixel 9 Pro, iPad Pro M4, Galaxy Tab S9, Anker MagGo |
| 2 | **Laptops and Computers** | 67 | Apple, ASUS, HP, Dell, Lenovo, Acer, MSI, LG, Microsoft, Logitech, Corsair, Kingston | MacBook Pro M3, ROG Zephyrus G16, XPS 15, Legion Pro 7, ThinkPad X1, Dell 27" 4K, Keychron Q1 |
| 3 | **Audio and Accessories** | 67 | Sony, boAt, JBL, Sennheiser, Bose, Apple, Marshall, Audio-Technica, Skullcandy, HyperX | WH-1000XM5, AirPods Pro 2, QuietComfort Ultra, Airdopes 141, Charge 5, Stanmore III, Cloud III |
| 4 | **Men’s Fashion** | 67 | Levi's, Allen Solly, Peter England, Louis Philippe, Van Heusen, Tommy Hilfiger, Raymond, Puma | 511 Slim Jeans, Prime Cotton Formals, Linen Club Blazers, Classic Chinos, Chronograph Watches |
| 5 | **Women’s Fashion** | 67 | Biba, Fabindia, Aurelia, W, Global Desi, Vero Moda, ONLY, H&M, Zara, Fossil | Pure Cotton Anarkali, Tussar Silk Sarees, Floral Georgette Dresses, High-Rise Jeans, Leather Totes |
| 6 | **Footwear** | 67 | Nike, Adidas, Puma, Reebok, Skechers, ASICS, Converse, Woodland, Bata, Crocs, Birkenstock | Pegasus 41, Ultraboost Light, Gel-Kayano 31, Chuck 70, Classic Clogs, Arizona Birko-Flor, Oxfords |
| 7 | **Home and Kitchen** | 67 | Prestige, Hawkins, Pigeon, Philips, Bajaj, Havells, Wonderchef, Borosil, Milton, Tupperware | Iris 750W Mixer, Contura Pressure Cooker, Digital Air Fryer, Thermosteel Flask, Glassware Sets |
| 8 | **Home Appliances** | 67 | LG, Samsung, Whirlpool, Haier, Godrej, Voltas, Daikin, IFB, Bosch, Dyson, Eureka Forbes | 653L Side-by-Side Refrigerator, Front Load Washer, 1.5 Ton Inverter AC, V15 Detect Cordless Vacuum |
| 9 | **Beauty and Personal Care** | 67 | Minimalist, The Ordinary, Cetaphil, Neutrogena, L'Oréal, Maybelline, Lakme, Philips, Braun | 10% Niacinamide Serum, Gentle Skin Cleanser, Hydro Boost Gel, Ultra Matte Lipsticks, Series 9 Shaver |
| 10 | **Sports and Fitness** | 67 | Nike, Adidas, Puma, Decathlon, Nivia, Yonex, Cosco, SG, SS, Boldfit, Wilson, Head | Rubber Hex Dumbbells, TPE Yoga Mats, Astrox 99 Badminton Racket, English Willow Bat, Storm Football |
| 11 | **Books and Stationery** | 67 | Penguin, HarperCollins, O'Reilly, Pearson, Wiley, Classmate, DOMS, Parker, Pilot, Faber-Castell | Clean Code, Designing Data-Intensive Apps, CLRS Algorithms, Sonnet Fountain Pen, 6-Subject Notebooks |
| 12 | **Gaming** | 67 | Sony PlayStation, Microsoft Xbox, Nintendo, ASUS ROG, Razer, Logitech G, Corsair, Redragon | PS5 Slim, Xbox Series X, Switch OLED, DeathAdder V3 Pro, G502 X PLUS, Huntsman Mini, Secretlab Titan |
| 13 | **Bags and Travel** | 67 | American Tourister, Samsonite, Safari, VIP, Skybags, Wildcraft, Nike, Targus | Curio 75cm Spinner, Eco-Glide Cabin Trolley, Orbit 32L Backpack, Pacemaker Duffle, CitySmart Sleeve |
| 14 | **Furniture and Home Decor** | 67 | IKEA, Godrej Interio, Wakefit, Sleepyhead, Urban Ladder, Pepperfry, Durian, Home Centre | Orthopedic Memory Foam Mattress, Markus Ergonomic High-Back Chair, Sheesham Coffee Table, Arc Lamp |
| 15 | **Toys and Accessories** | 68 | LEGO, Mattel, Hot Wheels, Hasbro, Nerf, Barbie, Fisher-Price, Funskool, Play-Doh | Millennium Falcon 75257, 10-Car Collector Pack, Ultra One Motorized Blaster, Monopoly Deluxe |
| **Total** | **15 Categories** | **1,006** | **219 Unique Brands** | **0 Duplicate Records / 100% Unique Product Identifiers** |

---

## 4. Brand Hierarchy & Dedicated Showrooms

ShopSmart organizes products using the multi-tier hierarchy:
```
CATEGORY → BRAND → PRODUCT TYPE → SERIES → PRODUCT MODEL → VARIANT
```

- **Brand Showroom (`brand.html?brand=Apple`):**
  - Displays official brand banner, country of origin, categories sold, and total catalog count.
  - Interactive **Series Filter Pills** (e.g. For Samsung: `All Series`, `Galaxy S Series`, `Galaxy A Series`, `Galaxy Z Fold Series`, `Galaxy Tab Series`, `Frost-Free Refrigerator Series`).
  - Interactive **Product Type Pills** (e.g. `Smartphones`, `Tablets`, `Refrigerators`, `Monitors`).
  - Dynamic sort by Price (asc/desc), Rating, Discount, and Name.
- **Brand Directory (`brand.html` without parameters):**
  - Instant directory of all 219 brands with live brand search, category tags, and direct showroom links.

---

## 5. Key Platform Features

1. **Global Search & Filter Engine (`products.html`):**
   - Real-time search across product names, brands, models, series, and descriptions.
   - Dynamic multi-select sidebar filters: Category, Brand (filtered dynamically by category), Product Type, Minimum Price, Maximum Price, Minimum Rating (4★, 3★), Discount Tiers (10% to 50%+), and In-Stock toggle.
2. **Product Details View (`product-details.html`):**
   - Authentic product photography with fallback error handlers.
   - Interactive Color and Size/Storage Variant Selectors that update selected attributes.
   - Full technical specifications table.
   - 6-step dynamic breadcrumbs (`Home > Category > Brand > Type > Series > Product`).
   - Related products algorithm and recently viewed tracker.
3. **Shopping Cart & Drawer (`cart.html` & Cart Drawer):**
   - Live badge counters across all header views.
   - Quantity stepper (+/-) with strict stock limit enforcement.
   - Save for later and instant item removal.
   - Free shipping progress bar (Free delivery at ₹999).
4. **Checkout & Order History (`checkout.html` & `orders.html`):**
   - Indian form fields: House/Flat, Street, Locality, City (default: Coimbatore), State (default: Tamil Nadu), 6-digit PIN Code (default: 641002), and 10-digit mobile number validation.
   - Simulated payment selection (UPI, Credit/Debit Card, NetBanking, Cash on Delivery).
   - Generates simulated Order Confirmation with unique ID (`SS-2026-XXXXX`), delivery estimate, and order details stored in LocalStorage.
5. **Product Comparison Matrix (`compare.html`):**
   - Side-by-side comparison for up to 4 items with category-aware attributes.
6. **Smart Budget Shopping (`budget-shopping.html`):**
   - Algorithmic bundle creator: input a budget (e.g. ₹20,000) and optional intent ("gaming", "college"), and the knapsack solver selects verified catalog products considering merchandise prices, 18% illustrative GST, and shipping.
7. **Conversational Assistant (`assistant.html`):**
   - Rule-based natural language parser that analyzes brand names, categories, product types, and budget constraints (e.g., *"Find Samsung phones under 25000"*, *"Show Nike running shoes"*).
8. **Voice Search:**
   - Web Speech API integration in search bars with graceful degradation for unsupported browsers.

---

## 6. Coimbatore & India Regional Settings

- **Commercial Hub Location:** Coimbatore, Tamil Nadu, India.
- **Default PIN Code:** `641002` (R.S. Puram, Coimbatore).
- **Default City & State:** Coimbatore, Tamil Nadu.
- **Currency:** Indian Rupee (`₹` — INR) formatted using `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`.
- **Timezone:** `Asia/Kolkata` (IST).
- **Mobile Validation:** 10-digit Indian numbers starting with 6, 7, 8, or 9 (`/^[6-9]\d{9}$/`).
- **Coimbatore Local Deals:** Dedicated section highlighting items with prioritized dispatch from the regional fulfillment center.

---

## 7. Calculations, Taxes & Demonstrative Coupons

All price calculations adhere to a single unified calculation function across the cart drawer, cart page, and checkout:

```
Merchandise Subtotal
  – Coupon Discount
  + Delivery Charge (₹99 below ₹999, FREE at ₹999+)
  + Illustrative GST (18%)
  = Final Payable Amount
```

### Demonstrative Coupon Codes:
- **`SAVE10`**: 10% instant discount on merchandise subtotal.
- **`SAVE200`**: Flat ₹200 off on orders of ₹2,000 or more.
- **`FREESHIP`**: Waives the ₹99 standard delivery fee.

> **Illustrative GST Notice:** Indian GST varies by product classification (0%, 5%, 12%, 18%, 28%). For demonstration clarity, a standard 18% illustrative rate is applied and clearly labeled.

---

## 8. Project File Structure

```
Shoping/
├── index.html                   # Storefront Homepage with 15 categories, brands, & deals
├── products.html                # Global Catalog Listing with search & multi-tier filters
├── brand.html                   # Dedicated Brand Showroom & 219 Brand Directory
├── product-details.html         # Detailed Product View with variants & specs table
├── cart.html                    # Dedicated Shopping Cart Page
├── checkout.html                # Multi-field Checkout with Coimbatore regional defaults
├── orders.html                  # LocalStorage-backed Order History & Confirmation
├── wishlist.html                # Bookmarked Wishlist Items
├── compare.html                 # 4-Item Product Comparison Matrix
├── budget-shopping.html         # Smart Budget Shopping Bundle Generator
├── assistant.html               # Rule-based Natural Language Shopping Assistant
├── admin.html                   # Catalog Management Console & Quality Diagnostics
├── login.html                   # Demonstration Login Page (Web Crypto SHA-256)
├── register.html                # Demonstration Registration Page
├── profile.html                 # User Profile & Saved Addresses
├── forgot-password.html         # Demonstration Password Reset Flow
├── about.html                   # Store About Page
├── contact.html                 # Store Contact Information (Coimbatore, Tamil Nadu)
├── privacy.html                 # Privacy Policy
├── terms.html                   # Terms & Conditions
│
├── css/
│   ├── style.css                # Core design system tokens, typography, grid, & components
│   └── responsive.css           # Navigation strips, brand showroom hero, & mobile breakpoints
│
├── js/
│   ├── products.js              # 1.4MB JavaScript dataset fallback (window.PRODUCTS, 1,006 items)
│   ├── catalog.js               # Unified Catalog Manager (async fetch + fallback, filtering, search)
│   ├── category-navigation.js   # 15-Category navigation strip & breadcrumb generator
│   ├── brand-navigation.js      # Brand showroom header, series pills, & brand directory
│   ├── product-renderer.js      # Accessible card HTML generator & quick-view modals
│   ├── search.js                # Search, sorting, dynamic filter coordinator, & voice search
│   ├── cart.js                  # Cart state, quantities, coupon logic, & price breakdown
│   ├── auth.js                  # LocalStorage demo auth with Web Crypto SHA-256 hashing
│   ├── wishlist.js              # Wishlist manager & badge sync
│   ├── checkout.js              # Checkout field validation & order synthesis
│   ├── orders.js                # Order persistence & printable invoice generator
│   ├── comparison.js            # Comparison matrix state & specs rendering
│   ├── budget-shopping.js       # Knapsack-style budget bundle generator
│   ├── assistant.js             # Catalog-aware shopping assistant logic
│   ├── admin.js                 # Admin CRUD, diagnostics audit, & JSON/CSV import/export
│   └── utils.js                 # INR formatter, date formatter, toasts, modals, & theme
│
├── data/
│   ├── products.json            # Master JSON Catalog (1,006 unique products)
│   ├── categories.json          # 15 Category definitions with popular brands & product counts
│   └── brands.json              # 219 Brand records with category mappings & item counts
│
├── assets/
│   ├── banners/                 # High-resolution store banners
│   ├── fallback/                # SVG fallback images for broken image protection
│   └── images/                  # Category icons & brand assets
│
└── README.md                    # System documentation and operational manual
```

---

## 9. How to Run Locally

### Option 1: Direct File Opening (Zero Configuration — Recommended)
Simply double-click `index.html` or open it directly in any browser (Chrome, Edge, Safari, Firefox). 
Due to the built-in `window.PRODUCTS` catalog engine in `js/products.js`, the entire 1,006-item store, categories, filters, cart, checkout, and assistant work 100% locally with pure HTML, CSS, and JavaScript.

### Option 2: Using Any Static Development Server
You can also open the project using VS Code "Live Server" extension, or any standard local static file server.
When run through an HTTP server, the site will also dynamically load `data/products.json`, `data/categories.json`, and `data/brands.json`.

---

## 10. Admin Console & Quality Diagnostics

Navigate to `admin.html` (or click **Admin Dashboard** in the footer) to access the Catalog Administration Suite:

- **Inventory Tab:** Search, filter by category, paginate (25 items/page), and edit or delete products.
- **Add Product Modal:** Create new items with automatic ID validation, specifications, and image URLs.
- **Categories Tab:** Live breakdown of all 15 categories with item counts and popular brands.
- **Brands Tab:** Directory of all 219 brands with associated categories.
- **Import / Export:**
  - Export full catalog to `shopsmart_catalog.json` or `shopsmart_catalog.csv`.
  - Import custom JSON or CSV catalog files.
- **Quality Diagnostics (Audit Tool):**
  - Click **"Run Full Health Check"** to audit all records.
  - Verifies:
    1. Total records (1,006)
    2. Duplicate ID detection (0 duplicates)
    3. Category validity across all 15 official categories
    4. Image URL verification

---

## 11. Known Limitations & Security Considerations

1. **Client-Side Data Persistence:**
   - Because no external backend server is used, all simulated authentication accounts, orders, cart items, and custom product overrides reside in the user's browser `localStorage`.
   - Clearing browser site data will reset custom demo state back to default catalog settings.
2. **Demonstration Authentication:**
   - Passwords are encrypted client-side using standard `SHA-256` hashing via the Web Crypto API, avoiding plaintext storage. However, frontend-only authentication cannot protect sensitive private data from client tampering and is purely for application flow demonstration.
3. **Voice Search Availability:**
   - The Web Speech API is natively supported in Google Chrome, Microsoft Edge, and Safari. Browsers lacking the API will display a fallback notice.
4. **Third-Party CDN Assets:**
   - Lucide Icons are loaded via CDN (`unpkg.com/lucide`). If running completely offline without internet connectivity, icons may fall back to standard text labels.

---

*ShopSmart — Pure Web Standards E-Commerce Platform | Coimbatore, Tamil Nadu, India.*
