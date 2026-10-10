/**
 * ShopSmart — Frontend Demonstration Authentication & User Profile Controller
 * Strictly Vanilla JavaScript & Browser LocalStorage
 *
 * IMPORTANT SECURITY NOTICE:
 * This is a frontend demonstration system. Because no server-side backend
 * is used, credentials and sessions are demonstrated locally using Web Crypto SHA-256 hashing
 * and LocalStorage. Do not use real production passwords.
 */

'use strict';

const AUTH_STORAGE_KEYS = {
  CURRENT_USER: 'shopsmart_current_user',
  DEMO_USERS: 'shopsmart_demo_users'
};

// SHA-256 Password Hashing using native Web Crypto API
async function hashPassword(plainText) {
  if (!plainText) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText + '_shopsmart_demo_salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Seed demonstration user if none exists
(async function initDemoUsers() {
  const existing = localStorage.getItem(AUTH_STORAGE_KEYS.DEMO_USERS);
  if (!existing) {
    const passwordHash = await hashPassword('Password@123');
    const defaultUsers = [
      {
        uid: 'user-cbe-001',
        fullName: 'Sanjith Y',
        email: 'sanjith@example.com',
        phone: '9876543210',
        passwordHash: passwordHash,
        role: 'admin',
        createdAt: new Date().toISOString(),
        addresses: [
          {
            id: 'addr-01',
            house: 'Flat 4B, Green Nest Apartments',
            street: 'D.B. Road, R.S. Puram',
            locality: 'Near Flower Market',
            city: 'Coimbatore',
            state: 'Tamil Nadu',
            pin: '641002',
            isDefault: true
          }
        ]
      }
    ];
    localStorage.setItem(AUTH_STORAGE_KEYS.DEMO_USERS, JSON.stringify(defaultUsers));
  }
})();

// Listeners collection
const authListeners = [];

/**
 * Register auth state listener
 */
function onAuthStateChanged(callback) {
  authListeners.push(callback);
  callback(getCurrentUser());
}

function notifyAuthListeners(user) {
  authListeners.forEach(fn => {
    try {
      fn(user);
    } catch (e) {
      console.error('[ShopSmart Auth Listener Error]:', e);
    }
  });
}

/**
 * Retrieve current active user profile or null
 */
function getCurrentUser() {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEYS.CURRENT_USER);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.warn('[ShopSmart] Error reading current user from LocalStorage:', e);
    return null;
  }
}

/**
 * Check if a user is authenticated
 */
function isAuthenticated() {
  return Boolean(getCurrentUser());
}

/**
 * Register a new user (demonstration only)
 */
async function registerUser({ fullName, email, phone, password }) {
  if (!fullName || !email || !password) {
    return { success: false, error: 'Full name, email and password are required.' };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const users = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEYS.DEMO_USERS) || '[]');

  if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
    return { success: false, error: 'An account with this email address already exists.' };
  }

  const passwordHash = await hashPassword(password);
  const newUser = {
    uid: 'user-' + Date.now(),
    fullName: fullName.trim(),
    email: normalizedEmail,
    phone: (phone || '').trim(),
    passwordHash: passwordHash,
    role: 'customer',
    createdAt: new Date().toISOString(),
    addresses: [
      {
        id: 'addr-' + Date.now(),
        house: '104, Avinashi Road',
        street: 'Peelamedu',
        locality: 'Near PSG Tech',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        pin: '641004',
        isDefault: true
      }
    ]
  };

  users.push(newUser);
  localStorage.setItem(AUTH_STORAGE_KEYS.DEMO_USERS, JSON.stringify(users));

  // Auto-login newly registered user
  const publicProfile = {
    uid: newUser.uid,
    fullName: newUser.fullName,
    email: newUser.email,
    phone: newUser.phone,
    role: newUser.role,
    addresses: newUser.addresses,
    createdAt: newUser.createdAt
  };
  localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER, JSON.stringify(publicProfile));
  notifyAuthListeners(publicProfile);

  return { success: true, user: publicProfile };
}

/**
 * Log in an existing user
 */
async function loginUser(email, password) {
  if (!email || !password) {
    return { success: false, error: 'Please enter both email and password.' };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const users = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEYS.DEMO_USERS) || '[]');
  const user = users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return { success: false, error: 'No account found with this email. Try demo: sanjith@example.com / Password@123' };
  }

  const inputHash = await hashPassword(password);
  if (user.passwordHash !== inputHash) {
    return { success: false, error: 'Incorrect password. Demonstration password is Password@123' };
  }

  const publicProfile = {
    uid: user.uid,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    addresses: user.addresses || [],
    createdAt: user.createdAt
  };

  localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER, JSON.stringify(publicProfile));
  notifyAuthListeners(publicProfile);

  return { success: true, user: publicProfile };
}

/**
 * Log out current user
 */
function logoutUser() {
  localStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER);
  notifyAuthListeners(null);
  return { success: true };
}

/**
 * Update user profile
 */
function updateUserProfile(updates) {
  const current = getCurrentUser();
  if (!current) return { success: false, error: 'Not authenticated' };

  const updatedProfile = { ...current, ...updates };
  localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedProfile));

  // Sync to demo users store
  const users = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEYS.DEMO_USERS) || '[]');
  const idx = users.findIndex(u => u.uid === current.uid);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...updates };
    localStorage.setItem(AUTH_STORAGE_KEYS.DEMO_USERS, JSON.stringify(users));
  }

  notifyAuthListeners(updatedProfile);
  return { success: true, user: updatedProfile };
}

/**
 * Add a saved delivery address
 */
function addAddress(newAddress) {
  const current = getCurrentUser();
  if (!current) return { success: false, error: 'Not authenticated' };

  const addresses = current.addresses || [];
  if (newAddress.isDefault) {
    addresses.forEach(a => a.isDefault = false);
  } else if (addresses.length === 0) {
    newAddress.isDefault = true;
  }

  const addressWithId = {
    ...newAddress,
    id: 'addr-' + Date.now()
  };

  addresses.push(addressWithId);
  return updateUserProfile({ addresses });
}

/**
 * Remove an address
 */
function removeAddress(addressId) {
  const current = getCurrentUser();
  if (!current) return { success: false, error: 'Not authenticated' };

  let addresses = (current.addresses || []).filter(a => a.id !== addressId);
  if (addresses.length > 0 && !addresses.some(a => a.isDefault)) {
    addresses[0].isDefault = true;
  }
  return updateUserProfile({ addresses });
}

/**
 * Set an address as default
 */
function setDefaultAddress(addressId) {
  const current = getCurrentUser();
  if (!current) return { success: false, error: 'Not authenticated' };

  const addresses = (current.addresses || []).map(a => ({
    ...a,
    isDefault: a.id === addressId
  }));
  return updateUserProfile({ addresses });
}

// Global exports
window.ShopSmartAuth = {
  getCurrentUser,
  isAuthenticated,
  loginUser,
  registerUser,
  logoutUser,
  updateUserProfile,
  addAddress,
  removeAddress,
  setDefaultAddress,
  onAuthStateChanged
};
