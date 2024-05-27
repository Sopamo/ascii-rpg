import { initializeApp } from "firebase/app";
import { getFirestore, addDoc, collection, doc, setDoc, serverTimestamp } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCyrSWICL1kAfiNw1nnO_dUr3LpE3LOO0s",
  authDomain: "asciirpg-a1438.firebaseapp.com",
  projectId: "asciirpg-a1438",
  storageBucket: "asciirpg-a1438.appspot.com",
  messagingSenderId: "639775216192",
  appId: "1:639775216192:web:b49c3cc838f416f48e05a5"
};

// Initialize Firebase
const defaultProject = initializeApp(firebaseConfig);

export function getDb() {
  return getFirestore(defaultProject)
}

export async function addMessage(message: {systemPrompt: string, userMessage: string, responseJson: any}) {
  // Add a new document in collection "cities"
  const doc = {
    createdAt: serverTimestamp(),
    messages: [
      {
        role: "system",
        content: message.systemPrompt
      },
      {
        role: "user",
        content: message.userMessage
      },
      {
        role: "system",
        content: JSON.stringify(message.responseJson)
      },
    ]
  }
  await addDoc(collection(getDb(), "messages"), doc);
}
