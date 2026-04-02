// src/shared/api/firebaseClient.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyCkFMWrjy7brDgmZ0PCbDZ0z_ADsojYP7M',
  authDomain: 'the-road-goes-ever-on.firebaseapp.com',
  projectId: 'the-road-goes-ever-on',
  storageBucket: 'the-road-goes-ever-on.firebasestorage.app',
  messagingSenderId: '388609011240',
  appId: '1:388609011240:web:aa4ad1fa1ae933343a8f1d',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Firestore
const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
});

// Auth with RN persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const storage = getStorage(app);

export { app, auth, db, storage };