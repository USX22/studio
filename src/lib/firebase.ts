"use client";

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, addDoc, collection, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let db: Firestore | null = null;

if (firebaseConfig.projectId) {
    if (!getApps().length) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApps()[0];
    }
    db = getFirestore(app);
}

type TrialData = {
  participant_id: string;
  timestamp: string;
  trial_number: number;
  reaction_time_ms: number;
  stimulus_interval_s: number;
  premature_click: boolean;
};

export const saveTrialData = async (trialData: TrialData) => {
    if (!db) {
        console.log("Firebase not configured. Skipping save. Trial data:", trialData);
        return;
    }
    try {
        await addDoc(collection(db, "reactifast-trials"), trialData);
    } catch (error) {
        console.error("Error writing document: ", error);
    }
};
