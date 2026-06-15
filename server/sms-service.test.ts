import { describe, expect, it } from "vitest";
import SMSService, { SMS_TEMPLATES } from "./sms-service";

describe("SMS Service", () => {
  it("should initialize with mock provider", () => {
    const service = new SMSService({
      provider: 'mock',
      senderName: 'Cavaly',
    });
    expect(service).toBeDefined();
  });

  it("should send SMS via mock provider", async () => {
    const service = new SMSService({
      provider: 'mock',
      senderName: 'Cavaly',
    });

    const result = await service.sendSMS({
      to: '+225 07 12 34 56 78',
      message: 'Test message',
      orderId: 1,
      status: 'confirmed',
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
  });

  it("should have SMS templates for all statuses", () => {
    const orderNumber = 'CMD-001';
    
    expect(SMS_TEMPLATES.pending(orderNumber)).toContain('CMD-001');
    expect(SMS_TEMPLATES.confirmed(orderNumber)).toContain('CMD-001');
    expect(SMS_TEMPLATES.preparing(orderNumber)).toContain('CMD-001');
    expect(SMS_TEMPLATES.in_transit(orderNumber)).toContain('CMD-001');
    expect(SMS_TEMPLATES.out_for_delivery(orderNumber)).toContain('CMD-001');
    expect(SMS_TEMPLATES.delivered(orderNumber)).toContain('CMD-001');
    expect(SMS_TEMPLATES.cancelled(orderNumber)).toContain('CMD-001');
  });

  it("should include courier phone in out_for_delivery message", () => {
    const orderNumber = 'CMD-001';
    const courierPhone = '+225 07 12 34 56 78';
    
    const message = SMS_TEMPLATES.out_for_delivery(orderNumber, courierPhone);
    expect(message).toContain(courierPhone);
  });

  it("should handle SMS sending errors gracefully", async () => {
    const service = new SMSService({
      provider: 'mock',
      senderName: 'Cavaly',
    });

    // Test with invalid phone number format
    const result = await service.sendSMS({
      to: 'invalid-phone',
      message: 'Test message',
      orderId: 1,
      status: 'confirmed',
    });

    // Mock provider should still succeed for testing
    expect(result.success).toBe(true);
  });
});
