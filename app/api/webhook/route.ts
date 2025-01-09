// src/app/api/webhook/route.ts

import { NextResponse } from 'next/server';
import { stripe } from '@/app/lib/stripe';
import { db, admin } from '@/app/lib/firebaseAdmin'; // Importa da firebaseAdmin
import Stripe from 'stripe';

// Definizione delle interfacce
interface UpdateData {
  subscriptionStatus: string;
  updatedAt: FirebaseFirestore.Timestamp;
  paymentCompleted?: boolean;
  lastPaymentSuccess?: FirebaseFirestore.Timestamp;
  lastPaymentFailure?: FirebaseFirestore.Timestamp;
  customerId?: string;
  subscriptionId?: string;
  email?: string;
  trialEndWarning?: FirebaseFirestore.Timestamp;
  subscriptionDeletedAt?: FirebaseFirestore.Timestamp;
  lastCheckoutExpired?: FirebaseFirestore.Timestamp;
}

type WebhookSession = Stripe.Checkout.Session & {
  customer: string;
  subscription: string;
  customer_details?: {
    email: string;
  };
  metadata: {
    userId: string;
  };
};

type WebhookSubscription = Stripe.Subscription & { // Assicurati di usare questa tipizzazione
  metadata: {
    userId: string;
  };
  status: string;
};

export async function POST(req: Request) {
  try {
    console.log('Webhook POST request received');
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') || '';
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      console.error('Missing signature or webhook secret');
      return NextResponse.json(
        { error: 'Missing signature or webhook secret' },
        { status: 400 }
      );
    }

    console.log('Received webhook with signature:', signature);

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    console.log('Constructed event:', event.type);

    const eventId = event.id;

    // Idempotency: verifica se l'evento è già stato elaborato
    const eventRef = db.collection('webhookEvents').doc(eventId);
    const eventDoc = await eventRef.get();

    if (eventDoc.exists) {
      console.log(`Evento ${eventId} già elaborato.`);
      return NextResponse.json({ received: true });
    }

    // Segna l'evento come elaborato
    await eventRef.set({ received: true });

    switch (event.type) {
      case 'checkout.session.completed': {
        console.log('Handling checkout.session.completed event');
        const session = event.data.object as WebhookSession;

        if (!session.metadata?.userId) {
          console.error('Missing userId in session metadata');
          throw new Error('Missing userId in session metadata');
        }

        console.log('User ID from session metadata:', session.metadata.userId);

        const userRef = db.collection('users').doc(session.metadata.userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
          console.error('User document not found for userId:', session.metadata.userId);
          throw new Error('User document not found');
        }

        console.log('User document found:', userDoc.id);

        const updateData: UpdateData = {
          subscriptionStatus: 'active',
          customerId: session.customer,
          subscriptionId: session.subscription,
          email: session.customer_details?.email,
          updatedAt: admin.firestore.Timestamp.now(),
          paymentCompleted: true,
          lastPaymentSuccess: admin.firestore.Timestamp.now(),
        };

        console.log('Update data:', updateData);

        await userRef.set(updateData, { merge: true });

        console.log('User document updated successfully for userId:', session.metadata.userId);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as WebhookSession;
        console.log('Session expired for user:', session.metadata?.userId);

        if (!session.metadata?.userId) {
          throw new Error('Missing userId in session metadata');
        }

        const updateData: UpdateData = {
          subscriptionStatus: 'payment_required',
          lastCheckoutExpired: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
          paymentCompleted: false,
        };

        await db.collection('users').doc(session.metadata.userId).set(updateData, { merge: true });
        console.log('User document updated for expired session:', session.metadata.userId);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as WebhookSubscription; // Utilizzo della tipizzazione
        console.log('Subscription deleted for user:', subscription.metadata?.userId);

        if (!subscription.metadata?.userId) {
          throw new Error('Missing userId in subscription metadata');
        }

        const updateData: UpdateData = {
          subscriptionStatus: 'inactive',
          updatedAt: admin.firestore.Timestamp.now(),
          paymentCompleted: false,
          subscriptionDeletedAt: admin.firestore.Timestamp.now(),
        };

        await db.collection('users').doc(subscription.metadata.userId).set(updateData, { merge: true });
        console.log('User document updated for deleted subscription:', subscription.metadata.userId);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as WebhookSubscription; // Utilizzo della tipizzazione
        console.log('Subscription updated for user:', subscription.metadata?.userId);

        if (!subscription.metadata?.userId) {
          throw new Error('Missing userId in subscription metadata');
        }

        const updateData: UpdateData = {
          subscriptionStatus: subscription.status,
          updatedAt: admin.firestore.Timestamp.now(),
        };

        if (subscription.status === 'active') {
          updateData.paymentCompleted = true;
          updateData.lastPaymentSuccess = admin.firestore.Timestamp.now();
        } else if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
          updateData.paymentCompleted = false;
          updateData.lastPaymentFailure = admin.firestore.Timestamp.now();
        }

        console.log('Updating subscription with data:', updateData);

        await db.collection('users').doc(subscription.metadata.userId).set(updateData, { merge: true });
        console.log('User document updated successfully for subscription update:', subscription.metadata.userId);
        break;
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as WebhookSubscription; // Utilizzo della tipizzazione

        if (!subscription.metadata?.userId) {
          throw new Error('Missing userId in subscription metadata');
        }

        const updateData: UpdateData = {
          subscriptionStatus: subscription.status,
          trialEndWarning: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
        };

        await db.collection('users').doc(subscription.metadata.userId).set(updateData, { merge: true });
        console.log('User document updated for trial end warning:', subscription.metadata.userId);
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
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

