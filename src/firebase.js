// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAumHgwZ3xkUSAXaD8dSo9_Vw6YX8ziDQM",
  authDomain: "duckhuntweb3.firebaseapp.com",
  projectId: "duckhuntweb3",
  storageBucket: "duckhuntweb3.firebasestorage.app",
  messagingSenderId: "1048255595395",
  appId: "1:1048255595395:web:3e58ff61ffd45903df2cb6",
  measurementId: "G-458718Q972"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };