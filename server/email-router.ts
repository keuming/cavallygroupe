import { router, protectedProcedure, publicProcedure } from './_core/trpc';
import { z } from 'zod';
import {
  sendOrderConfirmationEmail,
  sendStatusUpdateEmail,
  sendPaymentConfirmationEmail,
} from './email-service';
import { getOrderById, getOrderItems } from './db';

export const emailRouter = router({
  /**
   * Send order confirmation email
   * Called automatically after order creation
   */
  sendOrderConfirmation: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        const order = await getOrderById(input.orderId);
        if (!order || order.length === 0) {
          throw new Error('Order not found');
        }

        const orderData = order[0];
        const items = await getOrderItems(input.orderId);

        const success = await sendOrderConfirmationEmail({
          orderNumber: orderData.orderNumber,
          customerName: orderData.customerName,
          customerEmail: (orderData.customerEmail || '') as string,
          items: items || [],
          totalAmount: orderData.totalAmount,
          shippingCost: (orderData.shippingCost || '0') as string,
          deliveryAddress: (orderData.deliveryAddress || '') as string,
          deliveryCity: orderData.deliveryCity,
          deliveryPostalCode: (orderData.deliveryPostalCode || undefined) as string | undefined,
          paymentMethod: orderData.paymentMethod,
          trackingUrl: `${process.env.VITE_FRONTEND_URL || 'http://localhost:3000'}/order-confirmation?orderId=${input.orderId}`,
        });

        return {
          success,
          message: success ? 'Email sent successfully' : 'Failed to send email',
        };
      } catch (error) {
        console.error('[Email Router] Error:', error?.message || error);
        throw error;
        return {
          success: false,
          message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    }),

  /**
   * Send payment confirmation email
   * Called after successful payment
   */
  sendPaymentConfirmation: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        const order = await getOrderById(input.orderId);
        if (!order || order.length === 0) {
          throw new Error('Order not found');
        }

        const orderData = order[0];

        const success = await sendPaymentConfirmationEmail(
          (orderData.customerEmail || '') as string,
          orderData.customerName,
          orderData.orderNumber,
          orderData.totalAmount,
          orderData.paymentMethod
        );

        return {
          success,
          message: success ? 'Email sent successfully' : 'Failed to send email',
        };
      } catch (error) {
        console.error('[Email Router] Error sending payment confirmation:', error);
        return {
          success: false,
          message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    }),

  /**
   * Send status update email
   * Called when order status changes
   */
  sendStatusUpdate: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        status: z.string(),
        statusLabel: z.string(),
        estimatedDeliveryDate: z.string().optional(),
        courierName: z.string().optional(),
        courierPhone: z.string().optional(),
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        const order = await getOrderById(input.orderId);
        if (!order || order.length === 0) {
          throw new Error('Order not found');
        }

        const orderData = order[0];

        const success = await sendStatusUpdateEmail({
          orderNumber: orderData.orderNumber,
          customerName: orderData.customerName,
          customerEmail: (orderData.customerEmail || '') as string,
          status: input.status,
          statusLabel: input.statusLabel,
          estimatedDeliveryDate: input.estimatedDeliveryDate,
          courierName: input.courierName,
          courierPhone: input.courierPhone,
          trackingUrl: `${process.env.VITE_FRONTEND_URL || 'http://localhost:3000'}/order-confirmation?orderId=${input.orderId}`,
        });

        return {
          success,
          message: success ? 'Email sent successfully' : 'Failed to send email',
        };
      } catch (error) {
        console.error('[Email Router] Error sending status update:', error);
        return {
          success: false,
          message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    }),

  /**
   * Send bulk status update emails
   * Called for batch updates
   */
  sendBulkStatusUpdate: protectedProcedure
    .input(
      z.object({
        orderIds: z.array(z.number()),
        status: z.string(),
        statusLabel: z.string(),
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        const results = await Promise.all(
          input.orderIds.map(async (orderId: number) => {
            const order = await getOrderById(orderId);
            if (!order || order.length === 0) {
              return { orderId, success: false, reason: 'Order not found' };
            }

            const orderData = order[0];
            const success = await sendStatusUpdateEmail({
              orderNumber: orderData.orderNumber,
              customerName: orderData.customerName,
              customerEmail: (orderData.customerEmail || '') as string,
              status: input.status,
              statusLabel: input.statusLabel,
              trackingUrl: `${process.env.VITE_FRONTEND_URL || 'http://localhost:3000'}/order-confirmation?orderId=${orderId}`,
            });

            return { orderId, success };
          })
        );

        const successCount = results.filter((r) => r.success).length;
        return {
          success: successCount === input.orderIds.length,
          totalSent: input.orderIds.length,
          successCount,
          results,
        };
      } catch (error) {
        console.error('[Email Router] Error sending bulk status update:', error);
        return {
          success: false,
          message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    }),

  /**
   * Test email sending
   * For development and testing purposes
   */
  sendTestEmail: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        subject: z.string().optional(),
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        const success = await sendOrderConfirmationEmail({
          orderNumber: 'TEST-001',
          customerName: 'Test Customer',
          customerEmail: input.email,
          items: [
            {
              productId: 1,
              quantity: 2,
              unitPrice: '12500',
              subtotal: '25000',
            },
          ],
          totalAmount: '25000',
          shippingCost: '0',
          deliveryAddress: 'Test Address',
          deliveryCity: 'Test City',
          paymentMethod: 'cash',
        });

        return {
          success,
          message: success ? 'Test email sent successfully' : 'Failed to send test email',
        };
      } catch (error) {
        console.error('[Email Router] Error sending test email:', error);
        return {
          success: false,
          message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    }),
});
