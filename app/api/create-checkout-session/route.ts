// app/api/create-checkout-session/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/app/lib/stripe';
import { db } from '@/app/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const { email, userId } = await req.json();

    // 1. Controlla se l'utente esiste già in Firestore
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);

    let customerId;

    if (userDocSnap.exists()) {
      // 2. Se l'utente esiste, recupera il customerId (se presente)
      const userData = userDocSnap.data();
      customerId = userData.customerId;
    }

    // 3. Se non esiste un customerId, crea un nuovo cliente Stripe
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: email,
        metadata: {
          userId: userId,
        },
      });
      customerId = customer.id;

      // 4. Salva il customerId in Firestore
      await setDoc(userDocRef, { customerId }, { merge: true });
    }
    
    // 5. Crea la sessione di checkout usando il customerId
    const session = await stripe.checkout.sessions.create({
      customer: customerId, // Usa il customerId
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
        userId, // Passa userId anche nei metadata per sicurezza
      },
    });

    return NextResponse.json({ url: session.url }); // Restituisci la URL, non la session ID
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: 'Error creating checkout session' }, { status: 500 });
  }
}
