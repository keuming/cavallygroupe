import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { supplyLists, supplyListItems, invoices, invoiceItems, products } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const supplyListRouter = router({
  upload: protectedProcedure
    .input(z.object({
      fileName: z.string(),
      fileUrl: z.string(),
      fileType: z.enum(["pdf", "image", "document", "text"]),
      extractedText: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      try {
        const result = await db.insert(supplyLists).values({
          userId: ctx.user.id,
          fileName: input.fileName,
          fileUrl: input.fileUrl,
          fileType: input.fileType,
          extractedText: input.extractedText,
          status: "uploaded",
        }).returning({ id: supplyLists.id });

        return { success: true, supplyListId: result[0]?.id || 0 };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to upload supply list" });
      }
    }),

  list: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      return await db
        .select()
        .from(supplyLists)
        .where(eq(supplyLists.userId, ctx.user.id));
    }),

  getDetails: protectedProcedure
    .input(z.object({ supplyListId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;

      const list = await db
        .select()
        .from(supplyLists)
        .where(and(
          eq(supplyLists.id, input.supplyListId),
          eq(supplyLists.userId, ctx.user.id)
        ))
        .limit(1);

      if (!list.length) return null;

      const items = await db
        .select()
        .from(supplyListItems)
        .where(eq(supplyListItems.supplyListId, input.supplyListId));

      return { list: list[0], items };
    }),

  generateInvoice: protectedProcedure
    .input(z.object({
      supplyListId: z.number(),
      shippingCost: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      try {
        const items = await db
          .select()
          .from(supplyListItems)
          .where(eq(supplyListItems.supplyListId, input.supplyListId));

        if (!items.length) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "No items in supply list" });
        }

        let totalAmount = 0;
        const invoiceItemsData = [];

        for (const item of items) {
          if (item.productId && item.isMatched) {
            const product = await db
              .select()
              .from(products)
              .where(eq(products.id, item.productId))
              .limit(1);

            if (product.length > 0) {
              const unitPrice = Number(product[0].price);
              const subtotal = unitPrice * item.quantity;
              totalAmount += subtotal;

              invoiceItemsData.push({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice,
                subtotal,
              });
            }
          }
        }

        const shippingCost = input.shippingCost || 0;
        totalAmount += shippingCost;

        const invoiceNumber = `INV-${Date.now()}`;

        const invoiceResult = await db.insert(invoices).values({
          userId: ctx.user.id,
          supplyListId: input.supplyListId,
          invoiceNumber,
          status: "draft",
          totalAmount: totalAmount.toString(),
          shippingCost: shippingCost.toString(),
          taxAmount: "0",
        }).returning({ id: invoices.id });

        const invoiceId = invoiceResult[0]?.id || 0;
        for (const item of invoiceItemsData) {
          await db.insert(invoiceItems).values({
            invoiceId,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice.toString(),
            subtotal: item.subtotal.toString(),
          });
        }

        return { success: true, invoiceId, invoiceNumber };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to generate invoice" });
      }
    }),

  getInvoice: protectedProcedure
    .input(z.object({ invoiceId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;

      const invoice = await db
        .select()
        .from(invoices)
        .where(and(
          eq(invoices.id, input.invoiceId),
          eq(invoices.userId, ctx.user.id)
        ))
        .limit(1);

      if (!invoice.length) return null;

      const items = await db
        .select()
        .from(invoiceItems)
        .where(eq(invoiceItems.invoiceId, input.invoiceId));

      return { invoice: invoice[0], items };
    }),
});
