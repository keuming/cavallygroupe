import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export interface CheckoutSessionParams {
  userId: number;
  userEmail: string;
  userName: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  successUrl: string;
  cancelUrl: string;
}

export async function createCheckoutSession(params: CheckoutSessionParams) {
  const lineItems = params.items.map(item => ({
    price_data: {
      currency: 'xof',
      product_data: {
        name: item.name,
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    customer_email: params.userEmail,
    client_reference_id: params.userId.toString(),
    metadata: {
      user_id: params.userId.toString(),
      customer_email: params.userEmail,
      customer_name: params.userName,
    },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    allow_promotion_codes: true,
  });

  return session;
}

export async function retrieveSession(sessionId: string) {
  return stripe.checkout.sessions.retrieve(sessionId);
}

export async function retrievePaymentIntent(paymentIntentId: string) {
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

export function constructWebhookEvent(body: Buffer, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}

export { stripe };
