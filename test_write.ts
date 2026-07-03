import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    const docRef = await addDoc(collection(db, 'beta_feedback'), {
      message: 'Hello World',
      createdAt: serverTimestamp()
    });
    console.log("Success! Inserted document ID: ", docRef.id);
  } catch (error) {
    console.error("Error inserting document: ", error);
  }
  process.exit(0);
}

test();
