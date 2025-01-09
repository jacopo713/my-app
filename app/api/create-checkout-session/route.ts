// app/api/webhook/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/app/lib/stripe';
import { db } from '@/app/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import Stripe from 'stripe';

// Definizione dei tipi personalizzati per le sessioni Stripe
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
    // Ottieni il body della richiesta e la firma
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') || '';
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // Verifica che signature e webhook secret siano presenti
    if (!signature || !webhookSecret) {
      return NextResponse.json(
        { error: 'Missing signature or webhook secret' },
        { status: 400 }
      );
    }

    // Costruisci l'evento Stripe
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    // Gestione degli eventi Stripe
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as unknown as WebhookSession;
        
        // Verifica la presenza dell'userId nei metadata
        if (!session.metadata?.userId) {
          throw new Error('Missing userId in session metadata');
        }

        // Aggiorna il documento dell'utente in Firestore
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
        const subscription = event.data.object as unknown as WebhookSubscription;
        
        if (!subscription.metadata?.userId) {
          throw new Error('Missing userId in subscription metadata');
        }

        // Aggiorna lo stato dell'abbonamento a inattivo
        await setDoc(doc(db, 'users', subscription.metadata.userId), {
          subscriptionStatus: 'inactive',
          updatedAt: new Date().toISOString()
        }, { merge: true });
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as unknown as WebhookSubscription;
        
        if (!subscription.metadata?.userId) {
          throw new Error('Missing userId in subscription metadata');
        }

        // Aggiorna lo stato dell'abbonamento
        await setDoc(doc(db, 'users', subscription.metadata.userId), {
          subscriptionStatus: subscription.status,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        break;
      }

      // Aggiungi qui altri casi per gestire altri eventi Stripe se necessario
    }

    // Risposta di successo
    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    // Gestione degli errori
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

// Configurazione per disabilitare il body parser di Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};
