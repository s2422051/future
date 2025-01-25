import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC1nWAHTeQei9Dd0aSyTrHINwuXmMHBrMY",
  authDomain: "trainliveinfo-37bac.firebaseapp.com",
  projectId: "trainliveinfo-37bac",
  storageBucket: "trainliveinfo-37bac.firebasestorage.app",
  messagingSenderId: "895555752528",
  appId: "1:895555752528:web:334e8b5cd98de53eb63755",
  measurementId: "G-NM4KNEJFQE"
};

// Firebase初期化
const app = initializeApp(firebaseConfig);

// Authentication初期化
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Firestore初期化
const db = getFirestore(app);

export { auth, db };



