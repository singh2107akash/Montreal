import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue, update, remove } from 'firebase/database';

// ============================================================
// FIREBASE SETUP INSTRUCTIONS:
// 1. Go to https://console.firebase.google.com
// 2. Click "Create a project" (name it anything, e.g. "degen-odds")
// 3. Skip Google Analytics when asked
// 4. Once created, click "Realtime Database" in the left sidebar
// 5. Click "Create Database" → choose any location → Start in TEST MODE
// 6. Go to Project Settings (gear icon top-left) → scroll to "Your apps"
// 7. Click the web icon (</>) to add a web app
// 8. Register it (any name), then copy the firebaseConfig object
// 9. Paste the values below
// ============================================================

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const GAME_ROOT = 'degen-odds';

export function gameRef(path = '') {
  return ref(db, path ? `${GAME_ROOT}/${path}` : GAME_ROOT);
}

export function writeData(path, data) {
  return set(gameRef(path), data);
}

export function updateData(path, data) {
  return update(gameRef(path), data);
}

export function readData(path) {
  return get(gameRef(path)).then((snap) => snap.val());
}

export function removeData(path) {
  return remove(gameRef(path));
}

export function onData(path, callback) {
  return onValue(gameRef(path), (snap) => callback(snap.val()));
}

export function isFirebaseConfigured() {
  return !firebaseConfig.apiKey.startsWith('YOUR_');
}
