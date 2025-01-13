import { NextResponse } from 'next/server';
import { stripe } from '@/app/lib/stripe';
import { admin, db } from '@/app/lib/firebaseAdmin';

export async function POST(req: Request) {
 try {
   console.log('Starting checkout session creation...');
   
   const { email, userId } = await req.json();
   console.log('Received request data:', { email, userId });

   if (!email || !userId) {
     console.error('Missing required fields:', { email, userId });
     return NextResponse.json({ error: 'Missing email or userId' }, { status: 400 });
   }

   const authHeader = req.headers.get('Authorization');
   if (!authHeader || !authHeader.startsWith('Bearer ')) {
     console.error('Missing or invalid auth header');
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }
   const idToken = authHeader.split('Bearer ')[1];

   try {
     const decodedToken = await admin.auth().verifyIdToken(idToken);
     if (decodedToken.uid !== userId) {
       console.error('Token UID mismatch:', { tokenUid: decodedToken.uid, requestUid: userId });
       return NextResponse.json({ error: 'Invalid user ID' }, { status: 403 });
     }
     console.log('Token verified for user:', decodedToken.uid);
   } catch (error) {
     console.error('Token verification error:', error);
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }

   // Get or create Stripe customer
   console.log('Checking for existing customer...');
   const userDoc = await db.collection('users').doc(userId).get();
   let customerId = userDoc.exists ? userDoc.data()?.customerId : null;
   console.log('Existing customer ID:', customerId);

   if (!customerId) {
     console.log('Creating new Stripe customer...');
     const customer = await stripe.customers.create({
       email: email,
       metadata: {
         userId: userId,
       },
     });
     customerId = customer.id;
     console.log('Customer created:', {
       customerId,
       userId,
       metadata: customer.metadata
     });

     await db.collection('users').doc(userId).set({
       customerId,
       email,
       updatedAt: new Date().toISOString(),
       lastCustomerUpdate: new Date().toISOString(),
       stripeMetadata: customer.metadata
     }, { merge: true });
     
     const verifyDoc = await db.collection('users').doc(userId).get();
     console.log('Verified user document:', verifyDoc.data());
   }

   console.log('Creating checkout session with data:', {
     customerId,
     userId,
     email,
     priceId: process.env.STRIPE_PRICE_ID
   });

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
     subscription_data: {  // Aggiunto metadata alla subscription
       metadata: {
         userId,
         customerId,
       }
     },
     metadata: {
       userId,
       customerId,
     },
     success_url: `${process.env.NEXT_PUBLIC_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
     cancel_url: `${process.env.NEXT_PUBLIC_URL}/pending-payment`,
     allow_promotion_codes: true
   });

   console.log('Checkout session created:', {
     sessionId: session.id,
     metadata: session.metadata,
     customerId: session.customer,
     url: session.url
   });

   // Aggiorna il documento con i dati della sessione
   await db.collection('users').doc(userId).set({
     lastCheckoutSession: session.id,
     lastCheckoutCreated: new Date().toISOString(),
     checkoutMetadata: session.metadata
   }, { merge: true });

   return NextResponse.json({ sessionId: session.id });
 } catch (error) {
   console.error('Error creating checkout session:', error);
   return NextResponse.json(
     { error: error instanceof Error ? error.message : 'Error creating checkout session' }, 
     { status: 500 }
   );
 }
}
