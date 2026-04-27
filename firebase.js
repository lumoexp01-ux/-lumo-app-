// ============================================================
// LUMO — firebase.js
// Fragmento 4.1 — Config, auth e Firestore
// ============================================================
// INSTRUÇÕES PARA CONFIGURAR:
// 1. Acesse https://console.firebase.google.com
// 2. Crie um projeto → "Adicionar app" → Web
// 3. Copie os valores do firebaseConfig e cole abaixo
// 4. Ative Authentication → Email/Senha e Google
// 5. Ative Firestore Database
// 6. Aplique as REGRAS DO FIRESTORE abaixo no Console
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  increment,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// ============================================================
// TODO: substitua pelos valores do seu projeto Firebase
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyA-LHWB0o3a-Z21GxPug3cYui579jHQxS4",
  authDomain: "lumo-app-89926.firebaseapp.com",
  projectId: "lumo-app-89926",
  storageBucket: "lumo-app-89926.firebasestorage.app",
  messagingSenderId: "470067283117",
  appId: "1:470067283117:web:174d7e9d11078129953224"
};

// ============================================================

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// Expõe no escopo global para compatibilidade com scripts tradicionais
window.lumo = {
  auth,
  db,
  // Auth
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  // Firestore
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  increment,
  arrayUnion
};

console.log("Firebase conectado");

// ============================================================
// REGRAS DO FIRESTORE — copiar e colar no Firebase Console
// Firestore → Rules → substituir todo o conteúdo abaixo
// ============================================================
//
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//
//     // BLOQUEIO PADRÃO — negar tudo por padrão
//     match /{document=**} {
//       allow read, write: if false;
//     }
//
//     // Documento do usuário — só o próprio usuário acessa
//     match /usuarios/{userId} {
//       allow read: if request.auth != null
//                   && request.auth.uid == userId;
//
//       allow write: if request.auth != null
//                    && request.auth.uid == userId
//                    && request.resource.data.nome.size() < 100
//                    && request.resource.data.email.size() < 200;
//     }
//
//     // Contadores de rate limiting — só o próprio usuário
//     match /contadores/{contadorId} {
//       allow read, write: if request.auth != null
//                          && contadorId.matches(request.auth.uid + '_.*');
//     }
//   }
// }
//
// ============================================================
// COMO TESTAR AS REGRAS (Rules Playground no Console):
// 1. Usuário autenticado lendo próprio doc           → deve permitir ✅
// 2. Usuário autenticado lendo doc de outro usuário  → deve negar   ✅
// 3. Sem autenticação lendo qualquer doc             → deve negar   ✅
// 4. Campo "nome" com 500 caracteres                 → deve negar   ✅
// ============================================================
