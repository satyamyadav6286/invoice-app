
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDHvVssPH6mN7ntdW-c4uaor4SeKCK0LTQ",
  authDomain: "invoice-app-63cbb.firebaseapp.com",
  projectId: "invoice-app-63cbb",
  storageBucket: "invoice-app-63cbb.appspot.com",
  messagingSenderId: "79255489541",
  appId: "1:79255489541:web:45536d2a965529bfe6206c",
  measurementId: "G-0V99RMKYCM"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage(app);
export const db = getFirestore(app);
