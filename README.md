# ShopEase — Complete Professional E-Commerce Store (120+ Products)

A complete, production-grade, responsive e-commerce web application built with **pure HTML5, CSS3, and Vanilla JavaScript**. Configured for the **Coimbatore, Tamil Nadu, India** market with authentic Indian Rupee (₹) pricing, 120 unique products across 12 product categories, 100% verified product photography, advanced filtering & search, interactive wishlist, product detail quick view with related products, and a fully functional shopping cart & checkout system.

---

## 🌟 Major Highlights & Architecture

### 1. Large 120-Product Catalog Across 12 Categories
Unlike small demo mockups, ShopEase features a master catalog of **120 unique products** (10 products per category) defined centrally in `products.js`. Every product includes genuine specifications, realistic Indian market prices, original MSRPs, calculated discount percentages, real stock counts, and demo customer star ratings with review counts.

#### The 12 Categories Breakdown:
1. **Mobiles & Tablets (10 products):** Samsung Galaxy S23 5G, Apple iPhone 15 Pro, OnePlus 12, Google Pixel 8, iPad Air M2, Anker PowerCore 20000mAh, Spigen Ultra Hybrid Case, Boat 65W GaN Charger, Samsung Galaxy Tab S9, ESR Tempered Glass.
2. **Laptops & Computers (10 products):** Apple MacBook Air M2, Dell XPS 13 Plus, ASUS ROG Zephyrus G16, LG UltraFine 27" 4K Monitor, Keychron K2 Wireless Keyboard, Logitech MX Master 3S, Samsung 990 PRO 2TB NVMe SSD, SanDisk Ultra 128GB Flash Drive, Portronics My Buddy Hexa Stand, TP-Link AX3000 Wi-Fi 6 Router.
3. **Audio & Accessories (10 products):** Sony WH-1000XM5 ANC Headphones, Apple AirPods Pro (2nd Gen), JBL Charge 5 Waterproof Speaker, Bose QuietComfort Ultra, Shure MV7 USB Podcast Microphone, Marshall Stanmore III, Sennheiser HD 560S Audiophile, boAt Stone 1200, Audio-Technica AT2020USB-X, Sony HT-S20R 5.1ch Soundbar.
4. **Fashion – Men (10 products):** Levi's 511 Slim Stretch Jeans, Peter England Slim Fit Formal Shirt, U.S. Polo Assn. Classic Pique Polo, Allen Solly Chino Trousers, Puma Essentials Fleece Hoodie, Woodland Leather Chelsea Boots, Titan Neo Analog Quartz Watch, Wildcraft Reversible Windcheater, Tommy Hilfiger Leather Belt, Fastrack Aviator Sunglasses.
5. **Fashion – Women (10 products):** Biba Printed Anarkali Kurti Set, Fabindia Pure Handloom Cotton Saree, Vero Moda Fit & Flare Midi Dress, ONLY High-Waist Skinny Jeans, Lavie Betula Structured Handbag, Fossil Jacqueline Rose Gold Watch, Catwalk Embellished Block Heels, W for Woman Straight Palazzos, Baggit Vegan Leather Backpack, Voylla Gold Plated Jhumka Earrings.
6. **Footwear (10 products):** Nike Air Zoom Pegasus 40, Adidas Ultraboost Light Running Shoes, Puma Smash v2 L Classic Sneakers, Clarks Tilden Cap Formal Oxfords, Red Tape Soft Foam Casual Loafers, Skechers Go Walk 6 Walking Shoes, Crocs Classic Unisex Clogs, Woodland Camel Nubuck Outdoor Boots, Birkenstock Arizona EVA Sandals, Sparx Athletic Training Shoes.
7. **Home & Kitchen (10 products):** Prestige Iris 750W Mixer Grinder, Philips HD9306 1.5L Stainless Steel Kettle, Hawkins Futura Hard Anodized Cookware, Milton Thermosteel 1L Water Bottle, Borosil Glass Mixing Bowl Set (3 Pcs), Cello Checkers PET Storage Jars (18 Pcs), Signoraware Best 4-Piece Lunch Box, Pigeon by Stovekraft 4-Burner Gas Stove, Wonderchef Nutri-Blend 400W Blender, Kent Gold 20L UF Water Purifier.
8. **Home Appliances (10 products):** Atomberg Renesa 1200mm BLDC Ceiling Fan, Philips EasySpeed Plus 2000W Steam Iron, Dyson V8 Cordless Vacuum Cleaner, LG 7kg 5-Star Front Load Washing Machine, Samsung 253L 3-Star Double Door Refrigerator, Symphony Diet 3D 30i Tower Air Cooler, Havells Instanio 3-Litre Instant Geyser, Eureka Forbes Aquaguard Water Purifier, Bajaj New Shakti Neo 15L Water Heater, Voltas 1.5 Ton 5-Star Inverter Split AC.
9. **Beauty & Personal Care (10 products):** Minimalist 10% Niacinamide Face Serum, Cetaphil Gentle Skin Cleanser 250ml, The Derma Co 1% Hyaluronic Sunscreen Aqua Gel, L'Oreal Paris Extraordinary Oil Hair Serum, Forest Essentials Ayurvedic Facial Cleanser, Plum Green Tea Oil-Free Moisturizer, Philips OneBlade Hybrid Trimmer & Shaver, MCaffeine Exfoliating Coffee Body Scrub, Biotique Bio Kelp Anti Hair Fall Shampoo, Beardo Godfather Beard Oil & Wash Combo.
10. **Sports & Fitness (10 products):** Kobo Rubber Hex Dumbbell Set (10kg x 2), Boldfit Non-Slip 6mm EVA Yoga Mat, Vector X Combat Boxing Gloves (12oz), Strauss TPE Resistance Exercise Bands, SG Phoenix Kashmir Willow Cricket Bat, Nivia Storm Thermo-Fused Football (Size 5), Yonex Astrox 77 Play Badminton Racket, Speedo Fastskin Swimming Goggles, Cosco Light Heavy Cricket Tennis Balls, AmazonBasics Neoprene Hand Weights (3kg).
11. **Books & Stationery (10 products):** Clean Code: Agile Software Craftsmanship, Introduction to Algorithms (CLRS 4th Ed), The Pragmatic Programmer (20th Anniv), Classmate Pulse Spiral Hardcover Notebooks, Pilot G2 0.7mm Retractable Gel Pens (5 Pcs), Parker Jotter Stainless Steel Ballpoint Pen, American Tourister Valex 28L Laptop Backpack, Moleskine Classic Expanded Hardcover Journal, Deli Mesh Metal 4-Tier Desk Organizer, Casio FX-991CW Scientific Calculator.
12. **Gaming (10 products):** Razer DeathAdder Essential Ergonomic Mouse, Redragon K552 Kumara RGB Mechanical Keyboard, Sony DualSense Wireless Controller (PS5), HyperX Cloud II 7.1 Surround Gaming Headset, SteelSeries QcK Heavy XXL Gaming Mousepad, Cosmic Byte Asteroid 5-Fan Laptop Cooling Pad, Logitech G29 Driving Force Steering Wheel, Elgato Stream Deck MK.2 Studio Controller, Ant Esports 240 Air Mid Tower ARGB Cabinet, Corsair K55 RGB PRO Dynamic Backlit Keyboard.

---

### 2. Verified Product Images & Fallback System
- **100% Tested Unsplash Images:** All 120 product images have been validated over live HTTPS HEAD checks returning `200 OK`.
- **Accurate Product Imagery:** Smartphones display smartphones, sneakers display shoes, kitchen appliances display kitchen tools, books show programming literature, and gaming hardware displays gaming gear. No emojis, empty boxes, or mismatched graphics.
- **Smart Framing (`object-fit`):**
  - `img-contain`: Used for electronics, monitors, appliances, and hardware to preserve the full product silhouette without clipping.
  - `img-cover`: Used for fashion, apparel, and lifestyle photography.
- **Automatic SVG Fallback (`onerror`):** Every image element includes an `onerror="this.onerror=null;this.src='assets/product-fallback.svg'"` handler. If a network drops or a CDN fails, a clean, branded SVG fallback card displays gracefully.
- **Performance:** `loading="lazy"` on all cards ensures lightning-fast initial page loads.

---

### 3. Search, Filter, and Sort Suite
All filters work together simultaneously without conflict:
- **Instant Search:** Full-text search matching across Product Name, Brand, Category, and Description text.
- **12 Category Buttons & Dropdown:** Interactive chips and synced dropdown for all 12 categories.
- **Price Range Filter:** Min and Max price inputs with instant dynamic recalculation.
- **Customer Rating Filter:** Filter products by minimum rating (4.5★+, 4.0★+, 3.5★+, 3.0★+).
- **In-Stock Only Filter:** Toggle to immediately hide out-of-stock or low-inventory items.
- **Sorting Options:**
  - Featured (Default)
  - Newest Arrivals
  - Price: Low to High
  - Price: High to Low
  - Customer Rating: High to Low
  - Biggest Discount %
  - Product Name: A to Z
- **Dedicated Wishlist View:** Toggle to view all bookmarked wishlist items in one click.
- **Helpful Empty State:** When no products match filters, a clean state offers a single "Clear All Filters" button.

---

### 4. Interactive Shopping Cart & Calculations
- **Slide-out Cart Drawer:** Smooth slide animation with glassmorphism backdrop blur.
- **Real-Time Badge:** Shows total quantity of items with bounce animation on additions.
- **Stock Guard:** Strictly prevents ordering quantities greater than available inventory; disables `+` buttons when the limit is reached.
- **Persistent Storage:** Cart state and wishlist are saved in `localStorage` (`shopease_cart_v1`, `shopease_wishlist_v1`) so your session survives refreshes.
- **Transparent Calculations:**
  - **Subtotal:** Sum of $(\text{Price} \times \text{Quantity})$.
  - **Total Savings:** Clearly displays catalog savings compared to original MSRP.
  - **Coupons:**
    - `SAVE10`: 10% discount on cart subtotal.
    - `SAVE200`: Flat ₹200 off for orders of ₹2,000 or more.
    - `FREESHIP`: Waives the ₹99 shipping charge completely.
  - **GST (18% Illustrative):** Accurately computed on taxable subtotal after coupons.
  - **Delivery Fee:** Free for orders $\ge ₹999$ or with `FREESHIP`; otherwise ₹99 flat fee.
  - **Grand Total:** $\text{Taxable Subtotal} + \text{GST} + \text{Delivery Fee}$. All formatted with Indian numbering (`₹XX,XXX`).

---

### 5. Product Details Modal & Related Products
Clicking any product card or "Quick View" opens a modal featuring:
- High-res product image with zoomable preview.
- Brand pill, category tag, and stock status.
- Current price, original price, and discount percentage badge.
- Detailed product description and 4 key technical specification bullet points.
- Interactive quantity selector bounded by stock.
- One-click Wishlist bookmarking.
- **Related Products Recommendation:** Dynamically displays 3 matching products from the exact same category with prices and quick add buttons.

---

### 6. Coimbatore, Tamil Nadu, India Business Configuration
ShopEase is tailored for the Indian retail market:
- **Commercial Hub:** Coimbatore, Tamil Nadu, India.
- **Store Address:** *ShopEase Retail Hub, D.B. Road, R.S. Puram, Coimbatore, Tamil Nadu - 641002, India* (displayed prominently in the footer).
- **Currency:** Indian Rupee (`INR — ₹`) with `en-IN` number formatting.
- **Timezone:** `Asia/Kolkata` (IST) for order timestamping and delivery estimates.
- **Checkout Form:** Defaults to Coimbatore, Tamil Nadu, with fields for House/Flat, Street, City, State, and PIN Code.
- **Validation:** 10-digit Indian mobile number validation (`^[6-9]\d{9}$`) and 6-digit Indian PIN code validation (`^[1-9]\d{5}$`).

---

## 🛠️ Technology Stack

| Component | Technology | Rationale |
|:---|:---|:---|
| **Structure** | HTML5 Semantic Elements | High SEO score, accessible screen reader support, clean DOM hierarchy |
| **Styling** | Vanilla CSS3 (Custom Properties) | Pixel-perfect control, 4–5 card responsive grid, fluid animations, no heavy frameworks |
| **Logic** | Vanilla JavaScript (ES6+) | Centralized product architecture, zero dependencies, lightning-fast rendering |
| **Storage** | Web LocalStorage API | Persistent cart, wishlist, and applied coupon across browser reloads |
| **Icons** | Lucide Icons | Sleek modern vector iconography |
| **Typography**| Inter & Poppins (Google Fonts) | Clean, readable e-commerce typography |

---

## 🚀 Running the Project Locally

No build steps, bundlers, or npm installations are needed.

### Running with Python (Currently Active on Port 8085)
```bash
# Start local HTTP server
python3 -m http.server 8085
```
Visit in your web browser:
- **`http://localhost:8085/`**
- Or directly: **`http://localhost:8085/shopping-cart/`**

### Running with Node.js
```bash
npx serve .
# Or
npx serve shopping-cart
```

### Direct File Open
You can also directly double-click `index.html` in your file explorer to open it in Chrome, Safari, Firefox, or Edge.

---

## 📁 Repository Structure

```
/Users/sanjith/Shoping/
├── index.html                 # Main e-commerce web application layout
├── style.css                  # Design tokens, responsive grid, drawer, modal, wishlist styles
├── products.js                # Centralized 120-product dataset across 12 categories
├── script.js                  # Cart logic, search/filters, calculations, checkout, modals
├── assets/
│   ├── product-fallback.svg   # Branded SVG fallback image for error resilience
│   └── hero-banner.jpg        # Storefront hero banner visual
├── shopping-cart/             # Synced standalone deployment directory
│   ├── index.html
│   ├── style.css
│   ├── products.js
│   ├── script.js
│   └── assets/
└── README.md                  # Complete technical documentation
```

---

## 🧪 Verification & QA Summary

- [x] **120 Unique Products:** Verified through Node.js test scripts across all 12 categories.
- [x] **12 Categories:** Exactly 10 products per category (exceeds the 8–15 requirement).
- [x] **Image Integrity:** 100% of the 120 product images verified via live HTTPS checks returning `200 OK`.
- [x] **Image Fallback:** SVG fallback `assets/product-fallback.svg` linked via `onerror`.
- [x] **Filters & Search:** Real-time text search, 12 category chips, price range, min rating, and in-stock only.
- [x] **Wishlist Engine:** Heart button toggling, badge counter, and LocalStorage persistence.
- [x] **Shopping Cart Drawer:** Add to cart, quantity increment/decrement, remove item, clear cart, stock limits.
- [x] **Coupons & Totals:** `SAVE10`, `SAVE200` (₹2,000 min), `FREESHIP` coupons, 18% GST calculation, ₹99/Free delivery.
- [x] **Checkout & Location:** Coimbatore, Tamil Nadu default delivery settings, 10-digit mobile & 6-digit PIN validation.
- [x] **Zero Errors:** Clean console output without JavaScript errors or missing references.
