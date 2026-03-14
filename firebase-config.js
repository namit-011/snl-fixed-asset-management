/**
 * ╔══════════════════════════════════════════════════════╗
 * ║   SNL Fixed Asset Management — Firebase Config      ║
 * ╚══════════════════════════════════════════════════════╝
 *
 * SETUP (one-time, ~10 minutes):
 *
 *  STEP 1 — Create Firebase project
 *    → Go to https://console.firebase.google.com
 *    → Click "Add project" → name it (e.g. "snl-assets") → Create
 *
 *  STEP 2 — Add a Web App
 *    → In your project, click the </> (Web) icon
 *    → Register app → copy the firebaseConfig values below
 *
 *  STEP 3 — Enable Authentication
 *    → Firebase Console → Authentication → Get Started
 *    → Sign-in method → Email/Password → Enable → Save
 *    → Users tab → Add user → enter email & password for each team member
 *
 *  STEP 4 — Create Firestore Database
 *    → Firebase Console → Firestore Database → Create database
 *    → Start in "test mode" → choose region closest to you → Done
 *
 *  STEP 5 — Set Firestore Security Rules
 *    → Firestore → Rules tab → replace with:
 *
 *       rules_version = '2';
 *       service cloud.firestore {
 *         match /databases/{database}/documents {
 *           match /{document=**} {
 *             allow read, write: if request.auth != null;
 *           }
 *         }
 *       }
 *
 *  STEP 6 — Deploy to Netlify
 *    → Go to https://netlify.com → Log in → "Add new site" → "Deploy manually"
 *    → Drag this entire project folder into the deploy box
 *    → Your live URL will appear (e.g. https://snl-assets.netlify.app)
 *
 *  STEP 7 — Set your live URL below and redeploy
 */

// ── Paste your Firebase config here ──────────────────────────
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyBznJYgc6ZQYfRXREFM1S8JFXPwKaMzHFM",
  authDomain:        "snl-asset.firebaseapp.com",
  projectId:         "snl-asset",
  storageBucket:     "snl-asset.firebasestorage.app",
  messagingSenderId: "938946886781",
  appId:             "1:938946886781:web:e454c4fa783d8c8d5a0514",
};

// ── Your live Netlify URL (set after deploying) ───────────────
// This is used in QR codes so phones anywhere can open the asset card.
// Example: "https://snl-assets.netlify.app/asset-view.html"
const LIVE_VIEWER_URL = "https://snl-fixed-asset-management-production.up.railway.app/asset-view.html";
