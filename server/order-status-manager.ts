import { z } from "zod";
import { getDb } from "./db";
import { orders } from "../drizzle/schema";
import { eq } from "drizzle-orm";

type OrderStatus = "pending" | "confirmed" | "in_transit" | "delivered" | "cancelled";
type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

/**
 * Defines valid state transitions for orders
 * Prevents invalid transitions like pending → delivered
 * 
 * Flux correct:
 * pending (création) → pending (après paiement) → confirmed (validation admin) → in_transit (expédition) → delivered (livraison)
 */
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"], // Reste pending après paiement, passe à confirmed après validation admin
  confirmed: ["in_transit", "cancelled"],
  in_transit: ["delivered", "cancelled"],
  delivered: [], // Final state
  cancelled: [], // Final state
};

/**
 * Validates if a transition is allowed
 */
export function isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
  const allowedTransitions = VALID_TRANSITIONS[from] || [];
  return allowedTransitions.includes(to);
}

/**
 * Updates order status with validation
 */
export async function updateOrderStatus(
  orderId: number,
  newStatus: OrderStatus,
  paymentStatus?: PaymentStatus
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  try {
    // Get current order
    const currentOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (currentOrders.length === 0) {
      return { success: false, error: "Order not found" };
    }

    const currentOrder = currentOrders[0];
    const currentStatus = currentOrder.status as OrderStatus;

    // Validate transition
    if (!isValidTransition(currentStatus, newStatus)) {
      return {
        success: false,
        error: `Invalid transition: ${currentStatus} → ${newStatus}`,
      };
    }

    // Update order
    const updateData: any = {
      status: newStatus,
      updatedAt: new Date(),
    };

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    await db.update(orders).set(updateData).where(eq(orders.id, orderId));

    // Log the transition
    console.log(`[Order ${orderId}] Status changed: ${currentStatus} → ${newStatus}`);

    return { success: true };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, error: "Failed to update order status" };
  }
}

/**
 * Marks order as paid
 * IMPORTANT: Statut reste "pending" après paiement
 * Le statut passe à "confirmed" seulement après validation admin
 */
export async function markOrderAsPaid(
  orderId: number,
  paymentMethod: "wave" | "moov" | "mtn" | "orange" | "stripe" | "cash"
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "Database not available" };

  try {
    const currentOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (currentOrders.length === 0) {
      return { success: false, error: "Order not found" };
    }

    const currentOrder = currentOrders[0];

    // Only allow payment for pending orders
    if (currentOrder.status !== "pending") {
      return {
        success: false,
        error: `Cannot pay for order with status: ${currentOrder.status}`,
      };
    }

    // Update payment status ONLY - DO NOT change order status
    // Status remains "pending" until admin confirms
    await db
      .update(orders)
      .set({
        paymentStatus: "completed",
        paymentMethod,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    console.log(`[Order ${orderId}] Payment completed via ${paymentMethod} - Status remains PENDING until admin confirmation`);

    return { success: true };
  } catch (error) {
    console.error("Error marking order as paid:", error);
    return { success: false, error: "Failed to mark order as paid" };
  }
}

/**
 * Validates order before confirmation
 */
export async function validateOrderBeforeConfirmation(
  orderId: number
): Promise<{ valid: boolean; errors: string[] }> {
  const db = await getDb();
  if (!db) return { valid: false, errors: ["Database not available"] };

  const errors: string[] = [];

  try {
    const currentOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (currentOrders.length === 0) {
      errors.push("Order not found");
      return { valid: false, errors };
    }

    const order = currentOrders[0];

    // Check status
    if (order.status !== "pending") {
      errors.push(`Order must be in pending status, current: ${order.status}`);
    }

    // Check payment status - Payment MUST be completed before confirmation
    if (order.paymentStatus !== "completed") {
      errors.push(`Payment must be completed before confirmation, current: ${order.paymentStatus}`);
    }

    // Check customer info
    if (!order.customerName) errors.push("Customer name is required");
    if (!order.customerPhone) errors.push("Customer phone is required");
    if (!order.deliveryAddress) errors.push("Delivery address is required");
    if (!order.deliveryCity) errors.push("Delivery city is required");

    return { valid: errors.length === 0, errors };
  } catch (error) {
    console.error("Error validating order:", error);
    return { valid: false, errors: ["Validation failed"] };
  }
}
