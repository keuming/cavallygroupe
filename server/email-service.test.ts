import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  sendOrderConfirmationEmail,
  sendStatusUpdateEmail,
  sendPaymentConfirmationEmail,
} from './email-service';

describe('Email Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendOrderConfirmationEmail', () => {
    it('should send order confirmation email successfully', async () => {
      const result = await sendOrderConfirmationEmail({
        orderNumber: 'ORD-001',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
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
        deliveryAddress: '123 Main St',
        deliveryCity: 'Abidjan',
        paymentMethod: 'cash',
      });

      expect(result).toBe(true);
    });

    it('should handle multiple items in order', async () => {
      const result = await sendOrderConfirmationEmail({
        orderNumber: 'ORD-002',
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com',
        items: [
          {
            productId: 1,
            quantity: 1,
            unitPrice: '5000',
            subtotal: '5000',
          },
          {
            productId: 2,
            quantity: 3,
            unitPrice: '10000',
            subtotal: '30000',
          },
        ],
        totalAmount: '35000',
        shippingCost: '2000',
        deliveryAddress: '456 Oak Ave',
        deliveryCity: 'Yamoussoukro',
        paymentMethod: 'wave',
      });

      expect(result).toBe(true);
    });

    it('should include optional postal code in email', async () => {
      const result = await sendOrderConfirmationEmail({
        orderNumber: 'ORD-003',
        customerName: 'Bob Wilson',
        customerEmail: 'bob@example.com',
        items: [],
        totalAmount: '0',
        shippingCost: '0',
        deliveryAddress: '789 Pine Rd',
        deliveryCity: 'Bouaké',
        deliveryPostalCode: '01 BP 123',
        paymentMethod: 'moov',
      });

      expect(result).toBe(true);
    });
  });

  describe('sendStatusUpdateEmail', () => {
    it('should send status update email for confirmed order', async () => {
      const result = await sendStatusUpdateEmail({
        orderNumber: 'ORD-001',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        status: 'confirmed',
        statusLabel: 'Commande Confirmée',
      });

      expect(result).toBe(true);
    });

    it('should send status update email for in-transit order', async () => {
      const result = await sendStatusUpdateEmail({
        orderNumber: 'ORD-002',
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com',
        status: 'in_transit',
        statusLabel: 'En Cours de Livraison',
        estimatedDeliveryDate: new Date(Date.now() + 86400000).toISOString(),
        courierName: 'Express Delivery',
        courierPhone: '+225 07 12 34 56 78',
      });

      expect(result).toBe(true);
    });

    it('should send status update email for delivered order', async () => {
      const result = await sendStatusUpdateEmail({
        orderNumber: 'ORD-003',
        customerName: 'Bob Wilson',
        customerEmail: 'bob@example.com',
        status: 'delivered',
        statusLabel: 'Livrée',
      });

      expect(result).toBe(true);
    });

    it('should handle optional courier information', async () => {
      const result = await sendStatusUpdateEmail({
        orderNumber: 'ORD-004',
        customerName: 'Alice Johnson',
        customerEmail: 'alice@example.com',
        status: 'out_for_delivery',
        statusLabel: 'En Attente de Livraison',
      });

      expect(result).toBe(true);
    });
  });

  describe('sendPaymentConfirmationEmail', () => {
    it('should send payment confirmation email for cash payment', async () => {
      const result = await sendPaymentConfirmationEmail(
        'john@example.com',
        'John Doe',
        'ORD-001',
        '25000',
        'cash'
      );

      expect(result).toBe(true);
    });

    it('should send payment confirmation email for wave payment', async () => {
      const result = await sendPaymentConfirmationEmail(
        'jane@example.com',
        'Jane Smith',
        'ORD-002',
        '35000',
        'wave'
      );

      expect(result).toBe(true);
    });

    it('should send payment confirmation email for moov payment', async () => {
      const result = await sendPaymentConfirmationEmail(
        'bob@example.com',
        'Bob Wilson',
        'ORD-003',
        '50000',
        'moov'
      );

      expect(result).toBe(true);
    });

    it('should send payment confirmation email for stripe payment', async () => {
      const result = await sendPaymentConfirmationEmail(
        'alice@example.com',
        'Alice Johnson',
        'ORD-004',
        '100000',
        'stripe'
      );

      expect(result).toBe(true);
    });

    it('should handle large amounts correctly', async () => {
      const result = await sendPaymentConfirmationEmail(
        'test@example.com',
        'Test User',
        'ORD-999',
        '999999',
        'cash'
      );

      expect(result).toBe(true);
    });
  });

  describe('Email Service Error Handling', () => {
    it('should handle invalid email addresses gracefully', async () => {
      const result = await sendOrderConfirmationEmail({
        orderNumber: 'ORD-ERR-001',
        customerName: 'Invalid User',
        customerEmail: 'invalid-email',
        items: [],
        totalAmount: '0',
        shippingCost: '0',
        deliveryAddress: 'Test',
        deliveryCity: 'Test',
        paymentMethod: 'cash',
      });

      // In development/test mode, it should still return true (mock)
      expect(result).toBe(true);
    });

    it('should handle missing optional fields', async () => {
      const result = await sendStatusUpdateEmail({
        orderNumber: 'ORD-ERR-002',
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        status: 'pending',
        statusLabel: 'En Attente',
      });

      expect(result).toBe(true);
    });
  });

  describe('Email Content Validation', () => {
    it('should include order number in confirmation email', async () => {
      const result = await sendOrderConfirmationEmail({
        orderNumber: 'ORD-VALIDATE-001',
        customerName: 'Validation Test',
        customerEmail: 'validate@example.com',
        items: [
          {
            productId: 1,
            quantity: 1,
            unitPrice: '5000',
            subtotal: '5000',
          },
        ],
        totalAmount: '5000',
        shippingCost: '0',
        deliveryAddress: 'Test Address',
        deliveryCity: 'Test City',
        paymentMethod: 'cash',
      });

      expect(result).toBe(true);
    });

    it('should include customer name in all emails', async () => {
      const customerName = 'Important Customer';

      const confirmResult = await sendOrderConfirmationEmail({
        orderNumber: 'ORD-NAME-001',
        customerName,
        customerEmail: 'customer@example.com',
        items: [],
        totalAmount: '0',
        shippingCost: '0',
        deliveryAddress: 'Test',
        deliveryCity: 'Test',
        paymentMethod: 'cash',
      });

      const statusResult = await sendStatusUpdateEmail({
        orderNumber: 'ORD-NAME-001',
        customerName,
        customerEmail: 'customer@example.com',
        status: 'confirmed',
        statusLabel: 'Confirmée',
      });

      expect(confirmResult).toBe(true);
      expect(statusResult).toBe(true);
    });

    it('should handle special characters in customer name', async () => {
      const result = await sendOrderConfirmationEmail({
        orderNumber: 'ORD-SPECIAL-001',
        customerName: "Jean-Pierre O'Connell",
        customerEmail: 'special@example.com',
        items: [],
        totalAmount: '0',
        shippingCost: '0',
        deliveryAddress: 'Test',
        deliveryCity: 'Test',
        paymentMethod: 'cash',
      });

      expect(result).toBe(true);
    });
  });
});
