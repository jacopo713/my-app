// /api/create-checkout-session.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/app/lib/stripe';
import { db } from '@/app/lib/firebase'; // Client SDK
import { doc, setDoc, getDoc } from 'firebase/firestore';
import admin from 'firebase-admin';

// Inizializza l'Admin SDK solo per la verifica dei token
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(req: Request) {
  try {
    // 1. Parsing del corpo della richiesta
    const { email, userId } = await req.json();
    console.log('Received request with email:', email, 'and userId:', userId);

    if (!email || !userId) {
      console.error('Missing email or userId');
      return NextResponse.json({ error: 'Missing email or userId' }, { status: 400 });
    }

    // 2. Recupera l'intestazione Authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];

    // 3. Verifica il token ID
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log('Token verified for user:', decodedToken.uid);
    } catch (error) {
      console.error('Error verifying token:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 4. Controlla che l'uid del token corrisponda al userId fornito
    if (decodedToken.uid !== userId) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 403 });
    }

    // 5. Verifica se l'utente esiste già in Firestore
    const userDocRef = doc(db, 'users', userId);
    console.log('User document reference created:', userDocRef.path);

    const userDocSnap = await getDoc(userDocRef);
    console.log('User document exists:', userDocSnap.exists());

    let customerId;

    if (userDocSnap.exists()) {
      // Recupera il customerId
      const userData = userDocSnap.data();
      customerId = userData.customerId;
      console.log('Existing customerId:', customerId);
    }

    // 6. Se non esiste un customerId, crea un nuovo cliente Stripe
    if (!customerId) {
      console.log('Creating new Stripe customer...');
      const customer = await stripe.customers.create({
        email: email,
        metadata: {
          userId: userId,
        },
      });
      customerId = customer.id;
      console.log('New customer created with ID:', customerId);

      // Salva il customerId in Firestore
      console.log('Saving customerId to Firestore...');
      await setDoc(userDocRef, { customerId }, { merge: true });
      console.log('CustomerId saved to Firestore');
    }

    // 7. Crea la sessione di checkout
    console.log('Creating Stripe checkout session...');
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/register`,
      metadata: {
        userId,
      },
    });
    console.log('Checkout session created with ID:', session.id);

    // 8. Restituisci sessionId al frontend
    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: 'Error creating checkout session' }, { status: 500 });
  }
}


