// src/firebase.js
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA_IUJC5Xza6-uSMicvwXvgBBKyneIpfqs",
  authDomain: "morkan-c73ff.firebaseapp.com",
  projectId: "morkan-c73ff",
  storageBucket: "morkan-c73ff.appspot.com",
  messagingSenderId: "203114635036",
  appId: "1:203114635036:web:965daf8bbe8575c6c9a4d9",
  measurementId: "G-JM7BK32GHC"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

export { firebase, db };
