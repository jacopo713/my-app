// src/app/lib/firebaseAdmin.ts
import admin from 'firebase-admin';

// Verifica se l'app è già stata inizializzata per evitare errori
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      // Sostituisce le sequenze di escape delle nuove linee con vere nuove linee
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.FIREBASE_ADMIN_DATABASE_URL,
  });
}

const db = admin.firestore();

export { admin, db };

