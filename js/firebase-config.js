/**
 * ShopSmart — Firebase Configuration & Mode Controller
 * Supports Production Firebase Auth & Firestore, with Transparent Development Mode.
 */

'use strict';

/**
 * Replace the placeholder values below with your Firebase project credentials.
 * To obtain these keys, create a project at https://console.firebase.google.com/
 * and add a Web Application.
 */
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "shopsmart-ecommerce.firebaseapp.com",
  projectId: "shopsmart-ecommerce",
  storageBucket: "shopsmart-ecommerce.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Determine if user has supplied actual credentials
const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY" &&
  !firebaseConfig.apiKey.includes("YOUR_")
);

let firebaseApp = null;
let firebaseAuth = null;
let firestoreDb = null;

if (isFirebaseConfigured && typeof firebase !== 'undefined') {
  try {
    firebaseApp = firebase.initializeApp(firebaseConfig);
    firebaseAuth = firebase.auth();
    firestoreDb = firebase.firestore();
    console.log('[ShopSmart] Connected to production Firebase Auth & Firestore.');
  } catch (error) {
    console.warn('[ShopSmart] Error initializing Firebase:', error);
  }
} else {
  console.info(
    '[ShopSmart] Running in DEVELOPMENT MODE (Local Simulated Auth & Firestore). ' +
    'To connect live Firebase, update credentials in js/firebase-config.js. See README.md.'
  );
}

// Global Export
window.ShopSmartFirebase = {
  config: firebaseConfig,
  isConfigured: isFirebaseConfigured,
  app: firebaseApp,
  auth: firebaseAuth,
  db: firestoreDb,
  mode: isFirebaseConfigured ? 'production' : 'development'
};
