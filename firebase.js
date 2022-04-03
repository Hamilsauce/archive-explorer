import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.2/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.6.2/firebase-database.js";
// import * as getFirestore  from 'https://www.gstatic.com/firebasejs/8.10.0/firebase-firestore.js'
import * as getFirestore from  "https://www.gstatic.com/firebasejs/9.6.2/firebase-firestore.js";
console.log('getFirestore', getFirestore.getFirestore)
const firebaseConfig = {
  apiKey: "AIzaSyBVnhy7RGLeKxhzywHJ2e5RV5HjYaQYQhQ",
  authDomain: "home-db-ed6f0.firebaseapp.com",
  projectId: "home-db-ed6f0",
  storageBucket: "home-db-ed6f0.appspot.com",
  messagingSenderId: "3177858927",
  appId: "1:3177858927:web:aeb4b8b013b35165564a9a"
};

const firebase = initializeApp(firebaseConfig);
export const firestore = getFirestore.getFirestore(firebase); 
console.log('firestore', firestore)

export const firebaseDb = getDatabase(firebase); 

{
  firebaseConfig,
  firebase,
  firebaseDb
}
