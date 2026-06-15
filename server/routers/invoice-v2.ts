import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { invoices, invoiceItems, products, orders, orderItems } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

// Helper to generate invoice number
function generateInvoiceNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");
  return `INV-${dateStr}-${random}`;
}

export const invoiceRouter = router({
  // Generate invoice from order
  generateFromOrder: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        shippingCost: z.string().optional(),
        notes: z.string().optional(),
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

      // Get order items
      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order[0].id));

      if (items.length === 0) {
        throw new Error("Aucun article dans la commande");
      }

      // Calculate totals
      let totalAmount = 0;
      items.forEach((item) => {
        totalAmount += Number(item.subtotal);
      });

      const shippingCost = input.shippingCost || "0";
      const taxAmount = ((totalAmount + Number(shippingCost)) * 0.18).toString(); // 18% VAT
      const finalTotal = (totalAmount + Number(shippingCost) + Number(taxAmount)).toString();

      // Create invoice
      const invoiceNumber = generateInvoiceNumber();
      const result = await db.insert(invoices).values({
        userId: ctx.user.id,
        supplyListId: 0, // Will be updated if needed
        invoiceNumber,
        status: "pending",
        totalAmount: finalTotal,
        shippingCost,
        taxAmount,
        notes: input.notes,
      });

      // Get the created invoice
      const newInvoice = await db
        .select()
        .from(invoices)
        .where(eq(invoices.invoiceNumber, invoiceNumber))
        .limit(1);

      if (newInvoice.length === 0) {
        throw new Error("Erreur lors de la création de la facture");
      }

      // Copy order items to invoice items
      for (const item of items) {
        await db.insert(invoiceItems).values({
          invoiceId: newInvoice[0].id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
        });
      }

      return {
        success: true,
        invoiceId: newInvoice[0].id,
        invoiceNumber: newInvoice[0].invoiceNumber,
      };
    }),

  // Get user's invoices
  listInvoices: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const userInvoices = await db
      .select()
      .from(invoices)
      .where(eq(invoices.userId, ctx.user.id));

    // Get items for each invoice
    const invoicesWithItems = await Promise.all(
      userInvoices.map(async (invoice) => {
        const items = await db
          .select({
            id: invoiceItems.id,
            productId: invoiceItems.productId,
            quantity: invoiceItems.quantity,
            unitPrice: invoiceItems.unitPrice,
            subtotal: invoiceItems.subtotal,
            product: {
              id: products.id,
              title: products.title,
              coverImageUrl: products.coverImageUrl,
            },
          })
          .from(invoiceItems)
          .leftJoin(products, eq(invoiceItems.productId, products.id))
          .where(eq(invoiceItems.invoiceId, invoice.id));

        return {
          ...invoice,
          items,
        };
      })
    );

    return invoicesWithItems;
  }),

  // Get invoice by ID
  getInvoiceById: protectedProcedure
    .input(z.object({ invoiceId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const invoice = await db
        .select()
        .from(invoices)
        .where(and(eq(invoices.id, input.invoiceId), eq(invoices.userId, ctx.user.id)))
        .limit(1);

      if (invoice.length === 0) {
        throw new Error("Facture non trouvée");
      }

      // Get items
      const items = await db
        .select({
          id: invoiceItems.id,
          productId: invoiceItems.productId,
          quantity: invoiceItems.quantity,
          unitPrice: invoiceItems.unitPrice,
          subtotal: invoiceItems.subtotal,
          product: {
            id: products.id,
            title: products.title,
            coverImageUrl: products.coverImageUrl,
          },
        })
        .from(invoiceItems)
        .leftJoin(products, eq(invoiceItems.productId, products.id))
        .where(eq(invoiceItems.invoiceId, invoice[0].id));

      return {
        ...invoice[0],
        items,
      };
    }),

  // Get invoice by invoice number
  getInvoiceByNumber: protectedProcedure
    .input(z.object({ invoiceNumber: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const invoice = await db
        .select()
        .from(invoices)
        .where(and(eq(invoices.invoiceNumber, input.invoiceNumber), eq(invoices.userId, ctx.user.id)))
        .limit(1);

      if (invoice.length === 0) {
        throw new Error("Facture non trouvée");
      }

      // Get items
      const items = await db
        .select({
          id: invoiceItems.id,
          productId: invoiceItems.productId,
          quantity: invoiceItems.quantity,
          unitPrice: invoiceItems.unitPrice,
          subtotal: invoiceItems.subtotal,
          product: {
            id: products.id,
            title: products.title,
            coverImageUrl: products.coverImageUrl,
          },
        })
        .from(invoiceItems)
        .leftJoin(products, eq(invoiceItems.productId, products.id))
        .where(eq(invoiceItems.invoiceId, invoice[0].id));

      return {
        ...invoice[0],
        items,
      };
    }),

  // Update invoice status
  updateInvoiceStatus: protectedProcedure
    .input(
      z.object({
        invoiceId: z.number(),
        status: z.enum(["draft", "pending", "paid", "cancelled"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const invoice = await db
        .select()
        .from(invoices)
        .where(and(eq(invoices.id, input.invoiceId), eq(invoices.userId, ctx.user.id)))
        .limit(1);

      if (invoice.length === 0) {
        throw new Error("Facture non trouvée");
      }

      await db
        .update(invoices)
        .set({ status: input.status })
        .where(eq(invoices.id, input.invoiceId));

      return { success: true };
    }),

  // Update invoice PDF URL (after generation)
  updateInvoicePdfUrl: protectedProcedure
    .input(
      z.object({
        invoiceId: z.number(),
        pdfUrl: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const invoice = await db
        .select()
        .from(invoices)
        .where(and(eq(invoices.id, input.invoiceId), eq(invoices.userId, ctx.user.id)))
        .limit(1);

      if (invoice.length === 0) {
        throw new Error("Facture non trouvée");
      }

      await db
        .update(invoices)
        .set({ pdfUrl: input.pdfUrl })
        .where(eq(invoices.id, input.invoiceId));

      return { success: true };
    }),

  // Cancel invoice
  cancelInvoice: protectedProcedure
    .input(z.object({ invoiceId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const invoice = await db
        .select()
        .from(invoices)
        .where(and(eq(invoices.id, input.invoiceId), eq(invoices.userId, ctx.user.id)))
        .limit(1);

      if (invoice.length === 0) {
        throw new Error("Facture non trouvée");
      }

      if (invoice[0].status === "paid") {
        throw new Error("Impossible d'annuler une facture payée");
      }

      await db
        .update(invoices)
        .set({ status: "cancelled" })
        .where(eq(invoices.id, input.invoiceId));

      return { success: true };
    }),

  // Get invoice summary (for display)
  getInvoiceSummary: protectedProcedure
    .input(z.object({ invoiceId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const invoice = await db
        .select()
        .from(invoices)
        .where(and(eq(invoices.id, input.invoiceId), eq(invoices.userId, ctx.user.id)))
        .limit(1);

      if (invoice.length === 0) {
        throw new Error("Facture non trouvée");
      }

      const items = await db
        .select()
        .from(invoiceItems)
        .where(eq(invoiceItems.invoiceId, invoice[0].id));

      let subtotal = 0;
      items.forEach((item) => {
        subtotal += Number(item.subtotal);
      });

      return {
        invoiceNumber: invoice[0].invoiceNumber,
        status: invoice[0].status,
        subtotal: subtotal.toString(),
        shippingCost: invoice[0].shippingCost,
        taxAmount: invoice[0].taxAmount,
        totalAmount: invoice[0].totalAmount,
        itemCount: items.length,
        createdAt: invoice[0].createdAt,
      };
    }),
});
