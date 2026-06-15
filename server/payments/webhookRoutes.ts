import { Router, Request, Response } from 'express';
import {
  handleWaveWebhook,
  handleMoovWebhook,
  handleMtnWebhook,
  handleOrangeWebhook,
  validateWebhookSignature,
} from './webhookHandlers';

const router = Router();

/**
 * Webhook Wave
 * POST /api/webhooks/payments/wave
 */
router.post('/wave', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-wave-signature'] as string;
    const secret = process.env.WAVE_WEBHOOK_SECRET || '';

    // Valider la signature
    const payload = JSON.stringify(req.body);
    if (signature && !validateWebhookSignature(payload, signature, secret)) {
      return res.status(401).json({ error: 'Signature invalide' });
    }

    const result = await handleWaveWebhook(req.body);
    res.json({ success: result.success, message: result.message });
  } catch (error) {
    console.error('Erreur Wave webhook:', error);
    res.status(500).json({ error: 'Erreur lors du traitement du webhook' });
  }
});

/**
 * Webhook Moov
 * POST /api/webhooks/payments/moov
 */
router.post('/moov', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-moov-signature'] as string;
    const secret = process.env.MOOV_WEBHOOK_SECRET || '';

    // Valider la signature
    const payload = JSON.stringify(req.body);
    if (signature && !validateWebhookSignature(payload, signature, secret)) {
      return res.status(401).json({ error: 'Signature invalide' });
    }

    const result = await handleMoovWebhook(req.body);
    res.json({ success: result.success, message: result.message });
  } catch (error) {
    console.error('Erreur Moov webhook:', error);
    res.status(500).json({ error: 'Erreur lors du traitement du webhook' });
  }
});

/**
 * Webhook MTN Money
 * POST /api/webhooks/payments/mtn
 */
router.post('/mtn', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-mtn-signature'] as string;
    const secret = process.env.MTN_WEBHOOK_SECRET || '';

    // Valider la signature
    const payload = JSON.stringify(req.body);
    if (signature && !validateWebhookSignature(payload, signature, secret)) {
      return res.status(401).json({ error: 'Signature invalide' });
    }

    const result = await handleMtnWebhook(req.body);
    res.json({ success: result.success, message: result.message });
  } catch (error) {
    console.error('Erreur MTN webhook:', error);
    res.status(500).json({ error: 'Erreur lors du traitement du webhook' });
  }
});

/**
 * Webhook Orange Money
 * POST /api/webhooks/payments/orange
 */
router.post('/orange', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-orange-signature'] as string;
    const secret = process.env.ORANGE_WEBHOOK_SECRET || '';

    // Valider la signature
    const payload = JSON.stringify(req.body);
    if (signature && !validateWebhookSignature(payload, signature, secret)) {
      return res.status(401).json({ error: 'Signature invalide' });
    }

    const result = await handleOrangeWebhook(req.body);
    res.json({ success: result.success, message: result.message });
  } catch (error) {
    console.error('Erreur Orange webhook:', error);
    res.status(500).json({ error: 'Erreur lors du traitement du webhook' });
  }
});

export default router;
