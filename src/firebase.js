
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAzZp6-lmdgD2tscTVTdCT7uiK_swV7Ez8",
  authDomain: "robot-website-5a175.firebaseapp.com",
  projectId: "robot-website-5a175",
  storageBucket: "robot-website-5a175.firebasestorage.app",
  messagingSenderId: "65266821351",
  appId: "1:65266821351:web:a9bfac0c62d3d29663da42",
  measurementId: "G-JHWFT79KSJ",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
