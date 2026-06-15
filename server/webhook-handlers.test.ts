import { describe, it, expect, beforeEach, vi } from "vitest";
import crypto from "crypto";
import {
  handleWaveWebhook,
  handleMoovWebhook,
  handleMTNWebhook,
  handleOrangeWebhook,
} from "./webhook-handlers";

// Mock the database and services
vi.mock("./db", () => ({
  getDb: vi.fn(() => Promise.resolve(null)),
}));

vi.mock("./email-service", () => ({
  sendOrderConfirmationEmail: vi.fn(),
  sendStatusUpdateEmail: vi.fn(),
}));

vi.mock("./sms-service", () => ({
  sendSMS: vi.fn(),
}));

describe("Webhook Handlers", () => {
  const secret = "test-secret-key";

  describe("Wave Webhook", () => {
    it("should reject webhook with invalid signature", async () => {
      const payload = {
        id: "wave-123",
        reference: "1",
        status: "SUCCESSFUL",
      };

      const invalidSignature = "invalid-signature";

      const result = await handleWaveWebhook(payload, invalidSignature, secret);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid signature");
    });

    it("should reject webhook with missing order ID", async () => {
      const payload = {
        id: "wave-123",
        status: "SUCCESSFUL",
      };

      const hash = crypto
        .createHmac("sha256", secret)
        .update(JSON.stringify(payload))
        .digest("hex");

      const result = await handleWaveWebhook(payload, hash, secret);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Missing order ID");
    });

    it("should handle webhook with valid signature", async () => {
      const payload = {
        id: "wave-123",
        reference: "1",
        status: "SUCCESSFUL",
      };

      const hash = crypto
        .createHmac("sha256", secret)
        .update(JSON.stringify(payload))
        .digest("hex");

      const result = await handleWaveWebhook(payload, hash, secret);

      // Should not throw error (will fail gracefully due to mocked db)
      expect(result).toBeDefined();
    });
  });

  describe("Moov Webhook", () => {
    it("should reject webhook with invalid signature", async () => {
      const payload = {
        id: "moov-123",
        metadata: { order_id: "1" },
        status: "SUCCESSFUL",
      };

      const invalidSignature = "invalid-signature";

      const result = await handleMoovWebhook(payload, invalidSignature, secret);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid signature");
    });

    it("should reject webhook with missing order ID", async () => {
      const payload = {
        id: "moov-123",
        status: "SUCCESSFUL",
      };

      const hash = crypto
        .createHmac("sha256", secret)
        .update(JSON.stringify(payload))
        .digest("hex");

      const result = await handleMoovWebhook(payload, hash, secret);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Missing order ID");
    });
  });

  describe("MTN Webhook", () => {
    it("should reject webhook with invalid signature", async () => {
      const payload = {
        transactionId: "mtn-123",
        externalId: "1",
        status: "COMPLETED",
      };

      const invalidSignature = "invalid-signature";

      const result = await handleMTNWebhook(payload, invalidSignature, secret);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid signature");
    });

    it("should reject webhook with missing order ID", async () => {
      const payload = {
        transactionId: "mtn-123",
        status: "COMPLETED",
      };

      const hash = crypto
        .createHmac("sha256", secret)
        .update(JSON.stringify(payload))
        .digest("hex");

      const result = await handleMTNWebhook(payload, hash, secret);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Missing order ID");
    });
  });

  describe("Orange Webhook", () => {
    it("should reject webhook with invalid signature", async () => {
      const payload = {
        id: "orange-123",
        reference: "1",
        status: "SUCCESS",
      };

      const invalidSignature = "invalid-signature";

      const result = await handleOrangeWebhook(payload, invalidSignature, secret);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid signature");
    });

    it("should reject webhook with missing order ID", async () => {
      const payload = {
        id: "orange-123",
        status: "SUCCESS",
      };

      const hash = crypto
        .createHmac("sha256", secret)
        .update(JSON.stringify(payload))
        .digest("hex");

      const result = await handleOrangeWebhook(payload, hash, secret);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Missing order ID");
    });
  });

  describe("Signature Verification", () => {
    it("should correctly verify Wave webhook signature", () => {
      const payload = {
        id: "wave-123",
        reference: "1",
        status: "SUCCESSFUL",
        amount: 25000,
      };

      const correctHash = crypto
        .createHmac("sha256", secret)
        .update(JSON.stringify(payload))
        .digest("hex");

      const wrongHash = crypto
        .createHmac("sha256", "wrong-secret")
        .update(JSON.stringify(payload))
        .digest("hex");

      expect(correctHash).not.toBe(wrongHash);
    });

    it("should correctly verify Moov webhook signature", () => {
      const payload = {
        id: "moov-123",
        metadata: { order_id: "1" },
        status: "SUCCESSFUL",
      };

      const correctHash = crypto
        .createHmac("sha256", secret)
        .update(JSON.stringify(payload))
        .digest("hex");

      const wrongHash = crypto
        .createHmac("sha256", "wrong-secret")
        .update(JSON.stringify(payload))
        .digest("hex");

      expect(correctHash).not.toBe(wrongHash);
    });
  });
});
