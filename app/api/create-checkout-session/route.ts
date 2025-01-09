// /api/create-checkout-session/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/app/lib/stripe';
import * as admin from 'firebase-admin';

// Inizializzazione Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    } as admin.ServiceAccount),
  });
}

const db = admin.firestore();

export async function POST(req: Request) {
  try {
    const { email, userId } = await req.json();
    console.log('Received request with email:', email, 'and userId:', userId);

    if (!email || !userId) {
      return NextResponse.json({ error: 'Missing email or userId' }, { status: 400 });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      if (decodedToken.uid !== userId) {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 403 });
      }
    } catch (error) {
      console.error('Token verification error:', error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user document using Admin SDK
    const userDoc = await db.collection('users').doc(userId).get();
    let customerId = userDoc.exists ? userDoc.data()?.customerId : null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: email,
        metadata: {
          userId: userId,
        },
      });
      customerId = customer.id;

      // Update user with Admin SDK
      await db.collection('users').doc(userId).update({ 
        customerId,
        updatedAt: new Date().toISOString()
      });
    }

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

    console.log('Session created:', session.id);
    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error creating checkout session' }, 
      { status: 500 }
    );
  }
}
