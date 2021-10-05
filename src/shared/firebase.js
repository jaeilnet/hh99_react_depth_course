import firebase from "firebase/compat/"
import "firebase/compat/auth"
import "firebase/compat/firestore"
import "firebase/compat/storage"

const firebaseConfig = {
  apiKey: "AIzaSyB2UYahnv6y6jZ9UEW1rHRHyzAAI5ya4Ow",
  authDomain: "react-practice-281af.firebaseapp.com",
  projectId: "react-practice-281af",
  storageBucket: "react-practice-281af.appspot.com",
  messagingSenderId: "1050681412542",
  appId: "1:1050681412542:web:c1d1ea93b77c62addf87ef",
  measurementId: "G-8WREDCZBCL",
}

firebase.initializeApp(firebaseConfig)

const apiKey = firebaseConfig.apiKey
const auth = firebase.auth()
const firestore = firebase.firestore()
const storage = firebase.storage()
const realtime = firebase.database()

export { auth, apiKey, firestore, storage, realtime }
