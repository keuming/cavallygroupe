import { Router, Request, Response } from "express";
import {
  handleWaveWebhook,
  handleMoovWebhook,
  handleMTNWebhook,
  handleOrangeWebhook,
} from "../webhook-handlers";
import { WEBHOOK_CONFIG } from "../webhooks-config";

const router = Router();

/**
 * Wave Money Webhook Endpoint
 * POST /api/webhooks/wave
 */
router.post("/wave", async (req: Request, res: Response) => {
  try {
    const signature = req.headers["x-wave-signature"] as string;
    const payload = req.body;

    if (!signature) {
      return res.status(400).json({ error: "Missing signature" });
    }

    const result = await handleWaveWebhook(
      payload,
      signature,
      WEBHOOK_CONFIG.wave.secret
    );

    if (result.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("[Wave Webhook] Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Moov Money Webhook Endpoint
 * POST /api/webhooks/moov
 */
router.post("/moov", async (req: Request, res: Response) => {
  try {
    const signature = req.headers["x-moov-signature"] as string;
    const payload = req.body;

    if (!signature) {
      return res.status(400).json({ error: "Missing signature" });
    }

    const result = await handleMoovWebhook(
      payload,
      signature,
      WEBHOOK_CONFIG.moov.secret
    );

    if (result.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("[Moov Webhook] Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * MTN Money Webhook Endpoint
 * POST /api/webhooks/mtn
 */
router.post("/mtn", async (req: Request, res: Response) => {
  try {
    const signature = req.headers["x-mtn-signature"] as string;
    const payload = req.body;

    if (!signature) {
      return res.status(400).json({ error: "Missing signature" });
    }

    const result = await handleMTNWebhook(
      payload,
      signature,
      WEBHOOK_CONFIG.mtn.secret
    );

    if (result.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("[MTN Webhook] Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Orange Money Webhook Endpoint
 * POST /api/webhooks/orange
 */
router.post("/orange", async (req: Request, res: Response) => {
  try {
    const signature = req.headers["x-orange-signature"] as string;
    const payload = req.body;

    if (!signature) {
      return res.status(400).json({ error: "Missing signature" });
    }

    const result = await handleOrangeWebhook(
      payload,
      signature,
      WEBHOOK_CONFIG.orange.secret
    );

    if (result.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("[Orange Webhook] Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Health check endpoint for webhooks
 * GET /api/webhooks/health
 */
router.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    webhooks: {
      wave: WEBHOOK_CONFIG.wave.enabled,
      moov: WEBHOOK_CONFIG.moov.enabled,
      mtn: WEBHOOK_CONFIG.mtn.enabled,
      orange: WEBHOOK_CONFIG.orange.enabled,
    },
  });
});

export default router;
