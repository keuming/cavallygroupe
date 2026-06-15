import { getDb } from '../db';
import { orders, paymentTransactions } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { PaymentWebhookPayload, PaymentUpdateResult, paymentStatusMap } from './mobilePaymentProviders';
import { sendSmsNotification } from './smsNotifications';

/**
 * Traite les webhooks de paiement et met à jour les statuts de commande
 */
export async function handlePaymentWebhook(
  payload: PaymentWebhookPayload,
  provider: string
): Promise<PaymentUpdateResult> {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Valider le payload
    if (!payload.orderId || !payload.transactionId || !payload.status) {
      throw new Error('Payload de webhook invalide');
    }

    // Récupérer la commande
    const orderList = await db.select().from(orders).where(eq(orders.id, parseInt(payload.orderId))).limit(1);
    const order = orderList[0];

    if (!order) {
      throw new Error(`Commande non trouvée: ${payload.orderId}`);
    }

    // Mapper le statut de paiement au statut de commande
    const newOrderStatus = paymentStatusMap[payload.status] || 'pending_payment';

    // Créer ou mettre à jour la transaction de paiement
    const transactionList = await db.select().from(paymentTransactions).where(eq(paymentTransactions.transactionId, payload.transactionId)).limit(1);
    const existingTransaction = transactionList[0];

    if (!existingTransaction) {
      await db.insert(paymentTransactions).values({
        orderId: order.id,
        transactionId: payload.transactionId,
        paymentMethod: provider as any,
        amount: payload.amount as any,
        status: payload.status as any,
        createdAt: new Date(payload.timestamp * 1000),
        updatedAt: new Date(),
      });
    } else {
      await db
        .update(paymentTransactions)
        .set({
          status: payload.status as any,
          updatedAt: new Date(),
        })
        .where(eq(paymentTransactions.transactionId, payload.transactionId));
    }

    // Mettre à jour le statut de la commande
    if (payload.status === 'success') {
      await db
        .update(orders)
        .set({
          paymentStatus: 'completed',
          status: 'confirmed',
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id));

      // Envoyer une notification SMS de confirmation
      await sendSmsNotification({
        phoneNumber: order.customerPhone || '',
        templateKey: 'payment_confirmed',
        variables: {
          amount: payload.amount.toLocaleString('fr-CI'),
          orderId: order.orderNumber,
          trackingUrl: `${process.env.FRONTEND_URL || 'https://www.cavallygroupe.com'}/track/${order.id}`,
        },
      });

      // Envoyer une notification de commande confirmée
      await sendSmsNotification({
        phoneNumber: order.customerPhone || '',
        templateKey: 'order_confirmed',
        variables: {
          orderId: order.orderNumber,
          deliveryDate: new Date(Date.now()).toLocaleDateString('fr-CI'),
        },
      });
    } else if (payload.status === 'failed') {
      await db
        .update(orders)
        .set({
          paymentStatus: 'failed',
          status: 'cancelled',
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id));

      // Envoyer une notification SMS d'échec
      await sendSmsNotification({
        phoneNumber: order.customerPhone || '',
        templateKey: 'payment_failed',
        variables: {},
      });
    }

    return {
      success: true,
      orderId: payload.orderId,
      transactionId: payload.transactionId,
      newStatus: newOrderStatus,
      message: `Commande ${payload.orderId} mise à jour avec succès`,
    };
  } catch (error) {
    console.error(`Erreur lors du traitement du webhook de paiement: ${error}`);
    throw error;
  }
}

/**
 * Valide la signature du webhook
 */
export function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return signature === expectedSignature;
}

/**
 * Traite les webhooks Wave
 */
export async function handleWaveWebhook(payload: any): Promise<PaymentUpdateResult> {
  const wavePayload: PaymentWebhookPayload = {
    transactionId: payload.id,
    orderId: payload.metadata?.orderId,
    amount: payload.amount,
    currency: payload.currency || 'XOF',
    status: payload.status === 'completed' ? 'success' : 'failed',
    phoneNumber: payload.customer?.phone,
    timestamp: Math.floor(Date.now() / 1000),
  };

  return handlePaymentWebhook(wavePayload, 'wave');
}

/**
 * Traite les webhooks Moov
 */
export async function handleMoovWebhook(payload: any): Promise<PaymentUpdateResult> {
  const moovPayload: PaymentWebhookPayload = {
    transactionId: payload.transactionId,
    orderId: payload.orderId,
    amount: payload.amount,
    currency: payload.currency || 'XOF',
    status: payload.status === 'success' ? 'success' : 'failed',
    phoneNumber: payload.phoneNumber,
    timestamp: Math.floor(Date.now() / 1000),
  };

  return handlePaymentWebhook(moovPayload, 'moov');
}

/**
 * Traite les webhooks MTN Money
 */
export async function handleMtnWebhook(payload: any): Promise<PaymentUpdateResult> {
  const mtnPayload: PaymentWebhookPayload = {
    transactionId: payload.transactionId,
    orderId: payload.reference,
    amount: payload.amount,
    currency: payload.currency || 'XOF',
    status: payload.status === 'SUCCESSFUL' ? 'success' : 'failed',
    phoneNumber: payload.msisdn,
    timestamp: Math.floor(Date.now() / 1000),
  };

  return handlePaymentWebhook(mtnPayload, 'mtn');
}

/**
 * Traite les webhooks Orange Money
 */
export async function handleOrangeWebhook(payload: any): Promise<PaymentUpdateResult> {
  const orangePayload: PaymentWebhookPayload = {
    transactionId: payload.transactionId,
    orderId: payload.orderId,
    amount: payload.amount,
    currency: payload.currency || 'XOF',
    status: payload.status === 'COMPLETED' ? 'success' : 'failed',
    phoneNumber: payload.phoneNumber,
    timestamp: Math.floor(Date.now() / 1000),
  };

  return handlePaymentWebhook(orangePayload, 'orange');
}
