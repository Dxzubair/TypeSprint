import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    const q = collection(db, 'beta_feedback');
    const qs = await getDocs(q);
    console.log("Success! Read documents: ", qs.size);
  } catch (error) {
    console.error("Error reading: ", error);
  }
  process.exit(0);
}

test();
