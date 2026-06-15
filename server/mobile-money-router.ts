import { z } from 'zod';
import { publicProcedure, router } from './_core/trpc';
import { MOBILE_MONEY_PROVIDERS } from './mobile-money-config';
import { getDb } from './db';
import { orders, paymentTransactions } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import type { MobileMoneyPaymentResponse } from './mobile-money-config';

/**
 * Validation schema pour les paramètres de paiement
 */
const paymentSchema = z.object({
  orderId: z.number(),
  provider: z.enum(['wave', 'moov', 'mtn', 'orange']),
  phoneNumber: z.string().min(8),
  amount: z.number().positive(),
});

/**
 * Routeur pour les paiements mobiles
 */
export const mobileMoneyRouter = router({
  /**
   * Obtenir la liste des fournisseurs de paiement disponibles
   */
  getProviders: publicProcedure.query(() => {
    return Object.values(MOBILE_MONEY_PROVIDERS).map(provider => ({
      code: provider.code,
      name: provider.name,
      color: provider.color,
      icon: provider.icon,
      description: provider.description,
    }));
  }),

  /**
   * Initier un paiement mobile money
   */
  initiatePayment: publicProcedure
    .input(paymentSchema)
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database not available');
      }

      try {
        // Vérifier que la commande existe
        const order = await db
          .select()
          .from(orders)
          .where(eq(orders.id, input.orderId))
          .limit(1);

        if (!order.length) {
          throw new Error('Order not found');
        }

        const orderData = order[0];
        const provider = MOBILE_MONEY_PROVIDERS[input.provider.toUpperCase() as keyof typeof MOBILE_MONEY_PROVIDERS];

        if (!provider) {
          throw new Error('Invalid payment provider');
        }

        // Créer un enregistrement de paiement en attente
        const transactionId = `${input.provider}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        await db.insert(paymentTransactions).values({
          orderId: input.orderId,
          amount: input.amount.toString(),
          paymentMethod: input.provider as 'wave' | 'moov' | 'mtn' | 'orange' | 'stripe' | 'cash',
          status: 'pending',
          transactionId,
        });

        // Simuler l'appel API au fournisseur
        // En production, vous appelleriez l'API réelle du fournisseur
        const response = {
          success: true,
          transactionId,
          status: 'pending' as const,
          message: `Paiement initié via ${provider.name}. Veuillez confirmer sur votre téléphone.`,
          provider: input.provider,
        };

        return response as MobileMoneyPaymentResponse;
      } catch (error) {
        console.error('[Mobile Money] Payment initiation error:', error);
        throw error;
      }
    }),

  /**
   * Vérifier le statut d'un paiement
   */
  checkPaymentStatus: publicProcedure
    .input(z.object({
      transactionId: z.string(),
      provider: z.enum(['wave', 'moov', 'mtn', 'orange']),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database not available');
      }

      try {
        // Récupérer le paiement de la base de données
        const payment = await db
          .select()
          .from(paymentTransactions)
          .where(eq(paymentTransactions.transactionId, input.transactionId))
          .limit(1);

        if (!payment.length) {
          return {
            success: false,
            status: 'not_found',
            message: 'Payment not found',
          };
        }

        const paymentData = payment[0];

        // En production, vous vérifieriez le statut auprès du fournisseur
        return {
          success: true,
          status: paymentData.status,
          amount: paymentData.amount,
          message: `Statut du paiement: ${paymentData.status}`,
        };
      } catch (error) {
        console.error('[Mobile Money] Status check error:', error);
        throw error;
      }
    }),

  /**
   * Confirmer un paiement (simulé)
   */
  confirmPayment: publicProcedure
    .input(z.object({
      transactionId: z.string(),
      provider: z.enum(['wave', 'moov', 'mtn', 'orange']),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database not available');
      }

      try {
        // Récupérer le paiement
        const payment = await db
          .select()
          .from(paymentTransactions)
          .where(eq(paymentTransactions.transactionId, input.transactionId))
          .limit(1);

        if (!payment.length) {
          throw new Error('Payment not found');
        }

        const paymentData = payment[0];

        // Mettre à jour le statut du paiement à "completed"
        await db
          .update(paymentTransactions)
          .set({ status: 'completed' })
          .where(eq(paymentTransactions.transactionId, input.transactionId));

        // Mettre à jour le statut de la commande à "confirmed"
        await db
          .update(orders)
          .set({ status: 'confirmed' })
          .where(eq(orders.id, paymentData.orderId));

        return {
          success: true,
          message: 'Payment confirmed successfully',
          transactionId: input.transactionId,
        };
      } catch (error) {
        console.error('[Mobile Money] Confirmation error:', error);
        throw error;
      }
    }),

  /**
   * Gérer les webhooks de paiement
   */
  handleWebhook: publicProcedure
    .input(z.object({
      transactionId: z.string(),
      status: z.enum(['completed', 'failed', 'pending']),
      provider: z.enum(['wave', 'moov', 'mtn', 'orange']),
      signature: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database not available');
      }

      try {
        // Vérifier la signature du webhook (en production)
        // const isValid = verifyWebhookSignature(input, secretKey);
        // if (!isValid) throw new Error('Invalid webhook signature');

        // Récupérer le paiement
        const payment = await db
          .select()
          .from(paymentTransactions)
          .where(eq(paymentTransactions.transactionId, input.transactionId))
          .limit(1);

        if (!payment.length) {
          return { success: false, message: 'Payment not found' };
        }

        const paymentData = payment[0];

        // Mettre à jour le statut du paiement
        await db
          .update(paymentTransactions)
          .set({ status: input.status })
          .where(eq(paymentTransactions.transactionId, input.transactionId));

        // Si le paiement est complété, mettre à jour la commande
        if (input.status === 'completed') {
          await db
            .update(orders)
            .set({ status: 'confirmed' })
            .where(eq(orders.id, paymentData.orderId));
        }

        // Si le paiement a échoué, mettre à jour la commande
        if (input.status === 'failed') {
          await db
            .update(orders)
            .set({ status: 'cancelled' })
            .where(eq(orders.id, paymentData.orderId));
        }

        return {
          success: true,
          message: 'Webhook processed successfully',
        };
      } catch (error) {
        console.error('[Mobile Money] Webhook error:', error);
        return { success: false, message: 'Webhook processing failed' };
      }
    }),
});
