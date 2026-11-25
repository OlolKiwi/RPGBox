import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD3pmNGtB9bIaKNTQVxz0D9pBMvCWAVkY0",
  authDomain: "rpgbox-e616b.firebaseapp.com",
  projectId: "rpgbox-e616b",
  storageBucket: "rpgbox-e616b.firebasestorage.app",
  messagingSenderId: "213378222436",
  appId: "1:213378222436:web:0bef467aca56f837725271"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const ERR = {
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/wrong-password": "E-mail ou senha incorretos.",
  "auth/user-not-found": "E-mail ou senha incorretos.",
  "auth/email-already-in-use": "Esse e-mail já tem conta. Use a aba Entrar.",
  "auth/weak-password": "A senha precisa de pelo menos 6 caracteres.",
  "auth/invalid-email": "Digite um e-mail válido.",
  "auth/too-many-requests": "Muitas tentativas. Aguarde um pouco e tente de novo.",
  "auth/network-request-failed": "Sem conexão. Tente de novo."
};

export const letterAvatar = n => "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#3b2a57"/><text x="50" y="66" font-size="48" text-anchor="middle" fill="#f1e9d8" font-family="Georgia">${((n || "?").trim().charAt(0) || "?").toUpperCase().replace(/[<>&]/g, "?")}</text></svg>`);

export const okUrl = u => {
  if (typeof u === "string" && /^data:image\/(webp|jpeg|png|gif);base64,/.test(u)) return true;
  try { return new URL(u).protocol === "https:" } catch { return false }
};
