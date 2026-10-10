/**
 * ShopSmart — Authentication & User Profile Controller
 * Supports Production Firebase Auth & Firestore with Transparent Development Mode
 */

'use strict';

const AUTH_STORAGE_KEYS = {
  CURRENT_USER: 'shopsmart_auth_user',
  DEV_USERS: 'shopsmart_dev_users'
};

// Seed demo user in development mode if not present
(function initDevUsers() {
  if (!localStorage.getItem(AUTH_STORAGE_KEYS.DEV_USERS)) {
    const defaultDevUsers = [
      {
        uid: 'dev-user-01',
        fullName: 'Sanjith Y',
        email: 'sanjith@example.com',
        phone: '9876543210',
        password: 'Password@123',
        createdAt: new Date().toISOString(),
        role: 'admin',
        addresses: [
          {
            house: 'Flat 4B, Green Nest',
            street: 'D.B. Road, R.S. Puram',
            city: 'Coimbatore',
            state: 'Tamil Nadu',
            pin: '641002',
            isDefault: true
          }
        ]
      }
    ];
    localStorage.setItem(AUTH_STORAGE_KEYS.DEV_USERS, JSON.stringify(defaultDevUsers));
  }
})();

// Listeners collection
const authStateListeners = [];

/**
 * Register an auth state listener callback
 * @param {Function} callback (user) => void
 */
function onAuthStateChanged(callback) {
  authStateListeners.push(callback);
  // Immediately call with current state
  const currentUser = getCurrentUser();
  callback(currentUser);

  // If live Firebase is configured, bind live listener
  const fb = window.ShopSmartFirebase;
  if (fb && fb.isConfigured && fb.auth) {
    fb.auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        let profile = {
          uid: firebaseUser.uid,
          fullName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          email: firebaseUser.email,
          phone: '',
          role: 'customer'
        };
        if (fb.db) {
          try {
            const doc = await fb.db.collection('users').doc(firebaseUser.uid).get();
            if (doc.exists) {
              profile = { ...profile, ...doc.data() };
            }
          } catch (e) {
            console.warn('[ShopSmart] Error fetching Firestore profile:', e);
          }
        }
        localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER, JSON.stringify(profile));
        notifyListeners(profile);
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER);
        notifyListeners(null);
      }
    });
  }
}

function notifyListeners(user) {
  authStateListeners.forEach(fn => {
    try { fn(user); } catch (e) { console.error(e); }
  });
  updateNavAuthUi(user);
}

/**
 * Retrieve current active user profile
 * @returns {Object|null}
 */
function getCurrentUser() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Register a new user account
 * @param {Object} data { fullName, email, phone, password }
 * @returns {Promise<Object>}
 */
async function registerUser({ fullName, email, phone, password }) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone.trim();
  const cleanName = fullName.trim();

  // Validate Indian Phone (10 digits starting with 6-9)
  if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
    throw new Error('Please enter a valid 10-digit Indian mobile number.');
  }

  const fb = window.ShopSmartFirebase;

  // 1. Production Firebase Registration
  if (fb && fb.isConfigured && fb.auth) {
    const cred = await fb.auth.createUserWithEmailAndPassword(cleanEmail, password);
    const user = cred.user;
    await user.updateProfile({ displayName: cleanName });

    const userDoc = {
      uid: user.uid,
      fullName: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      role: 'customer',
      createdAt: new Date().toISOString(),
      addresses: []
    };

    if (fb.db) {
      await fb.db.collection('users').doc(user.uid).set(userDoc);
    }

    localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER, JSON.stringify(userDoc));
    notifyListeners(userDoc);
    return userDoc;
  }

  // 2. Development Mode Registration
  const rawDev = localStorage.getItem(AUTH_STORAGE_KEYS.DEV_USERS) || '[]';
  const devUsers = JSON.parse(rawDev);

  if (devUsers.some(u => u.email === cleanEmail)) {
    throw new Error('An account with this email address already exists.');
  }

  const newUser = {
    uid: `dev-user-${Date.now()}`,
    fullName: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    password: password,
    role: 'customer',
    createdAt: new Date().toISOString(),
    addresses: [
      {
        house: '12, Sunrise Residency',
        street: 'Avinashi Road',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        pin: '641018',
        isDefault: true
      }
    ]
  };

  devUsers.push(newUser);
  localStorage.setItem(AUTH_STORAGE_KEYS.DEV_USERS, JSON.stringify(devUsers));

  const userProfile = { ...newUser };
  delete userProfile.password;
  localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER, JSON.stringify(userProfile));

  notifyListeners(userProfile);
  return userProfile;
}

/**
 * Log in an existing user
 * @param {string} email
 * @param {string} password
 * @param {boolean} rememberMe
 * @returns {Promise<Object>}
 */
async function loginUser(email, password, rememberMe = true) {
  const cleanEmail = email.trim().toLowerCase();
  const fb = window.ShopSmartFirebase;

  // 1. Production Firebase Login
  if (fb && fb.isConfigured && fb.auth) {
    const cred = await fb.auth.signInWithEmailAndPassword(cleanEmail, password);
    let profile = {
      uid: cred.user.uid,
      fullName: cred.user.displayName || cleanEmail.split('@')[0],
      email: cred.user.email,
      phone: '',
      role: 'customer'
    };

    if (fb.db) {
      try {
        const doc = await fb.db.collection('users').doc(cred.user.uid).get();
        if (doc.exists) {
          profile = { ...profile, ...doc.data() };
        }
      } catch (e) {
        console.warn('[ShopSmart] Error fetching Firestore profile:', e);
      }
    }

    localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER, JSON.stringify(profile));
    notifyListeners(profile);
    return profile;
  }

  // 2. Development Mode Login
  const rawDev = localStorage.getItem(AUTH_STORAGE_KEYS.DEV_USERS) || '[]';
  const devUsers = JSON.parse(rawDev);
  const found = devUsers.find(u => u.email === cleanEmail && u.password === password);

  if (!found) {
    throw new Error('Invalid email or password. Please try again.');
  }

  const userProfile = { ...found };
  delete userProfile.password;
  localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER, JSON.stringify(userProfile));

  notifyListeners(userProfile);
  return userProfile;
}

/**
 * Log out active user
 */
async function logoutUser() {
  const fb = window.ShopSmartFirebase;
  if (fb && fb.isConfigured && fb.auth) {
    try {
      await fb.auth.signOut();
    } catch (e) {
      console.warn('[ShopSmart] Error signing out from Firebase:', e);
    }
  }

  localStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER);
  notifyListeners(null);
  window.ShopSmartUtils.showToast('You have been logged out.', 'info');
}

/**
 * Request password reset
 * @param {string} email
 */
async function sendPasswordReset(email) {
  const cleanEmail = email.trim().toLowerCase();
  const fb = window.ShopSmartFirebase;

  if (fb && fb.isConfigured && fb.auth) {
    await fb.auth.sendPasswordResetEmail(cleanEmail);
    return { success: true, message: 'Password reset link sent to your email.' };
  }

  // Development mode response
  return {
    success: true,
    message: `[Dev Mode] Password reset link simulated for ${cleanEmail}. In production, Firebase will dispatch an actual email.`
  };
}

/**
 * Update User Profile
 * @param {Object} updates
 */
async function updateUserProfile(updates) {
  const current = getCurrentUser();
  if (!current) throw new Error('You must be logged in to update your profile.');

  const updated = { ...current, ...updates };

  const fb = window.ShopSmartFirebase;
  if (fb && fb.isConfigured && fb.db) {
    await fb.db.collection('users').doc(current.uid).update(updates);
  } else {
    // Dev Mode update
    const rawDev = localStorage.getItem(AUTH_STORAGE_KEYS.DEV_USERS) || '[]';
    const devUsers = JSON.parse(rawDev);
    const index = devUsers.findIndex(u => u.uid === current.uid);
    if (index !== -1) {
      devUsers[index] = { ...devUsers[index], ...updates };
      localStorage.setItem(AUTH_STORAGE_KEYS.DEV_USERS, JSON.stringify(devUsers));
    }
  }

  localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));
  notifyListeners(updated);
  return updated;
}

/**
 * Update Header Navigation Authentication UI
 * @param {Object|null} user
 */
function updateNavAuthUi(user) {
  const guestGroup = document.getElementById('navGuestGroup');
  const userGroup = document.getElementById('navUserGroup');
  const userNameEl = document.getElementById('navUserName');
  const userEmailEl = document.getElementById('navUserEmail');

  if (user) {
    if (guestGroup) guestGroup.classList.add('hidden');
    if (userGroup) userGroup.classList.remove('hidden');
    if (userNameEl) userNameEl.textContent = user.fullName || 'My Account';
    if (userEmailEl) userEmailEl.textContent = user.email || '';
  } else {
    if (guestGroup) guestGroup.classList.remove('hidden');
    if (userGroup) userGroup.classList.add('hidden');
    if (userNameEl) userNameEl.textContent = 'Sign In';
  }

  window.ShopSmartUtils.refreshIcons();
}

// Global Export
window.ShopSmartAuth = {
  getCurrentUser,
  registerUser,
  loginUser,
  logoutUser,
  sendPasswordReset,
  updateUserProfile,
  onAuthStateChanged
};
