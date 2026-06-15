import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { paymentTransactions, orders } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const paymentRouter = router({
  // Initiate payment for an order
  initiatePayment: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        paymentMethod: z.enum(["wave", "moov", "mtn", "orange", "stripe", "cash"]),
        phoneNumber: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get order
      const order = await db
        .select()
        .from(orders)
        .where(and(eq(orders.id, input.orderId), eq(orders.userId, ctx.user.id)))
        .limit(1);

      if (order.length === 0) {
        throw new Error("Commande non trouvée");
      }

      // Mobile money methods require phone number
      if (["wave", "moov", "mtn", "orange"].includes(input.paymentMethod)) {
        if (!input.phoneNumber) {
          throw new Error("Le numéro de téléphone est requis pour les paiements mobiles");
        }
      }

      // Create payment transaction
      const result = await db.insert(paymentTransactions).values({
        orderId: input.orderId,
        paymentMethod: input.paymentMethod,
        amount: order[0].totalAmount,
        status: "pending",
      });

      // Get the created transaction
      const transaction = await db
        .select()
        .from(paymentTransactions)
        .where(eq(paymentTransactions.orderId, input.orderId))
        .orderBy(paymentTransactions.id)
        .limit(1);

      if (transaction.length === 0) {
        throw new Error("Erreur lors de la création de la transaction");
      }

      // Here you would typically call the payment provider's API
      // For now, we'll return a mock response
      return {
        success: true,
        transactionId: transaction[0].id,
        paymentMethod: input.paymentMethod,
        amount: order[0].totalAmount,
        // Payment provider would return additional data here
        // e.g., payment URL, QR code, etc.
      };
    }),

  // Get payment status
  getPaymentStatus: protectedProcedure
    .input(z.object({ transactionId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const transaction = await db
        .select()
        .from(paymentTransactions)
        .where(eq(paymentTransactions.id, input.transactionId))
        .limit(1);

      if (transaction.length === 0) {
        throw new Error("Transaction non trouvée");
      }

      // Verify user owns this transaction
      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.id, transaction[0].orderId))
        .limit(1);

      if (order.length === 0 || order[0].userId !== ctx.user.id) {
        throw new Error("Accès refusé");
      }

      return {
        transactionId: transaction[0].id,
        orderId: transaction[0].orderId,
        paymentMethod: transaction[0].paymentMethod,
        amount: transaction[0].amount,
        status: transaction[0].status,
        createdAt: transaction[0].createdAt,
      };
    }),

  // Update payment status (webhook callback)
  updatePaymentStatus: protectedProcedure
    .input(
      z.object({
        transactionId: z.number(),
        status: z.enum(["pending", "completed", "failed", "refunded"]),
        externalTransactionId: z.string().optional(),
        errorMessage: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const transaction = await db
        .select()
        .from(paymentTransactions)
        .where(eq(paymentTransactions.id, input.transactionId))
        .limit(1);

      if (transaction.length === 0) {
        throw new Error("Transaction non trouvée");
      }

      // Verify user owns this transaction
      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.id, transaction[0].orderId))
        .limit(1);

      if (order.length === 0 || order[0].userId !== ctx.user.id) {
        throw new Error("Accès refusé");
      }

      // Update transaction
      await db
        .update(paymentTransactions)
        .set({
          status: input.status,
          transactionId: input.externalTransactionId,
          errorMessage: input.errorMessage,
        })
        .where(eq(paymentTransactions.id, input.transactionId));

      // If payment completed, update order payment status
      if (input.status === "completed") {
        await db
          .update(orders)
          .set({ paymentStatus: "completed" })
          .where(eq(orders.id, transaction[0].orderId));
      } else if (input.status === "failed") {
        await db
          .update(orders)
          .set({ paymentStatus: "failed" })
          .where(eq(orders.id, transaction[0].orderId));
      }

      return { success: true };
    }),

  // Get order payment transactions
  getOrderTransactions: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify user owns this order
      const order = await db
        .select()
        .from(orders)
        .where(and(eq(orders.id, input.orderId), eq(orders.userId, ctx.user.id)))
        .limit(1);

      if (order.length === 0) {
        throw new Error("Commande non trouvée");
      }

      const transactions = await db
        .select()
        .from(paymentTransactions)
        .where(eq(paymentTransactions.orderId, input.orderId));

      return transactions;
    }),

  // Retry payment
  retryPayment: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        paymentMethod: z.enum(["wave", "moov", "mtn", "orange", "stripe", "cash"]),
        phoneNumber: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get order
      const order = await db
        .select()
        .from(orders)
        .where(and(eq(orders.id, input.orderId), eq(orders.userId, ctx.user.id)))
        .limit(1);

      if (order.length === 0) {
        throw new Error("Commande non trouvée");
      }

      // Mobile money methods require phone number
      if (["wave", "moov", "mtn", "orange"].includes(input.paymentMethod)) {
        if (!input.phoneNumber) {
          throw new Error("Le numéro de téléphone est requis pour les paiements mobiles");
        }
      }

      // Create new payment transaction
      const result = await db.insert(paymentTransactions).values({
        orderId: input.orderId,
        paymentMethod: input.paymentMethod,
        amount: order[0].totalAmount,
        status: "pending",
      });

      // Get the created transaction
      const transaction = await db
        .select()
        .from(paymentTransactions)
        .where(eq(paymentTransactions.orderId, input.orderId))
        .orderBy(paymentTransactions.id)
        .limit(1);

      if (transaction.length === 0) {
        throw new Error("Erreur lors de la création de la transaction");
      }

      return {
        success: true,
        transactionId: transaction[0].id,
        paymentMethod: input.paymentMethod,
        amount: order[0].totalAmount,
      };
    }),

  // Refund payment
  refundPayment: protectedProcedure
    .input(z.object({ transactionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const transaction = await db
        .select()
        .from(paymentTransactions)
        .where(eq(paymentTransactions.id, input.transactionId))
        .limit(1);

      if (transaction.length === 0) {
        throw new Error("Transaction non trouvée");
      }

      // Verify user owns this transaction
      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.id, transaction[0].orderId))
        .limit(1);

      if (order.length === 0 || order[0].userId !== ctx.user.id) {
        throw new Error("Accès refusé");
      }

      if (transaction[0].status !== "completed") {
        throw new Error("Seules les transactions complétées peuvent être remboursées");
      }

      // Update transaction status to refunded
      await db
        .update(paymentTransactions)
        .set({ status: "refunded" })
        .where(eq(paymentTransactions.id, input.transactionId));

      // Update order payment status
      await db
        .update(orders)
        .set({ paymentStatus: "refunded" })
        .where(eq(orders.id, transaction[0].orderId));

      return { success: true };
    }),

  // Get payment methods available
  getPaymentMethods: protectedProcedure.query(async ({ ctx }) => {
    return [
      {
        id: "wave",
        name: "Wave Money",
        description: "Paiement par portefeuille numérique Wave",
        icon: "wave",
        requiresPhone: true,
        countries: ["CI", "SN", "ML", "BJ", "TG"],
      },
      {
        id: "moov",
        name: "Moov Money",
        description: "Paiement par portefeuille numérique Moov",
        icon: "moov",
        requiresPhone: true,
        countries: ["CI", "BF", "TG", "BJ"],
      },
      {
        id: "mtn",
        name: "MTN Money",
        description: "Paiement par portefeuille numérique MTN",
        icon: "mtn",
        requiresPhone: true,
        countries: ["CI", "BF", "CM", "GH"],
      },
      {
        id: "orange",
        name: "Orange Money",
        description: "Paiement par portefeuille numérique Orange",
        icon: "orange",
        requiresPhone: true,
        countries: ["CI", "SN", "ML", "BF", "CM"],
      },
      {
        id: "stripe",
        name: "Carte Bancaire",
        description: "Paiement par carte bancaire Visa/Mastercard",
        icon: "stripe",
        requiresPhone: false,
        countries: ["*"],
      },
      {
        id: "cash",
        name: "Paiement à la Livraison",
        description: "Paiement en espèces lors de la livraison",
        icon: "cash",
        requiresPhone: false,
        countries: ["CI"],
      },
    ];
  }),
});
