// src/config/firebaseConfig.ts

// import de pacotes
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// import { getAnalytics } from 'firebase/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyDLvrrFX_WghFoOuUAR0AHqHfIwIfed2-A",
    authDomain: "minhas-leituras-d0b49.firebaseapp.com",
    projectId: "minhas-leituras-d0b49",
    storageBucket: "minhas-leituras-d0b49.firebasestorage.app",
    messagingSenderId: "699263974728",
    appId: "1:699263974728:web:5ba8c7e9b58e3dfd85877d",
    measurementId: "G-5JHPG25EYM"
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);

export default app;
