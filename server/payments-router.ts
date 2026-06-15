import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from './_core/trpc';
import { MobileMoneyServiceFactory } from './mobile-money-service';
import { getDb } from './db';
import { orders, paymentTransactions } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * Schéma de validation pour l'initiation de paiement
 */
const initiatePaymentSchema = z.object({
  orderId: z.number(),
  provider: z.enum(['wave', 'moov', 'mtn', 'orange', 'stripe', 'cash']),
  phoneNumber: z.string().min(8).optional(),
});

/**
 * Schéma de validation pour la vérification du statut
 */
const checkPaymentStatusSchema = z.object({
  transactionId: z.string(),
  provider: z.enum(['wave', 'moov', 'mtn', 'orange', 'stripe', 'cash']),
});

/**
 * Routeur pour les paiements
 */
export const paymentsRouter = router({
  /**
   * Obtenir les fournisseurs de paiement disponibles
   */
  getProviders: publicProcedure.query(() => {
    return [
      {
        code: 'wave',
        name: 'Wave Money',
        color: '#0066FF',
        icon: '📱',
        description: 'Paiement via Wave Money',
        isActive: true,
      },
      {
        code: 'moov',
        name: 'Moov Money',
        color: '#FF6B00',
        icon: '💳',
        description: 'Paiement via Moov Money',
        isActive: true,
      },
      {
        code: 'mtn',
        name: 'MTN Money',
        color: '#FFCC00',
        icon: '📲',
        description: 'Paiement via MTN Money',
        isActive: true,
      },
      {
        code: 'orange',
        name: 'Orange Money',
        color: '#FF6600',
        icon: '🟠',
        description: 'Paiement via Orange Money',
        isActive: true,
      },
      {
        code: 'stripe',
        name: 'Carte Bancaire',
        color: '#635BFF',
        icon: '💳',
        description: 'Paiement par carte bancaire',
        isActive: true,
      },
      {
        code: 'cash',
        name: 'Espèces à la Livraison',
        color: '#10B981',
        icon: '💵',
        description: 'Paiement à la livraison',
        isActive: true,
      },
    ];
  }),

  /**
   * Initier un paiement mobile money
   */
  initiateMobilePayment: publicProcedure
    .input(initiatePaymentSchema)
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database not available');
      }

      try {
        // Vérifier que la commande existe
        const orderData = await db
          .select()
          .from(orders)
          .where(eq(orders.id, input.orderId))
          .limit(1);

        if (!orderData.length) {
          throw new Error('Commande non trouvée');
        }

        const order = orderData[0];

        // Valider le numéro de téléphone pour les paiements mobiles
        if (['wave', 'moov', 'mtn', 'orange'].includes(input.provider)) {
          if (!input.phoneNumber) {
            throw new Error('Le numéro de téléphone est requis');
          }
        }

        // Initier le paiement via le service approprié
        if (['wave', 'moov', 'mtn', 'orange'].includes(input.provider)) {
          const result = await MobileMoneyServiceFactory.initiatePayment({
            amount: Number(order.totalAmount),
            phoneNumber: input.phoneNumber!,
            orderId: order.orderNumber,
            customerName: order.customerName,
            description: `Paiement commande ${order.orderNumber}`,
            provider: input.provider as 'wave' | 'moov' | 'mtn' | 'orange',
          });

          if (result.success && result.transactionId) {
            // Enregistrer la transaction en base de données
            await db.insert(paymentTransactions).values({
              orderId: input.orderId,
              paymentMethod: input.provider as 'wave' | 'moov' | 'mtn' | 'orange' | 'stripe' | 'cash',
              amount: order.totalAmount,
              status: 'pending',
              transactionId: result.transactionId,
            });

            // Mettre à jour la commande avec l'ID de transaction
            await db
              .update(orders)
              .set({
                mobileMoneyTransactionId: result.transactionId,
                paymentStatus: 'pending',
              })
              .where(eq(orders.id, input.orderId));
          }

          return result;
        }

        // Pour les autres méthodes de paiement
        return {
          success: true,
          status: 'pending' as const,
          message: `Paiement ${input.provider} en cours de traitement`,
          provider: input.provider,
        };
      } catch (error) {
        console.error('[Payments] Payment initiation error:', error);
        throw error;
      }
    }),

  /**
   * Vérifier le statut d'un paiement
   */
  checkPaymentStatus: publicProcedure
    .input(checkPaymentStatusSchema)
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database not available');
      }

      try {
        // Récupérer la transaction en base de données
        const transaction = await db
          .select()
          .from(paymentTransactions)
          .where(eq(paymentTransactions.transactionId, input.transactionId))
          .limit(1);

        if (!transaction.length) {
          return {
            success: false,
            status: 'not_found',
            message: 'Transaction non trouvée',
          };
        }

        const payment = transaction[0];

        // Vérifier le statut auprès du fournisseur pour les paiements mobiles
        if (['wave', 'moov', 'mtn', 'orange'].includes(input.provider)) {
          const result = await MobileMoneyServiceFactory.checkPaymentStatus(
            input.provider as 'wave' | 'moov' | 'mtn' | 'orange',
            input.transactionId
          );

          // Mettre à jour le statut en base de données si nécessaire
          if (result.status !== payment.status) {
            await db
              .update(paymentTransactions)
              .set({ status: result.status })
              .where(eq(paymentTransactions.transactionId, input.transactionId));

            // Mettre à jour la commande si le paiement est complété
            if (result.status === 'completed') {
              await db
                .update(orders)
                .set({
                  paymentStatus: 'completed',
                  status: 'confirmed',
                })
                .where(eq(orders.id, payment.orderId));
            }
          }

          return {
            success: true,
            status: result.status,
            message: `Statut du paiement: ${result.status}`,
            amount: payment.amount,
          };
        }

        return {
          success: true,
          status: payment.status,
          message: `Statut du paiement: ${payment.status}`,
          amount: payment.amount,
        };
      } catch (error) {
        console.error('[Payments] Status check error:', error);
        throw error;
      }
    }),

  /**
   * Confirmer un paiement (pour les paiements manuels)
   */
  confirmPayment: protectedProcedure
    .input(z.object({
      transactionId: z.string(),
      provider: z.enum(['wave', 'moov', 'mtn', 'orange', 'stripe', 'cash']),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database not available');
      }

      try {
        // Récupérer la transaction
        const transaction = await db
          .select()
          .from(paymentTransactions)
          .where(eq(paymentTransactions.transactionId, input.transactionId))
          .limit(1);

        if (!transaction.length) {
          throw new Error('Transaction non trouvée');
        }

        const payment = transaction[0];

        // Mettre à jour le statut du paiement
        await db
          .update(paymentTransactions)
          .set({ status: 'completed' })
          .where(eq(paymentTransactions.transactionId, input.transactionId));

        // Mettre à jour la commande
        await db
          .update(orders)
          .set({
            paymentStatus: 'completed',
            status: 'confirmed',
          })
          .where(eq(orders.id, payment.orderId));

        return {
          success: true,
          message: 'Paiement confirmé avec succès',
          transactionId: input.transactionId,
        };
      } catch (error) {
        console.error('[Payments] Confirmation error:', error);
        throw error;
      }
    }),

  /**
   * Annuler un paiement
   */
  cancelPayment: protectedProcedure
    .input(z.object({
      transactionId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database not available');
      }

      try {
        // Récupérer la transaction
        const transaction = await db
          .select()
          .from(paymentTransactions)
          .where(eq(paymentTransactions.transactionId, input.transactionId))
          .limit(1);

        if (!transaction.length) {
          throw new Error('Transaction non trouvée');
        }

        const payment = transaction[0];

        // Mettre à jour le statut du paiement
        await db
          .update(paymentTransactions)
          .set({ status: 'failed' })
          .where(eq(paymentTransactions.transactionId, input.transactionId));

        // Mettre à jour la commande
        await db
          .update(orders)
          .set({
            paymentStatus: 'failed',
            status: 'cancelled',
          })
          .where(eq(orders.id, payment.orderId));

        return {
          success: true,
          message: 'Paiement annulé',
          transactionId: input.transactionId,
        };
      } catch (error) {
        console.error('[Payments] Cancellation error:', error);
        throw error;
      }
    }),

  /**
   * Obtenir l'historique des paiements d'une commande
   */
  getOrderPayments: publicProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database not available');
      }

      try {
        const payments = await db
          .select()
          .from(paymentTransactions)
          .where(eq(paymentTransactions.orderId, input.orderId));

        return payments;
      } catch (error) {
        console.error('[Payments] Get payments error:', error);
        throw error;
      }
    }),
});
