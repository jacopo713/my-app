// app/api/webhook/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/app/lib/stripe';
import { headers } from 'next/headers';
import { db } from '@/app/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = headers();
  const sig = headersList.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    if (!sig || !webhookSecret) {
      return NextResponse.json(
        { error: 'Missing signature or webhook secret' },
        { status: 400 }
      );
    }

    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      webhookSecret
    );

    // Gestisce gli eventi dell'abbonamento
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as any;
        // Aggiorna lo stato dell'abbonamento in Firestore
        await setDoc(doc(db, 'users', session.metadata.userId), {
          subscriptionStatus: 'active',
          customerId: session.customer,
          subscriptionId: session.subscription,
          email: session.customer_email,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        break;

      case 'customer.subscription.deleted':
        const subscription = event.data.object as any;
        // Aggiorna lo stato quando l'abbonamento viene cancellato
        await setDoc(doc(db, 'users', subscription.metadata.userId), {
          subscriptionStatus: 'inactive',
          updatedAt: new Date().toISOString()
        }, { merge: true });
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as any;
        // Aggiorna lo stato quando l'abbonamento viene modificato
        await setDoc(doc(db, 'users', updatedSubscription.metadata.userId), {
          subscriptionStatus: updatedSubscription.status,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
