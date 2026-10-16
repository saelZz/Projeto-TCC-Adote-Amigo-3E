
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

// Função para esconder o preloader quando o conteúdo carregar
function esconderPreloader() {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    preloader.classList.add('hidden');
  }
}

// Exemplo de uso integrando com o Firestore:
async function carregarDadosDoPet() {
  try {
    // 1. Busca os dados no Firebase...
    // const docSnap = await getDoc(docRef);
    
    // 2. Simula o preenchimento dos dados na tela...
    
  } catch (error) {
    console.error("Erro ao carregar:", error);
  } finally {
    // 3. Esconde a tela de carregamento assim que terminar (com sucesso ou erro)
    esconderPreloader();
  }
}

// Se quiser testar direto quando a página carregar:
window.addEventListener('load', () => {
  // Dá um tempinho mínimo só para exibir a animação charmosa
  setTimeout(esconderPreloader, 1000); 
});
