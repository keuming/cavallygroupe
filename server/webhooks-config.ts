/**
 * Mobile Money Webhook Configuration
 * Defines webhook endpoints and secret keys for each payment provider
 */

export const WEBHOOK_CONFIG = {
  wave: {
    endpoint: "/api/webhooks/wave",
    secret: process.env.WAVE_WEBHOOK_SECRET || "wave-secret-key",
    enabled: true,
  },
  moov: {
    endpoint: "/api/webhooks/moov",
    secret: process.env.MOOV_WEBHOOK_SECRET || "moov-secret-key",
    enabled: true,
  },
  mtn: {
    endpoint: "/api/webhooks/mtn",
    secret: process.env.MTN_WEBHOOK_SECRET || "mtn-secret-key",
    enabled: true,
  },
  orange: {
    endpoint: "/api/webhooks/orange",
    secret: process.env.ORANGE_WEBHOOK_SECRET || "orange-secret-key",
    enabled: true,
  },
};

export const WEBHOOK_EVENTS = {
  PAYMENT_SUCCESS: "payment.success",
  PAYMENT_FAILED: "payment.failed",
  PAYMENT_PENDING: "payment.pending",
  PAYMENT_CANCELLED: "payment.cancelled",
};

export const PAYMENT_STATUS_MAP = {
  wave: {
    SUCCESSFUL: "completed",
    FAILED: "failed",
    PENDING: "pending",
  },
  moov: {
    SUCCESSFUL: "completed",
    FAILED: "failed",
    PENDING: "pending",
  },
  mtn: {
    COMPLETED: "completed",
    FAILED: "failed",
    PENDING: "pending",
  },
  orange: {
    SUCCESS: "completed",
    FAILURE: "failed",
    PENDING: "pending",
  },
};
