import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  const testReport = {
    paragraphId: 'test-p-1',
    paragraphTitle: 'Test Title',
    category: 'Test Cat',
    difficulty: 'Easy',
    reportType: 'Spelling Mistake',
    comment: 'Test comment',
    userId: 'guest',
    username: 'Guest',
    deviceModel: 'TestDevice',
    androidVersion: '1.0',
    appVersion: '1.0.0',
    keyboardType: 'QWERTY',
    createdAt: Timestamp.now(),
    status: 'Pending'
  };

  try {
    const docRef = await addDoc(collection(db, 'paragraph_reports'), testReport);
    console.log("Success! Inserted report ID: ", docRef.id);

    const q = query(collection(db, 'paragraph_reports'), where('paragraphId', '==', 'test-p-1'));
    const qs = await getDocs(q);
    console.log("Success! Read reports: ", qs.size);
    if (qs.size > 0) {
        console.log("Report data matches: ", qs.docs[0].data().reportType === 'Spelling Mistake');
    }
  } catch (error) {
    console.error("Error: ", error);
  }
  process.exit(0);
}

test();
