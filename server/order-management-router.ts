import { router, adminProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { orders } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { sendStatusUpdateEmail } from "./email-service";
import { sendSMS } from "./sms-service";
import { isValidTransition, validateOrderBeforeConfirmation } from "./order-status-manager";

type OrderStatus = "pending" | "confirmed" | "in_transit" | "delivered" | "cancelled";

const orderStatusSchema = z.enum(["pending", "confirmed", "in_transit", "delivered", "cancelled"]);
const notificationChannelSchema = z.enum(["email", "sms", "whatsapp"]);

/**
 * Internal function to update order status
 * This is used by all mutations to avoid createCaller issues
 */
async function updateOrderStatusInternal(input: {
  orderId: number;
  status: OrderStatus;
  notificationChannel: "email" | "sms" | "whatsapp";
  courierName?: string;
  courierPhone?: string;
  estimatedDeliveryDate?: string;
}) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  
  // Update order status in database
  await database
    .update(orders)
    .set({
      status: input.status,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, input.orderId));

  // Get updated order
  const updatedOrders = await database.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
  if (!updatedOrders || updatedOrders.length === 0) {
    throw new Error("Failed to update order status");
  }

  const order = updatedOrders[0];

  // Map status to French label
  const statusLabels: Record<OrderStatus, string> = {
    pending: "En Attente",
    confirmed: "Confirmée",
    in_transit: "En Cours de Livraison",
    delivered: "Livrée",
    cancelled: "Annulée",
  };

  const statusLabel = statusLabels[input.status as OrderStatus];

  // Send notification based on channel
  if (input.notificationChannel === "email" && order.customerEmail) {
    await sendStatusUpdateEmail({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      status: input.status,
      statusLabel,
      estimatedDeliveryDate: input.estimatedDeliveryDate,
      courierName: input.courierName,
      courierPhone: input.courierPhone,
    });
  } else if (input.notificationChannel === "sms") {
    const smsMessage = `Bonjour ${order.customerName}, votre commande ${order.orderNumber} est ${statusLabel.toLowerCase()}. Merci de votre confiance!`;
    if (order.customerPhone) {
      await sendSMS(order.customerPhone, smsMessage, order.id, input.status);
    }
  } else if (input.notificationChannel === "whatsapp") {
    const whatsappMessage = `Bonjour ${order.customerName},\n\nVotre commande ${order.orderNumber} est maintenant ${statusLabel.toLowerCase()}.\n\n${input.courierName ? `Livreur: ${input.courierName}` : ""}\n${input.courierPhone ? `Téléphone: ${input.courierPhone}` : ""}\n${input.estimatedDeliveryDate ? `Livraison estimée: ${input.estimatedDeliveryDate}` : ""}\n\nMerci de votre confiance!`;
    console.log("[WhatsApp] Message to send:", {
      to: order.customerPhone,
      message: whatsappMessage,
    });
  }

  return {
    success: true,
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status as OrderStatus,
      updatedAt: order.updatedAt,
    },
  };
}

export const orderManagementRouter = router({
  /**
   * Get all orders for admin dashboard
   */
  getAllOrders: adminProcedure.query(async () => {
    try {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const allOrders = await database.select().from(orders);
      return allOrders;
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw new Error("Failed to fetch orders");
    }
  }),

  /**
   * Get single order details
   */
  getOrder: adminProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ input }: any) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        const order = await database.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
        if (!order || order.length === 0) {
          throw new Error("Order not found");
        }
        
        return order[0];
      } catch (error) {
        console.error("Error fetching order:", error);
        throw new Error("Failed to fetch order");
      }
    }),

  /**
   * Update order status and send notification
   */
  updateOrderStatus: adminProcedure
    .input(
      z.object({
        orderId: z.number(),
        status: orderStatusSchema,
        notificationChannel: notificationChannelSchema,
        courierName: z.string().optional(),
        courierPhone: z.string().optional(),
        estimatedDeliveryDate: z.string().optional(),
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        return await updateOrderStatusInternal(input);
      } catch (error) {
        console.error("Error updating order status:", error);
        throw new Error("Failed to update order status");
      }
    }),

  /**
   * Accept order (Confirmed status)
   */
  acceptOrder: adminProcedure
    .input(
      z.object({
        orderId: z.number(),
        notificationChannel: notificationChannelSchema,
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        return await updateOrderStatusInternal({
          orderId: input.orderId,
          status: "confirmed",
          notificationChannel: input.notificationChannel,
        });
      } catch (error) {
        console.error("Error accepting order:", error);
        throw new Error("Failed to accept order");
      }
    }),

  /**
   * Reject order (Cancel status)
   */
  rejectOrder: adminProcedure
    .input(
      z.object({
        orderId: z.number(),
        notificationChannel: notificationChannelSchema,
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        // Update order status to cancelled
        await database
          .update(orders)
          .set({
            status: "cancelled",
            updatedAt: new Date(),
          })
          .where(eq(orders.id, input.orderId));

        // Get updated order
        const updatedOrders = await database.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
        if (!updatedOrders || updatedOrders.length === 0) {
          throw new Error("Failed to reject order");
        }

        const order = updatedOrders[0];

        // Send rejection notification
        if (input.notificationChannel === "email" && order.customerEmail) {
          await sendStatusUpdateEmail({
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            status: "cancelled",
            statusLabel: "Annulée",
          });
        } else if (input.notificationChannel === "sms") {
          const smsMessage = `Bonjour ${order.customerName}, votre commande ${order.orderNumber} a été annulée. ${input.reason ? `Raison: ${input.reason}` : ""} Veuillez nous contacter pour plus d'informations.`;
          if (order.customerPhone) {
            await sendSMS(order.customerPhone, smsMessage, order.id, "cancelled");
          }
        }

        return {
          success: true,
          message: "Order cancelled successfully",
        };
      } catch (error) {
        console.error("Error rejecting order:", error);
        throw new Error("Failed to reject order");
      }
    }),

  /**
   * Mark order as in transit
   */
  markAsInTransit: adminProcedure
    .input(
      z.object({
        orderId: z.number(),
        notificationChannel: notificationChannelSchema,
        courierName: z.string(),
        courierPhone: z.string(),
        estimatedDeliveryDate: z.string().optional(),
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        return await updateOrderStatusInternal({
          orderId: input.orderId,
          status: "in_transit",
          notificationChannel: input.notificationChannel,
          courierName: input.courierName,
          courierPhone: input.courierPhone,
          estimatedDeliveryDate: input.estimatedDeliveryDate,
        });
      } catch (error) {
        console.error("Error marking order as in transit:", error);
        throw new Error("Failed to mark order as in transit");
      }
    }),

  /**
   * Mark order as delivered
   */
  markAsDelivered: adminProcedure
    .input(
      z.object({
        orderId: z.number(),
        notificationChannel: notificationChannelSchema,
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        return await updateOrderStatusInternal({
          orderId: input.orderId,
          status: "delivered",
          notificationChannel: input.notificationChannel,
        });
      } catch (error) {
        console.error("Error marking order as delivered:", error);
        throw new Error("Failed to mark order as delivered");
      }
    }),

  /**
   * Get order statistics
   */
  getOrderStats: adminProcedure.query(async () => {
    try {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const allOrders = await database.select().from(orders);

      const stats = {
        total: allOrders.length,
        pending: allOrders.filter((o: any) => o.status === "pending").length,
        confirmed: allOrders.filter((o: any) => o.status === "confirmed").length,
        inTransit: allOrders.filter((o: any) => o.status === "in_transit").length,
        delivered: allOrders.filter((o: any) => o.status === "delivered").length,
        cancelled: allOrders.filter((o: any) => o.status === "cancelled").length,
        totalRevenue: allOrders.reduce((sum: number, o: any) => sum + parseFloat(o.totalAmount), 0),
      };

      return stats;
    } catch (error) {
      console.error("Error fetching order stats:", error);
      throw new Error("Failed to fetch order statistics");
    }
  }),
});
