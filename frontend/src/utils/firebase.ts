import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCv_8JxlnXQksMhHBizuzia3b0m-IGj9n0",
  authDomain: "drqr-d5865.firebaseapp.com",
  projectId: "drqr-d5865",
  storageBucket: "drqr-d5865.firebasestorage.app",
  messagingSenderId: "428441923336",
  appId: "1:428441923336:web:32576e4836603495eac6bd",
  measurementId: "G-2NW9N469JF"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
