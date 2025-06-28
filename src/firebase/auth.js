import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { auth } from "./firebaseConfig";

// Establece la persistencia de sesión antes de iniciar sesión
export const loginWithEmail = async (email, password) => {
  await setPersistence(auth, browserLocalPersistence); // ✅ guarda la sesión incluso si recargas
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user; // 🔁 asegúrate de devolver el user
};

export const logoutUser = async () => {
  await signOut(auth);
};

export const watchAuthState = (onUserChange) => {
  onAuthStateChanged(auth, (user) => {
    onUserChange(user);
  });
};
