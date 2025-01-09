// app/api/webhook/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/app/lib/stripe';
import { db } from '@/app/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import Stripe from 'stripe';

type StripeCheckoutSession = Stripe.Checkout.Session & {
  metadata: {
    userId: string;
  };
};

type StripeSubscription = Stripe.Subscription & {
  metadata: {
    userId: string;
  };
};

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
        const session = event.data.object as unknown as StripeCheckoutSession;
        
        // Verifica che i dati necessari esistano
        if (!session.metadata?.userId) {
          throw new Error('Missing userId in session metadata');
        }

        await setDoc(doc(db, 'users', session.metadata.userId), {
          subscriptionStatus: 'active',
          customerId: session.customer,
          subscriptionId: session.subscription,
          email: session.customer_details?.email,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as unknown as StripeSubscription;
        
        if (!subscription.metadata?.userId) {
          throw new Error('Missing userId in subscription metadata');
        }

        await setDoc(doc(db, 'users', subscription.metadata.userId), {
          subscriptionStatus: 'inactive',
          updatedAt: new Date().toISOString()
        }, { merge: true });
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as unknown as StripeSubscription;
        
        if (!subscription.metadata?.userId) {
          throw new Error('Missing userId in subscription metadata');
        }

        await setDoc(doc(db, 'users', subscription.metadata.userId), {
          subscriptionStatus: subscription.status,
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
