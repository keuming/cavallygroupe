import crypto from "crypto";
import { getDb } from "./db";
import { orders, paymentTransactions } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { sendOrderConfirmationEmail, sendStatusUpdateEmail } from "./email-service";
import { sendSMS } from "./sms-service";

/**
 * Webhook Handlers for Mobile Money Providers
 * Handles payment confirmation and status updates from Wave, Moov, MTN, and Orange Money
 */

// Wave Webhook Handler
export async function handleWaveWebhook(payload: any, signature: string, secret: string) {
  try {
    // Verify signature
    const hash = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(payload))
      .digest("hex");

    if (hash !== signature) {
      console.error("[Wave] Invalid signature");
      return { success: false, error: "Invalid signature" };
    }

    const orderId = payload.reference || payload.customer_id;
    if (!orderId) {
      console.error("[Wave] Missing order ID");
      return { success: false, error: "Missing order ID" };
    }

    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    const isSuccess = payload.status === "SUCCESSFUL";

    // Update payment transaction
    await db
      .update(paymentTransactions)
      .set({
        status: isSuccess ? "completed" : "failed",
        transactionId: payload.id,
        updatedAt: new Date(),
      })
      .where(eq(paymentTransactions.orderId, parseInt(orderId)));

    // Update order status
    if (isSuccess) {
      await db
        .update(orders)
        .set({
          status: "confirmed",
          updatedAt: new Date(),
        })
        .where(eq(orders.id, parseInt(orderId)));

      // Get order details
      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.id, parseInt(orderId)))
        .limit(1)
        .then((rows: any[]) => rows[0]);

      if (order) {
        // Send confirmation email
        await sendOrderConfirmationEmail(order);

        // Send SMS notification
        if (order.customerPhone) {
          await sendSMS(
            order.customerPhone,
            `Votre commande #${order.orderNumber} a été confirmée. Montant: ${order.totalAmount} FCFA. Merci!`,
            order.id,
            "confirmed"
          );
        }
      }
    }

    console.log(`[Wave] Webhook processed successfully for order ${orderId}`);
    return { success: true };
  } catch (error) {
    console.error("[Wave] Webhook error:", error);
    return { success: false, error: String(error) };
  }
}

// Moov Webhook Handler
export async function handleMoovWebhook(payload: any, signature: string, secret: string) {
  try {
    // Verify signature
    const hash = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(payload))
      .digest("hex");

    if (hash !== signature) {
      console.error("[Moov] Invalid signature");
      return { success: false, error: "Invalid signature" };
    }

    const orderId = payload.metadata?.order_id || payload.customer?.id;
    if (!orderId) {
      console.error("[Moov] Missing order ID");
      return { success: false, error: "Missing order ID" };
    }

    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    const isSuccess = payload.status === "SUCCESSFUL";

    // Update payment transaction
    await db
      .update(paymentTransactions)
      .set({
        status: isSuccess ? "completed" : "failed",
        transactionId: payload.id,
        updatedAt: new Date(),
      })
      .where(eq(paymentTransactions.orderId, parseInt(orderId)));

    // Update order status
    if (isSuccess) {
      await db
        .update(orders)
        .set({
          status: "confirmed",
          updatedAt: new Date(),
        })
        .where(eq(orders.id, parseInt(orderId)));

      // Get order details
      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.id, parseInt(orderId)))
        .limit(1)
        .then((rows: any[]) => rows[0]);

      if (order) {
        // Send confirmation email
        await sendOrderConfirmationEmail(order);

        // Send SMS notification
        if (order.customerPhone) {
          await sendSMS(
            order.customerPhone,
            `Votre commande #${order.orderNumber} a été confirmée. Montant: ${order.totalAmount} FCFA. Merci!`,
            order.id,
            "confirmed"
          );
        }
      }
    }

    console.log(`[Moov] Webhook processed successfully for order ${orderId}`);
    return { success: true };
  } catch (error) {
    console.error("[Moov] Webhook error:", error);
    return { success: false, error: String(error) };
  }
}

// MTN Webhook Handler
export async function handleMTNWebhook(payload: any, signature: string, secret: string) {
  try {
    // Verify signature
    const hash = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(payload))
      .digest("hex");

    if (hash !== signature) {
      console.error("[MTN] Invalid signature");
      return { success: false, error: "Invalid signature" };
    }

    const orderId = payload.externalId;
    if (!orderId) {
      console.error("[MTN] Missing order ID");
      return { success: false, error: "Missing order ID" };
    }

    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    const isSuccess = payload.status === "COMPLETED";

    // Update payment transaction
    await db
      .update(paymentTransactions)
      .set({
        status: isSuccess ? "completed" : "failed",
        transactionId: payload.transactionId,
        updatedAt: new Date(),
      })
      .where(eq(paymentTransactions.orderId, parseInt(orderId)));

    // Update order status
    if (isSuccess) {
      await db
        .update(orders)
        .set({
          status: "confirmed",
          updatedAt: new Date(),
        })
        .where(eq(orders.id, parseInt(orderId)));

      // Get order details
      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.id, parseInt(orderId)))
        .limit(1)
        .then((rows: any[]) => rows[0]);

      if (order) {
        // Send confirmation email
        await sendOrderConfirmationEmail(order);

        // Send SMS notification
        if (order.customerPhone) {
          await sendSMS(
            order.customerPhone,
            `Votre commande #${order.orderNumber} a été confirmée. Montant: ${order.totalAmount} FCFA. Merci!`,
            order.id,
            "confirmed"
          );
        }
      }
    }

    console.log(`[MTN] Webhook processed successfully for order ${orderId}`);
    return { success: true };
  } catch (error) {
    console.error("[MTN] Webhook error:", error);
    return { success: false, error: String(error) };
  }
}

// Orange Webhook Handler
export async function handleOrangeWebhook(payload: any, signature: string, secret: string) {
  try {
    // Verify signature
    const hash = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(payload))
      .digest("hex");

    if (hash !== signature) {
      console.error("[Orange] Invalid signature");
      return { success: false, error: "Invalid signature" };
    }

    const orderId = payload.reference;
    if (!orderId) {
      console.error("[Orange] Missing order ID");
      return { success: false, error: "Missing order ID" };
    }

    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    const isSuccess = payload.status === "SUCCESS";

    // Update payment transaction
    await db
      .update(paymentTransactions)
      .set({
        status: isSuccess ? "completed" : "failed",
        transactionId: payload.id,
        updatedAt: new Date(),
      })
      .where(eq(paymentTransactions.orderId, parseInt(orderId)));

    // Update order status
    if (isSuccess) {
      await db
        .update(orders)
        .set({
          status: "confirmed",
          updatedAt: new Date(),
        })
        .where(eq(orders.id, parseInt(orderId)));

      // Get order details
      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.id, parseInt(orderId)))
        .limit(1)
        .then((rows: any[]) => rows[0]);

      if (order) {
        // Send confirmation email
        await sendOrderConfirmationEmail(order);

        // Send SMS notification
        if (order.customerPhone) {
          await sendSMS(
            order.customerPhone,
            `Votre commande #${order.orderNumber} a été confirmée. Montant: ${order.totalAmount} FCFA. Merci!`,
            order.id,
            "confirmed"
          );
        }
      }
    }

    console.log(`[Orange] Webhook processed successfully for order ${orderId}`);
    return { success: true };
  } catch (error) {
    console.error("[Orange] Webhook error:", error);
    return { success: false, error: String(error) };
  }
}
