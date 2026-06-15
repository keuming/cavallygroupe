import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { paymentsRouter } from './payments-router';
import { getDb } from './db';
import { orders, paymentTransactions } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('Payments Router', () => {
  let db: any;
  let testOrderId: number;

  beforeAll(async () => {
    db = await getDb();
  });

  afterAll(async () => {
    // Cleanup
  });

  describe('getProviders', () => {
    it('should return list of available payment providers', async () => {
      const caller = paymentsRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      const providers = await caller.getProviders();

      expect(providers).toBeDefined();
      expect(Array.isArray(providers)).toBe(true);
      expect(providers.length).toBeGreaterThan(0);

      // Check for mobile money providers
      const waveProvider = providers.find(p => p.code === 'wave');
      expect(waveProvider).toBeDefined();
      expect(waveProvider?.name).toBe('Wave Money');
      expect(waveProvider?.isActive).toBe(true);

      // Check for other providers
      const moovProvider = providers.find(p => p.code === 'moov');
      expect(moovProvider).toBeDefined();

      const mtnProvider = providers.find(p => p.code === 'mtn');
      expect(mtnProvider).toBeDefined();

      const orangeProvider = providers.find(p => p.code === 'orange');
      expect(orangeProvider).toBeDefined();

      const stripeProvider = providers.find(p => p.code === 'stripe');
      expect(stripeProvider).toBeDefined();

      const cashProvider = providers.find(p => p.code === 'cash');
      expect(cashProvider).toBeDefined();
    });
  });

  describe('initiateMobilePayment', () => {
    it('should initiate a mobile money payment', async () => {
      if (!db) {
        console.warn('Database not available, skipping test');
        return;
      }

      // Create a test order
      const orderNumber = `ORD-${Date.now()}`;
      const orderResult = await db.insert(orders).values({
        orderNumber,
        status: 'pending',
        paymentMethod: 'wave',
        paymentStatus: 'pending',
        totalAmount: '10000',
        customerName: 'Test Customer',
        customerPhone: '+225 07 12 34 56 78',
        deliveryAddress: 'Test Address',
        deliveryCity: 'Abidjan',
      });

      const newOrderId = (orderResult as any).insertId || 1;

      const caller = paymentsRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.initiateMobilePayment({
        orderId: newOrderId,
        provider: 'wave',
        phoneNumber: '+225 07 12 34 56 78',
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.status).toBe('pending');
      expect(result.transactionId).toBeDefined();
      expect(result.provider).toBe('wave');
    });

    it('should throw error if order not found', async () => {
      const caller = paymentsRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      try {
        await caller.initiateMobilePayment({
          orderId: 99999,
          provider: 'wave',
          phoneNumber: '+225 07 12 34 56 78',
        });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should throw error if phone number missing for mobile payment', async () => {
      if (!db) {
        console.warn('Database not available, skipping test');
        return;
      }

      // Create a test order
      const orderNumber = `ORD-${Date.now()}`;
      const orderResult = await db.insert(orders).values({
        orderNumber,
        status: 'pending',
        paymentMethod: 'wave',
        paymentStatus: 'pending',
        totalAmount: '10000',
        customerName: 'Test Customer',
        customerPhone: '+225 07 12 34 56 78',
        deliveryAddress: 'Test Address',
        deliveryCity: 'Abidjan',
      });

      const newOrderId = (orderResult as any).insertId || 1;

      const caller = paymentsRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      try {
        await caller.initiateMobilePayment({
          orderId: newOrderId,
          provider: 'wave',
        });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('checkPaymentStatus', () => {
    it('should check payment status', async () => {
      if (!db) {
        console.warn('Database not available, skipping test');
        return;
      }

      // Create a test order
      const orderNumber = `ORD-${Date.now()}`;
      const orderResult = await db.insert(orders).values({
        orderNumber,
        status: 'pending',
        paymentMethod: 'wave',
        paymentStatus: 'pending',
        totalAmount: '10000',
        customerName: 'Test Customer',
        customerPhone: '+225 07 12 34 56 78',
        deliveryAddress: 'Test Address',
        deliveryCity: 'Abidjan',
      });

      const newOrderId = (orderResult as any).insertId || 1;

      // Create a test payment transaction
      const transactionId = `WAVE-${Date.now()}`;
      await db.insert(paymentTransactions).values({
        orderId: newOrderId,
        paymentMethod: 'wave',
        amount: '10000',
        status: 'pending',
        transactionId,
      });

      const caller = paymentsRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.checkPaymentStatus({
        transactionId,
        provider: 'wave',
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.status).toBe('pending');
      expect(result.amount).toBeDefined();
    });

    it('should return not_found for unknown transaction', async () => {
      const caller = paymentsRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.checkPaymentStatus({
        transactionId: 'UNKNOWN-12345',
        provider: 'wave',
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.status).toBe('not_found');
    });
  });

  describe('getOrderPayments', () => {
    it('should get all payments for an order', async () => {
      if (!db) {
        console.warn('Database not available, skipping test');
        return;
      }

      // Create a test order
      const orderNumber = `ORD-${Date.now()}`;
      const orderResult = await db.insert(orders).values({
        orderNumber,
        status: 'pending',
        paymentMethod: 'wave',
        paymentStatus: 'pending',
        totalAmount: '10000',
        customerName: 'Test Customer',
        customerPhone: '+225 07 12 34 56 78',
        deliveryAddress: 'Test Address',
        deliveryCity: 'Abidjan',
      });

      const newOrderId = (orderResult as any).insertId || 1;

      // Create test payment transactions
      const transactionId1 = `WAVE-${Date.now()}-1`;
      const transactionId2 = `WAVE-${Date.now()}-2`;

      await db.insert(paymentTransactions).values({
        orderId: newOrderId,
        paymentMethod: 'wave',
        amount: '5000',
        status: 'pending',
        transactionId: transactionId1,
      });

      await db.insert(paymentTransactions).values({
        orderId: newOrderId,
        paymentMethod: 'wave',
        amount: '5000',
        status: 'pending',
        transactionId: transactionId2,
      });

      const caller = paymentsRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      const payments = await caller.getOrderPayments({ orderId: newOrderId });

      expect(payments).toBeDefined();
      expect(Array.isArray(payments)).toBe(true);
      expect(payments.length).toBeGreaterThanOrEqual(2);
    });
  });
});
