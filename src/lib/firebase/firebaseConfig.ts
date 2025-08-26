import {initializeApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
  apiKey: "AIzaSyAozqz2OXHSfkdnS54MB1PqA1jNxiFa7bM",
  authDomain: "nexus-application-43440.firebaseapp.com",
  projectId: "nexus-application-43440",
  storageBucket: "nexus-application-43440.firebasestorage.app",
  messagingSenderId: "907440202599",
  appId: "1:907440202599:web:8c293f3225f656d952c5c2",
  measurementId: "G-4VJXR36YMR"
};

const provider = new GoogleAuthProvider();
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, provider, signInWithPopup, signOut, storage };