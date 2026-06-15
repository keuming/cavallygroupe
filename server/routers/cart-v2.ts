import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { carts, cartItems, products, discounts } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const cartRouter = router({
  // Get or create cart for user
  getCart: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    let cart = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, ctx.user.id))
      .limit(1);

    if (cart.length === 0) {
      const result = await db.insert(carts).values({
        userId: ctx.user.id,
        status: "active",
      });

      cart = await db
        .select()
        .from(carts)
        .where(eq(carts.userId, ctx.user.id))
        .limit(1);
    }

    const items = await db
      .select({
        id: cartItems.id,
        cartId: cartItems.cartId,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        product: {
          id: products.id,
          title: products.title,
          price: products.price,
          coverImageUrl: products.coverImageUrl,
        },
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.cartId, cart[0].id));

    return {
      ...cart[0],
      items,
    };
  }),

  // Add item to cart
  add: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        quantity: z.number().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get or create cart
      let cart = await db
        .select()
        .from(carts)
        .where(eq(carts.userId, ctx.user.id))
        .limit(1);

      if (cart.length === 0) {
        await db.insert(carts).values({
          userId: ctx.user.id,
          status: "active",
        });
        cart = await db
          .select()
          .from(carts)
          .where(eq(carts.userId, ctx.user.id))
          .limit(1);
      }

      // Check if item already in cart
      const existing = await db
        .select()
        .from(cartItems)
        .where(
          and(
            eq(cartItems.cartId, cart[0].id),
            eq(cartItems.productId, input.productId)
          )
        );

      if (existing.length > 0) {
        // Update quantity
        await db
          .update(cartItems)
          .set({ quantity: existing[0].quantity + input.quantity })
          .where(eq(cartItems.id, existing[0].id));
      } else {
        // Add new item
        await db.insert(cartItems).values({
          cartId: cart[0].id,
          userId: ctx.user.id,
          productId: input.productId,
          quantity: input.quantity,
        });
      }

      // Recalculate cart totals
      await updateCartTotals(db, cart[0].id);

      return { success: true };
    }),

  // Update item quantity
  updateItem: protectedProcedure
    .input(
      z.object({
        cartItemId: z.number(),
        quantity: z.number().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      if (input.quantity === 0) {
        await db.delete(cartItems).where(eq(cartItems.id, input.cartItemId));
      } else {
        await db
          .update(cartItems)
          .set({ quantity: input.quantity })
          .where(eq(cartItems.id, input.cartItemId));
      }

      // Get cart ID and recalculate
      const item = await db
        .select()
        .from(cartItems)
        .where(eq(cartItems.id, input.cartItemId));

      if (item.length > 0) {
        await updateCartTotals(db, item[0].cartId);
      }

      return { success: true };
    }),

  // Remove item from cart
  removeItem: protectedProcedure
    .input(z.object({ cartItemId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const item = await db
        .select()
        .from(cartItems)
        .where(eq(cartItems.id, input.cartItemId));

      if (item.length > 0) {
        await db.delete(cartItems).where(eq(cartItems.id, input.cartItemId));
        await updateCartTotals(db, item[0].cartId);
      }

      return { success: true };
    }),

  // Apply discount code
  applyDiscount: protectedProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const discount = await db
        .select()
        .from(discounts)
        .where(eq(discounts.code, input.code))
        .limit(1);

      if (discount.length === 0) {
        throw new Error("Code de réduction invalide");
      }

      const cart = await db
        .select()
        .from(carts)
        .where(eq(carts.userId, ctx.user.id))
        .limit(1);

      if (cart.length === 0) {
        throw new Error("Panier non trouvé");
      }

      // Update cart with discount
      await db
        .update(carts)
        .set({ discountCode: input.code })
        .where(eq(carts.id, cart[0].id));

      await updateCartTotals(db, cart[0].id);

      return { success: true, discount: discount[0] };
    }),

  // Remove discount
  removeDiscount: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const cart = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, ctx.user.id))
      .limit(1);

    if (cart.length > 0) {
      await db
        .update(carts)
        .set({ discountCode: null })
        .where(eq(carts.id, cart[0].id));

      await updateCartTotals(db, cart[0].id);
    }

    return { success: true };
  }),

  // Clear cart
  clearCart: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const cart = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, ctx.user.id))
      .limit(1);

    if (cart.length > 0) {
      await db.delete(cartItems).where(eq(cartItems.cartId, cart[0].id));
      await db
        .update(carts)
        .set({
          subtotal: "0",
          discountAmount: "0",
          tax: "0",
          total: "0",
          discountCode: null,
        })
        .where(eq(carts.id, cart[0].id));
    }

    return { success: true };
  }),
});

// Helper function to update cart totals
async function updateCartTotals(db: any, cartId: number) {
  const items = await db
    .select({
      quantity: cartItems.quantity,
      price: products.price,
    })
    .from(cartItems)
    .leftJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartId, cartId));

  let subtotal = 0;
  items.forEach((item: any) => {
    if (item.price) {
      subtotal += Number(item.price) * item.quantity;
    }
  });

  const cart = await db
    .select()
    .from(carts)
    .where(eq(carts.id, cartId))
    .limit(1);

  let discountAmount = 0;
  if (cart[0].discountCode) {
    const discount = await db
      .select()
      .from(discounts)
      .where(eq(discounts.code, cart[0].discountCode))
      .limit(1);

    if (discount.length > 0) {
      if (discount[0].type === "percentage") {
        discountAmount = (subtotal * Number(discount[0].value)) / 100;
      } else {
        discountAmount = Number(discount[0].value);
      }
    }
  }

  const taxAmount = (subtotal - discountAmount) * 0.18; // 18% VAT
  const total = subtotal - discountAmount + taxAmount;

  await db
    .update(carts)
    .set({
      subtotal: subtotal.toString(),
      discountAmount: discountAmount.toString(),
      tax: taxAmount.toString(),
      total: total.toString(),
    })
    .where(eq(carts.id, cartId));
}
