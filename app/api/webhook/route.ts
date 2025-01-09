import { NextResponse } from 'next/server';
import { stripe } from '@/app/lib/stripe';
import { db } from '@/app/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import Stripe from 'stripe';

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
};

export async function POST(req: Request) {
  try {
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

    console.log('Processing webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        console.log('Checkout session completed event received');
        const session = event.data.object as unknown as WebhookSession;
        
        if (!session.metadata?.userId) {
          console.error('Missing userId in session metadata');
          throw new Error('Missing userId in session metadata');
        }

        console.log('Updating user data for userId:', session.metadata.userId);

        // Verifica se il documento utente esiste
        const userRef = doc(db, 'users', session.metadata.userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          console.error('User document not found');
          throw new Error('User document not found');
        }

        const updateData = {
          subscriptionStatus: 'active',
          customerId: session.customer,
          subscriptionId: session.subscription,
          email: session.customer_details?.email,
          updatedAt: new Date().toISOString(),
          paymentCompleted: true,
          lastPaymentSuccess: new Date().toISOString()
        };

        console.log('Updating user with data:', updateData);

        await setDoc(doc(db, 'users', session.metadata.userId), updateData, { merge: true });

        console.log('User document updated successfully');
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as unknown as WebhookSession;
        console.log('Session expired for user:', session.metadata?.userId);
        
        if (!session.metadata?.userId) {
          throw new Error('Missing userId in session metadata');
        }

        await setDoc(doc(db, 'users', session.metadata.userId), {
          subscriptionStatus: 'payment_required',
          lastCheckoutExpired: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          paymentCompleted: false
        }, { merge: true });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as unknown as WebhookSubscription;
        console.log('Subscription deleted for user:', subscription.metadata?.userId);
        
        if (!subscription.metadata?.userId) {
          throw new Error('Missing userId in subscription metadata');
        }

        await setDoc(doc(db, 'users', subscription.metadata.userId), {
          subscriptionStatus: 'inactive',
          updatedAt: new Date().toISOString(),
          paymentCompleted: false,
          subscriptionDeletedAt: new Date().toISOString()
        }, { merge: true });
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as unknown as WebhookSubscription;
        console.log('Subscription updated for user:', subscription.metadata?.userId);
        
        if (!subscription.metadata?.userId) {
          throw new Error('Missing userId in subscription metadata');
        }

        const updateData = {
          subscriptionStatus: subscription.status,
          updatedAt: new Date().toISOString()
        };

        if (subscription.status === 'active') {
          updateData.paymentCompleted = true;
          updateData.lastPaymentSuccess = new Date().toISOString();
        } else if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
          updateData.paymentCompleted = false;
          updateData.lastPaymentFailure = new Date().toISOString();
        }

        console.log('Updating subscription with data:', updateData);

        await setDoc(doc(db, 'users', subscription.metadata.userId), updateData, { merge: true });
        break;
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as unknown as WebhookSubscription;
        
        if (!subscription.metadata?.userId) {
          throw new Error('Missing userId in subscription metadata');
        }

        await setDoc(doc(db, 'users', subscription.metadata.userId), {
          trialEndWarning: new Date().toISOString(),
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
