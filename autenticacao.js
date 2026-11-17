import { auth, db } from './firebase-config.js';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export async function fazerLoginComGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, "usuarios", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        nome: user.displayName,
        email: user.email,
        fotoUrl: user.photoURL,
        tipoPerfil: "tutor",
        criadoEm: new Date()
      });
    }

    console.log("Login realizado com sucesso:", user.displayName);
    window.location.href = "index.html";
  } catch (error) {
    console.error("Erro no login com Google:", error);
  }
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Usuário ativo:", user.email);
  } else {
  }
});