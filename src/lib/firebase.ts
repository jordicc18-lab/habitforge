import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDigqGWVqMz5wdi7fKpySNLnNiwx1whOpg",
  authDomain: "habitforge-2e182.firebaseapp.com",
  projectId: "habitforge-2e182",
  storageBucket: "habitforge-2e182.firebasestorage.app",
  messagingSenderId: "411915921505",
  appId: "1:411915921505:web:5c6f483bbe54595d98e220"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)