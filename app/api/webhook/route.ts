import { NextResponse } from 'next/server';
import { stripe } from '@/app/lib/stripe';
import { db, admin } from '@/app/lib/firebaseAdmin';
import Stripe from 'stripe';

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

type WebhookSubscription = Stripe.Subscription & {
  metadata: {
    userId: string;
  };
  status: string;
  customer: string;
};

async function findUserByCustomerId(customerId: string): Promise<string | null> {
  try {
    console.log('Searching for user - customerId:', customerId);
    
    // Prima cerca per customerId
    const userByCustomerId = await db
      .collection('users')
      .where('customerId', '==', customerId)
      .limit(1)
      .get();

    if (!userByCustomerId.empty) {
      console.log('User found by customerId');
      return userByCustomerId.docs[0].id;
    }

    // Se non trova, prova a cercare nelle subscriptions
    const subscriptions = await db
      .collection('users')
      .where('subscriptionId', '==', customerId)
      .limit(1)
      .get();

    if (!subscriptions.empty) {
      console.log('User found by subscriptionId');
      return subscriptions.docs[0].id;
    }

    console.log('No user found with either customerId or subscriptionId');
    return null;
  } catch (error) {
    console.error('Error finding user:', error);
    return null;
  }
}

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

    console.log('Webhook signature:', signature);

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    console.log('Event type:', event.type);
    console.log('Event data:', JSON.stringify(event.data.object, null, 2));

    const eventId = event.id;

    // Idempotency check
    const eventRef = db.collection('webhookEvents').doc(eventId);
    const eventDoc = await eventRef.get();

    if (eventDoc.exists) {
      console.log(`Event ${eventId} already processed`);
      return NextResponse.json({ received: true });
    }

    // Mark event as processed
    await eventRef.set({ received: true });

    switch (event.type) {
      case 'checkout.session.completed': {
        console.log('Processing checkout.session.completed');
        const session = event.data.object as WebhookSession;
        console.log('Complete session data:', JSON.stringify(session, null, 2));

        if (!session.metadata?.userId) {
          console.error('Missing userId in session metadata');
          throw new Error('Missing userId in session metadata');
        }

        const userRef = db.collection('users').doc(session.metadata.userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
          console.error('User document not found:', session.metadata.userId);
          throw new Error('User document not found');
        }

        const updateData: UpdateData = {
          subscriptionStatus: 'active',
          customerId: session.customer,
          subscriptionId: session.subscription,
          email: session.customer_details?.email,
          updatedAt: admin.firestore.Timestamp.now(),
          paymentCompleted: true,
          lastPaymentSuccess: admin.firestore.Timestamp.now(),
        };

        console.log('Updating user document with:', updateData);
        await userRef.set(updateData, { merge: true });
        console.log('User document updated successfully');
        break;
      }

      case 'checkout.session.expired': {
        console.log('Processing checkout.session.expired');
        const session = event.data.object as WebhookSession;

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
        console.log('Session expired status updated');
        break;
      }

      case 'customer.subscription.deleted': {
        console.log('Processing customer.subscription.deleted');
        const subscription = event.data.object as WebhookSubscription;
        console.log('Full subscription data:', JSON.stringify(subscription, null, 2));

        // Se non abbiamo metadata.userId, proviamo a trovare l'utente tramite il customerId
        const userId = subscription.metadata?.userId || await findUserByCustomerId(subscription.customer);

        if (!userId) {
          console.log('Could not find associated user');
          return NextResponse.json({ received: true });
        }

        const updateData: UpdateData = {
          subscriptionStatus: 'inactive',
          updatedAt: admin.firestore.Timestamp.now(),
          paymentCompleted: false,
          subscriptionDeletedAt: admin.firestore.Timestamp.now(),
        };

        await db.collection('users').doc(userId).set(updateData, { merge: true });
        console.log('Subscription deleted status updated');
        break;
      }

      case 'customer.subscription.updated': {
        console.log('Processing customer.subscription.updated');
        const subscription = event.data.object as WebhookSubscription;
        console.log('Full subscription data:', JSON.stringify(subscription, null, 2));

        // Usa lo stesso pattern di fallback al customerId
        const userId = subscription.metadata?.userId || await findUserByCustomerId(subscription.customer);

        if (!userId) {
          console.log('Could not find associated user');
          return NextResponse.json({ received: true });
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

        console.log('Updating subscription with:', updateData);
        await db.collection('users').doc(userId).set(updateData, { merge: true });
        console.log('Subscription update completed');
        break;
      }

      case 'customer.subscription.trial_will_end': {
        console.log('Processing customer.subscription.trial_will_end');
        const subscription = event.data.object as WebhookSubscription;
        
        const userId = subscription.metadata?.userId || await findUserByCustomerId(subscription.customer);

        if (!userId) {
          console.log('Could not find associated user');
          return NextResponse.json({ received: true });
        }

        const updateData: UpdateData = {
          subscriptionStatus: subscription.status,
          trialEndWarning: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
        };

        await db.collection('users').doc(userId).set(updateData, { merge: true });
        console.log('Trial end warning updated');
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
