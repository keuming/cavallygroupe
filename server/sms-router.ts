import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import SMSService, { SMS_TEMPLATES } from "./sms-service";
import { getOrderById, getOrderTracking } from "./db";

// Initialize SMS Service with mock provider for now
const smsService = new SMSService({
  provider: process.env.SMS_PROVIDER as 'twilio' | 'vonage' | 'africastalking' | 'mock' || 'mock',
  apiKey: process.env.SMS_API_KEY,
  apiSecret: process.env.SMS_API_SECRET,
  accountSid: process.env.SMS_ACCOUNT_SID,
  authToken: process.env.SMS_AUTH_TOKEN,
  senderName: 'Cavaly',
});

export const smsRouter = router({
  // Send SMS notification for order status change (admin only)
  notifyStatusChange: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        status: z.enum([
          'pending',
          'confirmed',
          'preparing',
          'in_transit',
          'out_for_delivery',
          'delivered',
          'cancelled',
        ]),
        courierPhone: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Only admins can send SMS notifications
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized: Only admins can send SMS notifications');
      }

      try {
        const order = await getOrderById(input.orderId);
        if (!order || !order[0]) {
          throw new Error('Order not found');
        }

        const orderData = order[0];
        const phoneNumber = orderData.customerPhone;

        if (!phoneNumber) {
          throw new Error('Customer phone number not found');
        }

        // Get the appropriate message template
        const messageTemplate = SMS_TEMPLATES[input.status as keyof typeof SMS_TEMPLATES];
        if (!messageTemplate) {
          throw new Error('Invalid status');
        }

        const message =
          input.status === 'out_for_delivery'
            ? messageTemplate(orderData.orderNumber, input.courierPhone)
            : messageTemplate(orderData.orderNumber);

        // Send SMS
        const result = await smsService.sendSMS({
          to: phoneNumber,
          message,
          orderId: input.orderId,
          status: input.status,
        });

        if (!result.success) {
          throw new Error(result.error || 'Failed to send SMS');
        }

        return {
          success: true,
          messageId: result.messageId,
          phoneNumber,
          message,
        };
      } catch (error) {
        console.error('[SMS Router] Error sending SMS:', error);
        throw error;
      }
    }),

  // Get SMS notification history for an order
  getHistory: publicProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ input }) => {
      try {
        // This would query the SMS history from database if we had a table for it
        // For now, return empty array
        return [];
      } catch (error) {
        console.error('[SMS Router] Error getting SMS history:', error);
        throw error;
      }
    }),

  // Test SMS notification (admin only)
  sendTest: protectedProcedure
    .input(z.object({ phoneNumber: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error('Unauthorized: Only admins can send test SMS');
      }

      try {
        const result = await smsService.sendSMS({
          to: input.phoneNumber,
          message: 'Cavally Livres: Ceci est un message de test. Votre numéro a été confirmé!',
          orderId: 0,
          status: 'test',
        });

        if (!result.success) {
          throw new Error(result.error || 'Failed to send test SMS');
        }

        return {
          success: true,
          messageId: result.messageId,
          message: 'SMS de test envoyé avec succès!',
        };
      } catch (error) {
        console.error('[SMS Router] Error sending test SMS:', error);
        throw error;
      }
    }),
});
