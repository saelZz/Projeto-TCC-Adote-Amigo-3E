
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

export const firebaseConfig = {
  apiKey: "AIzaSyAHrvVJPyqPIJHZxFfHZC8ZpfPpyQQYq5U",
  authDomain: "projeto-tcc-adote-amigo-65d99.firebaseapp.com",
  projectId: "projeto-tcc-adote-amigo-65d99",
  storageBucket: "projeto-tcc-adote-amigo-65d99.firebasestorage.app",
  messagingSenderId: "1055512647057",
  appId: "1:1055512647057:web:298f17670dad0643637630",
};

/** true quando a configuração ainda não foi preenchida → páginas usam dados de exemplo */
export const isDemoMode = false;

export const app = isDemoMode ? null : initializeApp(firebaseConfig);
export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;
export const storage = app ? getStorage(app) : null;
