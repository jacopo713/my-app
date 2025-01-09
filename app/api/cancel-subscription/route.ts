// app/api/cancel-subscription/route.ts
import { NextResponse } from 'next/server';
import { stripe } from '@/app/lib/stripe';
import { admin, db } from '@/app/lib/firebaseAdmin';

export async function POST(req: Request) {
  try {
    const { userId, customerId, subscriptionId } = await req.json();

    // Verify Firebase token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      if (decodedToken.uid !== userId) {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 403 });
      }
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Cancel Stripe subscription if exists
    if (subscriptionId) {
      await stripe.subscriptions.cancel(subscriptionId);
    }

    // Delete Stripe customer if exists
    if (customerId) {
      await stripe.customers.del(customerId);
    }

    // Update Firestore document
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      subscriptionStatus: 'cancelled',
      isActive: false,
      cancelledAt: admin.firestore.Timestamp.now(),
      deletedAt: admin.firestore.Timestamp.now()
    });

    // Delete Firebase Auth user
    await admin.auth().deleteUser(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error cancelling subscription' },
      { status: 500 }
    );
  }
}
