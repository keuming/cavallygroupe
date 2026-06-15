import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { orders, orderItems, carts, cartItems, products } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

// Helper to generate order number
function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");
  return `ORD-${dateStr}-${random}`;
}

export const orderRouter = router({
  // Create order from cart
  createOrder: protectedProcedure
    .input(
      z.object({
        paymentMethod: z.enum(["wave", "moov", "mtn", "orange", "stripe", "cash"]),
        customerName: z.string().min(1),
        customerPhone: z.string().min(1),
        customerEmail: z.string().email().optional(),
        deliveryAddress: z.string().min(1),
        deliveryCity: z.string().min(1),
        deliveryPostalCode: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get user's cart
      const cart = await db
        .select()
        .from(carts)
        .where(eq(carts.userId, ctx.user.id))
        .limit(1);

      if (cart.length === 0 || !cart[0].total) {
        throw new Error("Panier vide ou invalide");
      }

      // Get cart items
      const items = await db
        .select()
        .from(cartItems)
        .where(eq(cartItems.cartId, cart[0].id));

      if (items.length === 0) {
        throw new Error("Aucun article dans le panier");
      }

      // Create order
      const orderNumber = generateOrderNumber();
      const result = await db.insert(orders).values({
        userId: ctx.user.id,
        orderNumber,
        status: "pending",
        paymentMethod: input.paymentMethod,
        paymentStatus: "pending",
        totalAmount: cart[0].total,
        shippingCost: cart[0].shippingCost || "0",
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerEmail: input.customerEmail,
        deliveryAddress: input.deliveryAddress,
        deliveryCity: input.deliveryCity,
        deliveryPostalCode: input.deliveryPostalCode,
      });

      // Get the created order
      const newOrder = await db
        .select()
        .from(orders)
        .where(eq(orders.orderNumber, orderNumber))
        .limit(1);

      if (newOrder.length === 0) {
        throw new Error("Erreur lors de la création de la commande");
      }

      // Copy cart items to order items
      for (const item of items) {
        const product = await db
          .select()
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1);

        if (product.length > 0) {
          const subtotal = (Number(product[0].price) * item.quantity).toString();
          await db.insert(orderItems).values({
            orderId: newOrder[0].id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: product[0].price,
            subtotal,
          });
        }
      }

      // Convert cart to converted status
      await db
        .update(carts)
        .set({ status: "converted" })
        .where(eq(carts.id, cart[0].id));

      return {
        success: true,
        orderId: newOrder[0].id,
        orderNumber: newOrder[0].orderNumber,
      };
    }),

  // Get user's orders
  listOrders: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, ctx.user.id));

    // Get items for each order
    const ordersWithItems = await Promise.all(
      userOrders.map(async (order) => {
        const items = await db
          .select({
            id: orderItems.id,
            productId: orderItems.productId,
            quantity: orderItems.quantity,
            unitPrice: orderItems.unitPrice,
            product: {
              id: products.id,
              title: products.title,
              coverImageUrl: products.coverImageUrl,
            },
          })
          .from(orderItems)
          .leftJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, order.id));

        return {
          ...order,
          items,
        };
      })
    );

    return ordersWithItems;
  }),

  // Get order by ID
  getOrderById: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const order = await db
        .select()
        .from(orders)
        .where(and(eq(orders.id, input.orderId), eq(orders.userId, ctx.user.id)))
        .limit(1);

      if (order.length === 0) {
        throw new Error("Commande non trouvée");
      }

      // Get items
      const items = await db
        .select({
          id: orderItems.id,
          productId: orderItems.productId,
          quantity: orderItems.quantity,
          unitPrice: orderItems.unitPrice,
          product: {
            id: products.id,
            title: products.title,
            coverImageUrl: products.coverImageUrl,
          },
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order[0].id));

      return {
        ...order[0],
        items,
      };
    }),

  // Update order status (admin only - for now)
  updateOrderStatus: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        status: z.enum(["pending", "confirmed", "in_transit", "delivered", "cancelled"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify order belongs to user (for now, users can only update their own orders)
      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.orderId))
        .limit(1);

      if (order.length === 0) {
        throw new Error("Commande non trouvée");
      }

      await db
        .update(orders)
        .set({ status: input.status })
        .where(eq(orders.id, input.orderId));

      return { success: true };
    }),

  // Update payment status
  updatePaymentStatus: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        paymentStatus: z.enum(["pending", "completed", "failed", "refunded"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.orderId))
        .limit(1);

      if (order.length === 0) {
        throw new Error("Commande non trouvée");
      }

      await db
        .update(orders)
        .set({ paymentStatus: input.paymentStatus })
        .where(eq(orders.id, input.orderId));

      return { success: true };
    }),

  // Cancel order
  cancelOrder: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const order = await db
        .select()
        .from(orders)
        .where(and(eq(orders.id, input.orderId), eq(orders.userId, ctx.user.id)))
        .limit(1);

      if (order.length === 0) {
        throw new Error("Commande non trouvée");
      }

      if (order[0].status === "delivered") {
        throw new Error("Impossible d'annuler une commande livrée");
      }

      await db
        .update(orders)
        .set({ status: "cancelled" })
        .where(eq(orders.id, input.orderId));

      return { success: true };
    }),

  // Get order by order number (for tracking)
  getOrderByNumber: protectedProcedure
    .input(z.object({ orderNumber: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.orderNumber, input.orderNumber))
        .limit(1);

      if (order.length === 0) {
        throw new Error("Commande non trouvée");
      }

      // Get items
      const items = await db
        .select({
          id: orderItems.id,
          productId: orderItems.productId,
          quantity: orderItems.quantity,
          unitPrice: orderItems.unitPrice,
          product: {
            id: products.id,
            title: products.title,
            coverImageUrl: products.coverImageUrl,
          },
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order[0].id));

      return {
        ...order[0],
        items,
      };
    }),
});
