# ShopSmart — Complete Professional Online Shopping Platform

A production-ready, fully responsive e-commerce web application built with **HTML5, CSS3, and Vanilla JavaScript**. ShopSmart is designed for the Indian retail ecosystem, configured specifically for **Coimbatore, Tamil Nadu, India**, featuring authentic Indian Rupee (`₹` — INR) pricing, 150 unique products across 15 distinct categories, 100% verified real product photography, multi-page architecture, dual-mode Firebase Authentication & Firestore persistence, intelligent budget bundle generation, a natural language shopping assistant, voice search, and an admin management dashboard.

---

## 📑 Table of Contents

1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Master Catalog (150 Products / 15 Categories)](#master-catalog-150-products--15-categories)
5. [Project Structure](#project-structure)
6. [Local Setup & Running Locally](#local-setup--running-locally)
7. [Firebase Configuration Guide](#firebase-configuration-guide)
   - [Enabling Email/Password Authentication](#enabling-emailpassword-authentication)
   - [Setting up Cloud Firestore](#setting-up-cloud-firestore)
   - [Adding Credentials to ShopSmart](#adding-credentials-to-shopsmart)
   - [Firestore Security Rules](#firestore-security-rules)
   - [Assigning Administrator Role Securely](#assigning-administrator-role-securely)
8. [Transparent Architecture: Real vs. Simulated Features](#transparent-architecture-real-vs-simulated-features)
9. [Coimbatore Store Configuration](#coimbatore-store-configuration)
10. [Cart, Pricing & Tax Calculations](#cart-pricing--tax-calculations)
11. [How to Modify Products & Images](#how-to-modify-products--images)
12. [Known Limitations](#known-limitations)

---

## 1. Project Overview

**ShopSmart** is built to deliver a genuine, human-crafted shopping experience avoiding typical AI-generated tropes (no glowing neon buttons, no fake testimonial bots, no fabricated visitor counts). Instead, it emphasizes clean aesthetics, warm off-white and charcoal tones, forest green accent palette (`#059669` / `#10b981`), reliable client calculations, and persistent multi-user data storage.

The platform provides a dual-mode database engine:
- **Development Mode (Out-of-the-Box):** Operates immediately without external API keys using client-side `localStorage` data models with simulated auth sessions and demo accounts.
- **Production Mode (Firebase):** Automatically detected when Firebase credentials are configured in `js/firebase-config.js`, unlocking live Google Firebase Authentication and Cloud Firestore cloud synchronizations.

---

## 2. Key Features

- **24 Interlinked Pages & Views:** Complete coverage including Homepage, Catalog with Sidebar Filters, Product Details, Dedicated Cart, Multi-step Checkout, Order Confirmation, Order History, Side-by-side Product Comparison, Budget Shopping Bundler, AI Shopping Assistant, Admin Dashboard, Profile, Authentication screens, and Legal Policies.
- **150 Unique Catalog Items:** 10 curated products in each of 15 categories with authentic Indian market pricing (₹149 to ₹1,49,990), stock tracking, discount computations, and verified imagery.
- **Intelligent Discovery:**
  - Full-text dynamic search across name, brand, category, and keywords.
  - Sidebar multi-filter (Categories, Price range, Minimum rating, Stock availability, Discount tiers, Brands).
  - Web Speech API Voice Search with microphone input.
  - Image Upload category query assistant.
- **Smart Budget Shopping (`budget-shopping.html`):** Algorithmic bundle builder that accepts a target budget (e.g., ₹10,000 for Gaming), computes 18% GST and shipping fees, and selects optimal combinations that never exceed the specified spending limit.
- **Conversational Assistant (`assistant.html`):** Natural language catalog parser capable of understanding intent such as *"Show phones under ₹20,000"* or *"Suggest a college backpack under ₹1,500"*.
- **Product Comparison (`compare.html`):** Side-by-side comparison matrix for up to 4 items with category-aware attributes (RAM/Storage/Processor for laptops & phones; Fabric/Care/Style for apparel).
- **Cart & Order Lifecycle:**
  - Guest cart with LocalStorage persistence.
  - Automated merge of guest items into authenticated carts upon sign-in.
  - Strict stock limit guards.
  - Demonstrative coupons (`SAVE10`, `SAVE200`, `FREESHIP`).
  - Printable/PDF Order Summary generator.
- **Administration Suite (`admin.html`):** Secured by demo PIN (`admin123`) or authenticated admin role. Provides live inventory counts, low-stock alerts, product creation, price/stock adjustments, and order status updates.
- **Light & Dark Theme:** System-aware theme toggle persisting via `shopsmart_theme`.

---

## 3. Technology Stack

- **Structure & Semantic Layout:** HTML5 Semantic elements (`<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`).
- **Styling:** Vanilla CSS3 with CSS Custom Properties (Design Tokens), Flexbox, CSS Grid, media queries, and dark mode palette tokens.
- **Client Logic:** Vanilla JavaScript (ES6+ modular separation). No React, Angular, or external UI frameworks.
- **Icons:** Lucide Icons UMD.
- **Authentication:** Dual-mode: Google Firebase Auth SDK v10 (CDN) + Development Mode fallback.
- **Database:** Dual-mode: Google Cloud Firestore v10 (CDN) + Development Mode LocalStorage.
- **Hosting / Local Server:** Any standard HTTP server (Python `http.server`, Node `serve`, Nginx, or GitHub Pages).

---

## 4. Master Catalog (150 Products / 15 Categories)

The catalog is centrally defined in `js/products.js` (and mirrored in root `products.js`). Every single product has been verified with 100% live HTTPS image assets returning `200 OK`:

| Category | Count | Sample Brands & Items |
| :--- | :---: | :--- |
| **1. Mobiles and Tablets** | 10 | Samsung Galaxy S23, iPhone 15 Pro, OnePlus 12, Google Pixel 8, iPad Air M2, Anker PowerCore |
| **2. Laptops and Computers** | 10 | MacBook Air M2, Dell XPS 13, ASUS ROG Zephyrus, LG UltraFine 4K, Keychron K2, Logitech MX Master |
| **3. Audio and Accessories** | 10 | Sony WH-1000XM5, AirPods Pro 2, JBL Charge 5, Bose QC Ultra, Shure MV7, Marshall Stanmore |
| **4. Men’s Fashion** | 10 | Levi's 511 Jeans, Peter England Formal Shirt, Allen Solly Chinos, Puma Hoodie, Titan Watch |
| **5. Women’s Fashion** | 10 | Biba Anarkali Kurti, Fabindia Cotton Saree, Vero Moda Dress, Fossil Jacqueline Watch, Catwalk Heels |
| **6. Footwear** | 10 | Nike Air Pegasus 40, Adidas Ultraboost, Puma Smash, Clarks Oxfords, Skechers Go Walk, Crocs |
| **7. Home and Kitchen** | 10 | Prestige Iris 750W Mixer, Philips Kettle, Hawkins Cookware, Milton Thermosteel, Borosil Bowls |
| **8. Home Appliances** | 10 | Atomberg BLDC Fan, Dyson V8 Cordless, LG 7kg Washing Machine, Samsung Refrigerator, Voltas AC |
| **9. Beauty and Personal Care**| 10 | Minimalist Niacinamide, Cetaphil Cleanser, Derma Co Sunscreen, L'Oreal Serum, Beardo Oil |
| **10. Sports and Fitness** | 10 | Kobo Hex Dumbbells, Boldfit Yoga Mat, Vector X Gloves, SG Cricket Bat, Nivia Football |
| **11. Books and Stationery** | 10 | Clean Code, CLRS Algorithms, The Pragmatic Programmer, Parker Jotter, Casio Scientific Calc |
| **12. Gaming** | 10 | Razer DeathAdder, Redragon Kumara K552, PS5 DualSense, HyperX Cloud II, Elgato Stream Deck |
| **13. Bags and Travel** | 10 | American Tourister 28L, Skybags Duffle, Wildcraft Trekking, Safari Trolley, Aristocrat Luggage |
| **14. Furniture & Home Decor**| 10 | Green Soul Ergonomic Chair, Wakefit Orthopedic Mattress, Solimo Coffee Table, Philips Lamp |
| **15. Toys and Accessories** | 10 | LEGO Classic Creative Bricks, Hot Wheels 5-Car Pack, Nerf Elite Blaster, Barbie Doll, Rubik's |

---

## 5. Project Structure

```
Shoping/
├── index.html                 # Homepage with hero, categories, featured, deals, Coimbatore deals
├── products.html              # Full product catalog with sidebar filters & sorting
├── product-details.html       # Individual product view, specifications & related items
├── cart.html                  # Dedicated shopping cart with coupon & free shipping meter
├── checkout.html              # Customer info, address form, simulated payment, confirmation
├── orders.html                # Authenticated order history & printable order summaries
├── wishlist.html              # Wishlist management grid
├── compare.html               # 4-item comparison matrix
├── budget-shopping.html       # Budget shopping optimizer tool
├── assistant.html             # Natural language shopping assistant
├── admin.html                 # Admin workspace & inventory controls
├── login.html                 # Sign In view with quick demo credentials
├── register.html              # Registration view with phone & password meter
├── forgot-password.html       # Password reset recovery form
├── profile.html               # User account details & saved addresses
├── about.html                 # About Us & Coimbatore operations
├── contact.html               # Contact information & customer inquiry form
├── privacy.html               # Comprehensive privacy disclosures
├── terms.html                 # User agreement & terms of service
├── README.md                  # Detailed documentation & setup guide
├── css/
│   └── style.css              # Unified responsive design system & dark mode tokens
├── js/
│   ├── products.js            # Master catalog (150 unique items, 15 categories)
│   ├── utils.js               # INR currency formatter, toasts, theme toggles, date formatters
│   ├── firebase-config.js     # Firebase SDK initialization & automatic mode detection
│   ├── auth.js                # Dual-mode authentication (Firebase Auth + Dev Mode)
│   ├── cart.js                # Cart storage, coupon logic, GST, and auto-merge on sign-in
│   ├── wishlist.js            # Wishlist persistence & badge counters
│   ├── product-renderer.js    # Card rendering, quick view modals, recently viewed logger
│   ├── search.js              # Full-text search, speech voice search, image demo search
│   ├── comparison.js          # Product comparison table logic
│   ├── budget-shopping.js     # Budget bundle algorithm
│   ├── assistant.js           # Catalog query assistant
│   ├── orders.js              # Order checkout handler, status tracker & invoice printer
│   ├── admin.js               # Inventory CRUD, stock modification, business metrics
│   └── app.js                 # Global initialization, drawer handlers, header sync
└── assets/
    └── fallback/
        └── product-fallback.svg  # Branded offline fallback image
```

---

## 6. Local Setup & Running Locally

Because ShopSmart uses native ES modules and standard web assets, you can run it locally with any static web server:

### Option A: Python (Recommended)
```bash
# In the project root directory:
python3 -m http.server 8085
```
Open your browser to: [http://localhost:8085](http://localhost:8085)

### Option B: Node.js (npx serve)
```bash
npx serve -l 8085 .
```

### Option C: VS Code Live Server
Right-click on `index.html` in VS Code and select **"Open with Live Server"**.

---

## 7. Firebase Configuration Guide

ShopSmart is pre-wired to detect your Firebase project. If no credentials are supplied, it runs smoothly in **Development Mode**. To activate live Google Cloud Firebase:

### Step 1: Create a Firebase Project
1. Navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** and name it (e.g., `shopsmart-store`).
3. Click **Continue** (Google Analytics is optional).

### Step 2: Enable Email/Password Authentication
1. In the Firebase Console left navigation, select **Build &gt; Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, choose **Email/Password**.
4. Enable the first toggle (**Email/Password**) and click **Save**.

### Step 3: Set Up Cloud Firestore Database
1. In the left navigation, select **Build &gt; Firestore Database**.
2. Click **Create Database**.
3. Choose a location closest to India (e.g., `asia-south1` Mumbai).
4. Start in **Production mode** (or test mode for 30 days).

### Step 4: Add Web App Credentials to ShopSmart
1. In Firebase Project Overview, click the **Web icon `(</>)`** to register a web app.
2. Enter the app nickname `ShopSmart Web` and click **Register app**.
3. Copy the `firebaseConfig` object values.
4. Open [js/firebase-config.js](file:///Users/sanjith/Shoping/js/firebase-config.js) and replace the placeholder fields:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyYourActualApiKeyHere...",
  authDomain: "shopsmart-store.firebaseapp.com",
  projectId: "shopsmart-store",
  storageBucket: "shopsmart-store.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef..."
};
```
Save the file. When you refresh the website, the Development Mode notification banner will automatically disappear and ShopSmart will communicate directly with Google Firebase.

### Step 5: Recommended Firestore Security Rules
Deploy these security rules in the Firebase Console under **Firestore Database &gt; Rules** to protect customer data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to verify logged-in owner
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }
    
    // User profile documents
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    // User carts
    match /carts/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    // User wishlists
    match /wishlists/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    // Orders collection: Users can create and read their own orders only
    match /orders/{orderId} {
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Products collection: Publicly readable; writable only by admins
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

### Step 6: Assigning Administrator Role Securely
Never rely solely on client-side flags for production authorization. To grant an administrator claim:
1. In your backend or Firebase Admin SDK script (Node.js):
```javascript
const admin = require('firebase-admin');
admin.initializeApp();

// Set custom user claim
admin.auth().setCustomUserClaims('TARGET_USER_UID', { admin: true })
  .then(() => {
    console.log('User granted admin role successfully.');
  });
```
2. In Development Mode, enter PIN `admin123` or sign in with `admin@shopsmart.demo` (Password: `Admin@123`).

---

## 8. Transparent Architecture: Real vs. Simulated Features

To adhere strictly to honest software engineering, ShopSmart clearly identifies what is executing natively and what is simulated:

| Feature | Execution Type | Details |
| :--- | :---: | :--- |
| **Catalog Browsing, Filters & Sorting** | **Real** | Dynamic client JavaScript executing across all 150 products. |
| **Cart Quantities & Stock Boundaries** | **Real** | Validated against inventory count; persisted in storage. |
| **Coupon & Price Calculations** | **Real** | Math verified across discounts, delivery, and illustrative GST. |
| **Voice Search** | **Real** | Utilizes browser's native Web Speech API (`webkitSpeechRecognition`). |
| **Firebase Auth & Firestore** | **Real (Configurable)** | Real SDK calls when credentials provided; transparent Dev Mode when empty. |
| **Payment Gateway** | **Simulated** | Interactive checkout test interface. No real bank accounts or cards are charged. |
| **Live Courier Tracking** | **Simulated** | Progresses through order milestone stages (`Order Placed` &rarr; `Delivered`). |
| **Invoice / Order Summary** | **Real Print/PDF** | Generates an accurate, printable PDF order summary breakdown. |

---

## 9. Coimbatore Store Configuration

ShopSmart is customized for the retail and commercial ecosystem of **Coimbatore, Tamil Nadu, India**:
- **Commercial Headquarters:** D.B. Road, R.S. Puram, Coimbatore, Tamil Nadu - 641002, India.
- **Currency & Formatting:** Indian Rupee (`INR — ₹`) with Indian numeral commas (`₹1,49,990`).
- **Timezone:** `Asia/Kolkata` (IST) for timestamping order receipts.
- **Checkout Defaults:** City pre-filled to `Coimbatore` and State to `Tamil Nadu` (editable for any Indian address).
- **Validation Rules:**
  - Phone numbers strictly validated for 10-digit Indian mobile format (`^[6-9]\d{9}$`).
  - Postal codes validated for 6-digit Indian PIN codes (`^[1-9]\d{5}$`).
- **Regional Section:** Homepage includes a dedicated *"Local Deals in Coimbatore"* collection highlighting priority regional dispatches.

---

## 10. Cart, Pricing & Tax Calculations

All cart calculations follow a single, immutable formula across `cart.js`, `checkout.js`, and order summaries:

$$\text{Merchandise Subtotal} = \sum (\text{Unit Price} \times \text{Quantity})$$

$$\text{Eligible Discount} = \begin{cases} \text{Subtotal} \times 0.10 & \text{if } \texttt{SAVE10} \\ \min(200, \text{Subtotal}) & \text{if } \texttt{SAVE200 and Subtotal} \ge 2000 \\ 0 & \text{otherwise} \end{cases}$$

$$\text{Discounted Subtotal} = \max(0, \text{Merchandise Subtotal} - \text{Eligible Discount})$$

$$\text{Delivery Fee} = \begin{cases} 0 & \text{if Subtotal} \ge 999 \text{ or } \texttt{FREESHIP} \\ 99 & \text{otherwise} \end{cases}$$

$$\text{Illustrative GST (18\%)} = \text{Discounted Subtotal} \times 0.18$$

$$\text{Final Payable Amount} = \text{Discounted Subtotal} + \text{Delivery Fee} + \text{Illustrative GST}$$

---

## 11. How to Modify Products & Images

### Modifying Products
Edit `js/products.js` (and `products.js` in root). Each product item contains:
```javascript
{
  id: 151,
  name: "Your Product Name",
  brand: "Brand Name",
  category: "Gaming", // Must match one of the 15 categories
  price: 2499,
  originalPrice: 3999,
  discount: 38,
  image: "https://images.unsplash.com/photo-...",
  rating: 4.6,
  reviews: 142,
  stock: 25,
  isFeatured: true,
  isBestseller: false,
  isDeal: true,
  description: "Detailed description...",
  specs: { "Key 1": "Val 1", "Key 2": "Val 2" }
}
```

### Image Guidelines
- Use authentic Unsplash photo URLs formatted with `?w=600&auto=format&fit=crop&q=80`.
- Electronics, monitors, and appliances automatically use `object-fit: contain` to preserve silhouettes.
- Fashion and apparel use `object-fit: cover`.
- Offline fallback SVG is maintained in `assets/fallback/product-fallback.svg`.

---

## 12. Known Limitations

1. **Browser Speech API:** Voice search relies on the Web Speech API supported in Chromium browsers (Chrome, Edge, Brave, Safari). If unsupported, the voice button alerts the user gracefully and retains regular text search.
2. **Statutory Tax Invoices:** Order summaries generated for download are for demonstrative customer receipt purposes. A legal tax invoice requires a registered business GSTIN and tax filing server.
3. **Frontend Payment:** Payments are simulated. A production deployment requires integrating a PCI-DSS certified gateway (Razorpay, Cashfree, or Stripe) with server-side webhook verification.

---

&copy; 2026 ShopSmart Online Shopping Store. Coimbatore, Tamil Nadu, India.
