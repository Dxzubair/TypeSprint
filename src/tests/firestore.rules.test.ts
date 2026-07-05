import { 
  initializeTestEnvironment, 
  RulesTestEnvironment 
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import * as fs from 'fs';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'typesprint-e476d',
    firestore: {
      rules: fs.readFileSync('firestore.rules', 'utf8'),
    }
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('TypeSprint Security Rules Red Team Audit', () => {
  it('Payload 1: Reject other user profile modifications', async () => {
    const context = testEnv.authenticatedContext('user_B');
    const db = context.firestore();
    const docRef = doc(db, 'users', 'user_A');
    try {
      await setDoc(docRef, { profile: { name: 'Hacked' } });
      expect.fail('Should have thrown permission denied');
    } catch (error: any) {
      expect(error.message).toMatch(/permission/i);
    }
  });

  it('Payload 2: Reject privilege escalation', async () => {
    const context = testEnv.authenticatedContext('user_A');
    const db = context.firestore();
    const docRef = doc(db, 'users', 'user_A');
    try {
      await setDoc(docRef, { profile: { isAdmin: true, role: 'admin' } });
      expect.fail('Should have thrown permission denied');
    } catch (error: any) {
      expect(error.message).toMatch(/permission/i);
    }
  });

  it('Payload 3: Reject shadow updates / ghost fields', async () => {
    const context = testEnv.authenticatedContext('user_A');
    const db = context.firestore();
    const docRef = doc(db, 'users', 'user_A');
    try {
      await setDoc(docRef, { profile: { name: 'Player 1', hackStatus: 'unlocked' } });
      expect.fail('Should have thrown permission denied');
    } catch (error: any) {
      expect(error.message).toMatch(/permission/i);
    }
  });

  it('Payload 4: Reject invalid type specs for typing stats', async () => {
    const context = testEnv.authenticatedContext('user_A');
    const db = context.firestore();
    const docRef = doc(db, 'users', 'user_A');
    try {
      await setDoc(docRef, { stats: { bestWpm: 'one_hundred' } });
      expect.fail('Should have thrown permission denied');
    } catch (error: any) {
      expect(error.message).toMatch(/permission/i);
    }
  });

  it('Payload 5: Reject negative levels or XP', async () => {
    const context = testEnv.authenticatedContext('user_A');
    const db = context.firestore();
    const docRef = doc(db, 'users', 'user_A');
    try {
      await setDoc(docRef, { profile: { xp: -1, level: -1 } });
      expect.fail('Should have thrown permission denied');
    } catch (error: any) {
      expect(error.message).toMatch(/permission/i);
    }
  });

  it('Payload 6: Reject out of bounds values (speed hacking)', async () => {
    const context = testEnv.authenticatedContext('user_A');
    const db = context.firestore();
    const docRef = doc(db, 'users', 'user_A');
    try {
      await setDoc(docRef, { stats: { bestWpm: 9999 } });
      expect.fail('Should have thrown permission denied');
    } catch (error: any) {
      expect(error.message).toMatch(/permission/i);
    }
  });

  it('Payload 7: Reject ID poisoning / junk characters in subcollection keys', async () => {
    const context = testEnv.authenticatedContext('user_A');
    const db = context.firestore();
    const docRef = doc(db, 'users/user_A/custom_paragraphs/some_malicious_id_$$$');
    try {
      await setDoc(docRef, { title: 'Hacked', text: 'Injected content' });
      expect.fail('Should have thrown permission denied');
    } catch (error: any) {
      expect(error.message).toMatch(/permission/i);
    }
  });

  it('Payload 8: Reject hijacking leaderboard entry names or user UIDs', async () => {
    const context = testEnv.authenticatedContext('user_B');
    const db = context.firestore();
    const docRef = doc(db, 'leaderboard', 'user_A');
    try {
      await setDoc(docRef, { userId: 'user_A', bestWpm: 150 });
      expect.fail('Should have thrown permission denied');
    } catch (error: any) {
      expect(error.message).toMatch(/permission/i);
    }
  });

  it('Payload 9: Reject client-injected temporal data', async () => {
    const context = testEnv.authenticatedContext('user_A');
    const db = context.firestore();
    const docRef = doc(db, 'users', 'user_A');
    try {
      await setDoc(docRef, { lastSynced: '2030-01-01T00:00:00Z' });
      expect.fail('Should have thrown permission denied');
    } catch (error: any) {
      expect(error.message).toMatch(/permission/i);
    }
  });

  it('Payload 10: Reject cross-user read attempts', async () => {
    const context = testEnv.authenticatedContext('user_B');
    const db = context.firestore();
    const docRef = doc(db, 'users', 'user_A');
    try {
      await getDoc(docRef);
      expect.fail('Should have thrown permission denied');
    } catch (error: any) {
      expect(error.message).toMatch(/permission/i);
    }
  });

  it('Payload 11: Reject bloated arrays (denial of wallet)', async () => {
    const context = testEnv.authenticatedContext('user_A');
    const db = context.firestore();
    const docRef = doc(db, 'users', 'user_A');
    const hugeLessons = Array.from({ length: 500 }, (_, i) => `Lesson${i}`);
    try {
      await setDoc(docRef, { completedLessons: hugeLessons });
      expect.fail('Should have thrown permission denied');
    } catch (error: any) {
      expect(error.message).toMatch(/permission/i);
    }
  });

  it('Payload 12: Reject accuracy values greater than 100%', async () => {
    const context = testEnv.authenticatedContext('user_A');
    const db = context.firestore();
    const docRef = doc(db, 'leaderboard', 'user_A');
    try {
      await setDoc(docRef, { userId: 'user_A', bestWpm: 100, accuracy: 120 });
      expect.fail('Should have thrown permission denied');
    } catch (error: any) {
      expect(error.message).toMatch(/permission/i);
    }
  });
});
