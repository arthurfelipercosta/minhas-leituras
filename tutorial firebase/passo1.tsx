// PASSO 1: Configurar Firebase (Auth + Firestore)
// Arquivo: src/config/firebaseConfig.ts
// src/config/firebaseConfig.ts

// import de pacotes
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANTE: Substitua pelos seus valores reais do Firebase
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_AUTH_DOMAIN",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_STORAGE_BUCKET",
    messagingSenderId: "SEU_MESSAGING_SENDER_ID",
    appId: "SEU_APP_ID"
};

// Inicializar Firebase App
const app = initializeApp(firebaseConfig);

// Inicializar Auth com persistência no AsyncStorage
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

// Inicializar Firestore
export const db = getFirestore(app);

export default app;