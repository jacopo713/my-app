// app/api/webhook/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/app/lib/stripe';
import { db } from '@/app/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
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

    console.log('Processing webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as unknown as WebhookSession;
        
        if (!session.metadata?.userId) {
          throw new Error('Missing userId in session metadata');
        }

        console.log('Updating user after successful checkout:', session.metadata.userId);

        await setDoc(doc(db, 'users', session.metadata.userId), {
          subscriptionStatus: 'active',
          customerId: session.customer,
          subscriptionId: session.subscription,
          email: session.customer_details?.email,
          updatedAt: new Date().toISOString(),
          paymentCompleted: true,
          checkoutCompleted: new Date().toISOString()
        }, { merge: true });

        console.log('User updated successfully');
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as unknown as WebhookSession;
        
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
        
        if (!subscription.metadata?.userId) {
          throw new Error('Missing userId in subscription metadata');
        }

        await setDoc(doc(db, 'users', subscription.metadata.userId), {
          subscriptionStatus: 'inactive',
          updatedAt: new Date().toISOString(),
          paymentCompleted: false
        }, { merge: true });
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as unknown as WebhookSubscription;
        
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
