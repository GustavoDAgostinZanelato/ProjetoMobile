import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, collection, doc, deleteDoc, addDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyA3O4_BAwAlFTt_AJaff1ArgllXMCWA0sI",
  authDomain: "sonoredb.firebaseapp.com",
  databaseURL: "https://sonoredb-default-rtdb.firebaseio.com",
  projectId: "sonoredb",
  storageBucket: "sonoredb.appspot.com",
  messagingSenderId: "1055472347601",
  appId: "1:1055472347601:web:8fb1ecfae9b1b19fbe58f0"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export { auth };