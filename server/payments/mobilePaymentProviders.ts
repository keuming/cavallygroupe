/**
 * Configuration des fournisseurs de paiement mobile
 * Supporte: Wave, Moov, MTN Money, Orange Money
 */

export type PaymentProvider = 'wave' | 'moov' | 'mtn' | 'orange';

export interface MobilePaymentConfig {
  provider: PaymentProvider;
  apiKey: string;
  webhookSecret: string;
  apiUrl: string;
  webhookUrl: string;
}

export interface PaymentWebhookPayload {
  transactionId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'pending';
  phoneNumber: string;
  timestamp: number;
  signature?: string;
}

export interface PaymentUpdateResult {
  success: boolean;
  orderId: string;
  transactionId: string;
  newStatus: string;
  message: string;
}

// Configuration des webhooks pour chaque fournisseur
export const paymentProviderConfig: Record<PaymentProvider, Partial<MobilePaymentConfig>> = {
  wave: {
    provider: 'wave',
    apiUrl: process.env.WAVE_API_URL || 'https://api.wave.com/v1',
    webhookUrl: '/api/webhooks/payments/wave',
  },
  moov: {
    provider: 'moov',
    apiUrl: process.env.MOOV_API_URL || 'https://api.moov.ci/v1',
    webhookUrl: '/api/webhooks/payments/moov',
  },
  mtn: {
    provider: 'mtn',
    apiUrl: process.env.MTN_API_URL || 'https://api.mtn.ci/v1',
    webhookUrl: '/api/webhooks/payments/mtn',
  },
  orange: {
    provider: 'orange',
    apiUrl: process.env.ORANGE_API_URL || 'https://api.orange.ci/v1',
    webhookUrl: '/api/webhooks/payments/orange',
  },
};

// Statuts de commande correspondant aux statuts de paiement
export const paymentStatusMap: Record<string, string> = {
  'success': 'paid',
  'failed': 'payment_failed',
  'pending': 'pending_payment',
  'cancelled': 'cancelled',
  'refunded': 'refunded',
};

// Messages de notification SMS
export const smsNotificationTemplates: Record<string, string> = {
  payment_confirmed: 'Merci! Votre paiement de {amount} FCFA a été confirmé. Numéro de commande: {orderId}. Suivi: {trackingUrl}',
  payment_failed: 'Votre paiement a échoué. Veuillez réessayer ou contacter le support: +225 05 86 00 01 03',
  order_confirmed: 'Votre commande {orderId} a été confirmée. Livraison prévue: {deliveryDate}',
  order_shipped: 'Votre colis est en route! Numéro de suivi: {trackingNumber}',
  order_delivered: 'Votre commande a été livrée. Merci pour votre achat!',
};
