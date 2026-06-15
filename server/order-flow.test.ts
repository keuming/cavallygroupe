import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getDb } from './db';
import {
  createOrder,
  addOrderItems,
  getOrderById,
  getOrderItems,
  createPaymentTransaction,
  getPaymentTransactions,
  updateOrderPaymentStatus,
  updateOrderStatus,
} from './db';
import { orders, paymentTransactions } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('Complete Order Flow', () => {
  let db: any;
  let testOrderId: number;
  let testOrderNumber: string;

  beforeAll(async () => {
    db = await getDb();
  });

  describe('Step 1: Create Order', () => {
    it('should create an order successfully', async () => {
      if (!db) {
        console.warn('Database not available, skipping test');
        return;
      }

      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(5, '0');
      testOrderNumber = `ORD-${dateStr}-${random}`;

      const result = await createOrder({
        userId: 1,
        orderNumber: testOrderNumber,
        status: 'pending',
        paymentMethod: 'wave',
        paymentStatus: 'pending',
        totalAmount: '50000',
        shippingCost: '0',
        customerName: 'Test Customer',
        customerPhone: '+225 07 12 34 56 78',
        customerEmail: 'test@example.com',
        deliveryAddress: 'Test Address',
        deliveryCity: 'Abidjan',
        deliveryPostalCode: '22 bp 121466',
      });

      expect(result).toBeDefined();
      expect((result as any).insertId).toBeDefined();
      expect(typeof (result as any).insertId).toBe('number');

      testOrderId = (result as any).insertId;
      console.log(`✓ Order created with ID: ${testOrderId}, Number: ${testOrderNumber}`);
    });

    it('should retrieve the created order', async () => {
      if (!db) {
        console.warn('Database not available, skipping test');
        return;
      }

      const order = await getOrderById(testOrderId);
      expect(order).toBeDefined();
      expect(order?.length).toBeGreaterThan(0);
      expect(order?.[0].orderNumber).toBe(testOrderNumber);
      expect(order?.[0].status).toBe('pending');
      expect(order?.[0].paymentStatus).toBe('pending');

      console.log(`✓ Order retrieved: ${JSON.stringify(order?.[0])}`);
    });
  });

  describe('Step 2: Add Order Items', () => {
    it('should add items to the order', async () => {
      if (!db) {
        console.warn('Database not available, skipping test');
        return;
      }

      const items = [
        {
          productId: 1,
          quantity: 2,
          unitPrice: '12500',
          subtotal: '25000',
        },
        {
          productId: 2,
          quantity: 1,
          unitPrice: '25000',
          subtotal: '25000',
        },
      ];

      await addOrderItems(testOrderId, items as any);

      const orderItems = await getOrderItems(testOrderId);
      expect(orderItems).toBeDefined();
      expect(orderItems?.length).toBe(2);
      expect(orderItems?.[0].productId).toBe(1);
      expect(orderItems?.[0].quantity).toBe(2);
      expect(orderItems?.[1].productId).toBe(2);
      expect(orderItems?.[1].quantity).toBe(1);

      console.log(`✓ Order items added: ${JSON.stringify(orderItems)}`);
    });

    it('should calculate correct subtotals', async () => {
      if (!db) {
        console.warn('Database not available, skipping test');
        return;
      }

      const orderItems = await getOrderItems(testOrderId);
      const totalSubtotal = orderItems?.reduce((sum, item) => {
        return sum + Number(item.subtotal);
      }, 0);

      expect(totalSubtotal).toBe(50000);
      console.log(`✓ Total subtotal verified: ${totalSubtotal} FCFA`);
    });
  });

  describe('Step 3: Process Payment - Wave Money', () => {
    it('should create a payment transaction for Wave Money', async () => {
      if (!db) {
        console.warn('Database not available, skipping test');
        return;
      }

      const transactionId = `WAVE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const result = await createPaymentTransaction({
        orderId: testOrderId,
        paymentMethod: 'wave',
        amount: '50000',
        status: 'pending',
        transactionId,
      });

      expect(result).toBeDefined();

      const payments = await getPaymentTransactions(testOrderId);
      expect(payments).toBeDefined();
      expect(payments?.length).toBeGreaterThan(0);
      expect(payments?.[0].transactionId).toBe(transactionId);
      expect(payments?.[0].status).toBe('pending');

      console.log(`✓ Wave Money payment transaction created: ${transactionId}`);
    });

    it('should update payment status to completed', async () => {
      if (!db) {
        console.warn('Database not available, skipping test');
        return;
      }

      await updateOrderPaymentStatus(testOrderId, 'completed');

      const order = await getOrderById(testOrderId);
      expect(order?.[0].paymentStatus).toBe('completed');

      console.log(`✓ Payment status updated to: completed`);
    });

    it('should update order status to confirmed', async () => {
      if (!db) {
        console.warn('Database not available, skipping test');
        return;
      }

      await updateOrderStatus(testOrderId, 'confirmed');

      const order = await getOrderById(testOrderId);
      expect(order?.[0].status).toBe('confirmed');

      console.log(`✓ Order status updated to: confirmed`);
    });
  });

  describe('Step 4: Process Payment - Moov Money', () => {
    let moovOrderId: number;
    let moovOrderNumber: string;

    it('should create a second order for Moov Money test', async () => {
      if (!db) {
        console.warn('Database not available, skipping test');
        return;
      }

      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(5, '0');
      moovOrderNumber = `ORD-${dateStr}-${random}`;

      const result = await createOrder({
        userId: 1,
        orderNumber: moovOrderNumber,
        status: 'pending',
        paymentMethod: 'moov',
        paymentStatus: 'pending',
        totalAmount: '30000',
        shippingCost: '0',
        customerName: 'Test Customer 2',
        customerPhone: '+225 07 87 65 43 21',
        customerEmail: 'test2@example.com',
        deliveryAddress: 'Test Address 2',
        deliveryCity: 'Yamoussoukro',
        deliveryPostalCode: '01 bp 123',
      });

      moovOrderId = (result as any).insertId;
      expect(moovOrderId).toBeDefined();

      console.log(`✓ Moov Money order created with ID: ${moovOrderId}`);
    });

    it('should add items to Moov Money order', async () => {
      if (!db) {
        console.warn('Database not available, skipping test');
        return;
      }

      const items = [
        {
          productId: 3,
          quantity: 3,
          unitPrice: '10000',
          subtotal: '30000',
        },
      ];

      await addOrderItems(moovOrderId, items as any);

      const orderItems = await getOrderItems(moovOrderId);
      expect(orderItems?.length).toBe(1);

      console.log(`✓ Moov Money order items added`);
    });

    it('should process Moov Money payment', async () => {
      if (!db) {
        console.warn('Database not available, skipping test');
        return;
      }

      const transactionId = `MOOV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      await createPaymentTransaction({
        orderId: moovOrderId,
        paymentMethod: 'moov',
        amount: '30000',
        status: 'pending',
        transactionId,
      });

      await updateOrderPaymentStatus(moovOrderId, 'completed');
      await updateOrderStatus(moovOrderId, 'confirmed');

      const order = await getOrderById(moovOrderId);
      expect(order?.[0].paymentStatus).toBe('completed');
      expect(order?.[0].status).toBe('confirmed');

      console.log(`✓ Moov Money payment processed successfully`);
    });
  });

  describe('Step 5: Process Payment - Cash on Delivery', () => {
    let cashOrderId: number;

    it('should create an order for cash payment', async () => {
      if (!db) {
        console.warn('Database not available, skipping test');
        return;
      }

      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(5, '0');
      const cashOrderNumber = `ORD-${dateStr}-${random}`;

      const result = await createOrder({
        userId: 1,
        orderNumber: cashOrderNumber,
        status: 'pending',
        paymentMethod: 'cash',
        paymentStatus: 'pending',
        totalAmount: '15000',
        shippingCost: '0',
        customerName: 'Test Customer 3',
        customerPhone: '+225 01 23 45 67 89',
        customerEmail: 'test3@example.com',
        deliveryAddress: 'Test Address 3',
        deliveryCity: 'Bouaké',
        deliveryPostalCode: '01 bp 456',
      });

      cashOrderId = (result as any).insertId;
      expect(cashOrderId).toBeDefined();

      console.log(`✓ Cash on delivery order created with ID: ${cashOrderId}`);
    });

    it('should add items to cash order', async () => {
      if (!db) {
        console.warn('Database not available, skipping test');
        return;
      }

      const items = [
        {
          productId: 4,
          quantity: 1,
          unitPrice: '15000',
          subtotal: '15000',
        },
      ];

      await addOrderItems(cashOrderId, items as any);

      const orderItems = await getOrderItems(cashOrderId);
      expect(orderItems?.length).toBe(1);

      console.log(`✓ Cash order items added`);
    });

    it('should keep cash order as pending until delivery', async () => {
      if (!db) {
        console.warn('Database not available, skipping test');
        return;
      }

      const order = await getOrderById(cashOrderId);
      expect(order?.[0].paymentStatus).toBe('pending');
      expect(order?.[0].status).toBe('pending');

      console.log(`✓ Cash order remains pending until delivery`);
    });
  });

  describe('Step 6: Verify Order Summary', () => {
    it('should retrieve all orders with items', async () => {
      if (!db) {
        console.warn('Database not available, skipping test');
        return;
      }

      const order1 = await getOrderById(testOrderId);
      const items1 = await getOrderItems(testOrderId);

      expect(order1).toBeDefined();
      expect(items1?.length).toBe(2);

      console.log(`✓ Order 1 Summary:`);
      console.log(`  - Order Number: ${order1?.[0].orderNumber}`);
      console.log(`  - Total Amount: ${order1?.[0].totalAmount} FCFA`);
      console.log(`  - Payment Status: ${order1?.[0].paymentStatus}`);
      console.log(`  - Order Status: ${order1?.[0].status}`);
      console.log(`  - Items: ${items1?.length}`);
    });

    it('should verify payment transactions', async () => {
      if (!db) {
        console.warn('Database not available, skipping test');
        return;
      }

      const payments = await getPaymentTransactions(testOrderId);
      expect(payments).toBeDefined();
      expect(payments?.length).toBeGreaterThan(0);

      console.log(`✓ Payment transactions verified:`);
      payments?.forEach((payment, index) => {
        console.log(`  - Transaction ${index + 1}: ${payment.transactionId}`);
        console.log(`    Amount: ${payment.amount} FCFA`);
        console.log(`    Status: ${payment.status}`);
      });
    });
  });
});
