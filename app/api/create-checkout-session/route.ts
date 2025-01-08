// app/api/create-checkout-session/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/app/lib/stripe';

export async function POST(req: Request) {
  try {
    const { email, userId } = await req.json();

    const session = await stripe.checkout.sessions.create({
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
      customer_email: email,
      metadata: {
        userId: userId,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error creating checkout session' }, { status: 500 });
  }
}
