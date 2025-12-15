// npm install firebase
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDLvrrFX_WghFoOuUAR0AHqHfIwIfed2-A",
    authDomain: "minhas-leituras-d0b49.firebaseapp.com",
    projectId: "minhas-leituras-d0b49",
    storageBucket: "minhas-leituras-d0b49.firebasestorage.app",
    messagingSenderId: "699263974728",
    appId: "1:699263974728:web:5ba8c7e9b58e3dfd85877d",
    measurementId: "G-5JHPG25EYM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);