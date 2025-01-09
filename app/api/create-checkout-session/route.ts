// app/api/webhook/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/app/lib/stripe';
import { db } from '@/app/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import Stripe from 'stripe';

interface WebhookSession {
  metadata: {
    userId: string;
  };
  customer: string;
  subscription: string;
  customer_email: string;
}

interface WebhookSubscription {
  metadata: {
    userId: string;
  };
  status: Stripe.Subscription.Status;
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') || '';
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return NextResponse.json(
        { error: 'Missing signature or webhook secret' },
        { status: 400 }
      );
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    // Gestisce gli eventi dell'abbonamento
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as WebhookSession;
        await setDoc(doc(db, 'users', session.metadata.userId), {
          subscriptionStatus: 'active',
          customerId: session.customer,
          subscriptionId: session.subscription,
          email: session.customer_email,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as WebhookSubscription;
        await setDoc(doc(db, 'users', subscription.metadata.userId), {
          subscriptionStatus: 'inactive',
          updatedAt: new Date().toISOString()
        }, { merge: true });
        break;
      }

      case 'customer.subscription.updated': {
        const updatedSubscription = event.data.object as WebhookSubscription;
        await setDoc(doc(db, 'users', updatedSubscription.metadata.userId), {
          subscriptionStatus: updatedSubscription.status,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error('Webhook error:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Webhook Error: ${error.message}` },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Unknown error occurred' },
      { status: 400 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
