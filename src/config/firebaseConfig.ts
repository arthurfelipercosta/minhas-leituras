// src/config/firebaseConfig.tsx

// import de pacotes
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: 'AIzaSyDLvrrFX_WghFoOuUAR0AHqHfIwIfed2-A',
    authDomain: 'minhas-leituras-d0b49.firebaseapp.com',
    projectId: 'minhas-leituras-d0b49',
    storageBucket: 'minhas-leituras-d0b49.firebasestorage.app',
    messagingSenderId: '699263974728',
    appId: '1:699263974728:web:5ba8c7e9b58e3dfd85877d',
    measurementId: 'G-5JHPG25EYM'
}

// Inicializar o Firebase
const app = initializeApp(firebaseConfig);

// Inicializar os serviços utilizados
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export de serviços utilizados
export { auth, db, storage };