import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "pets-final-practice-app",
  appId: "1:649377653642:web:5d2c17bfbae252085f9e73",
  storageBucket: "pets-final-practice-app.firebasestorage.app",
  apiKey: "AIzaSyBCsFUNGQgcUg8rVZjvkrXnmMqcbK3RRLc",
  authDomain: "pets-final-practice-app.firebaseapp.com",
  messagingSenderId: "649377653642",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
