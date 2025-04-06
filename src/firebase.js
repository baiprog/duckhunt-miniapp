// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAsxkESoJ2_fTMmgM6YJuPi4QW7iHv43Go",
  authDomain: "duckhuntweb3-9db08.firebaseapp.com",
  projectId: "duckhuntweb3-9db08",
  storageBucket: "duckhuntweb3-9db08.firebasestorage.app",
  messagingSenderId: "410131966059",
  appId: "1:410131966059:web:3d4c2b30304eae3ac0692e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };