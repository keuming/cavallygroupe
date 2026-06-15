/**
 * Configuration pour les APIs de paiement mobile money ivoiriens
 * Wave, Moov, MTN Money, Orange Money
 */

export const MOBILE_MONEY_PROVIDERS = {
  WAVE: {
    name: 'Wave Money',
    code: 'wave',
    apiUrl: 'https://api.wave.com/v1',
    color: '#0066FF',
    icon: '📱',
    description: 'Paiement via Wave Money',
  },
  MOOV: {
    name: 'Moov Money',
    code: 'moov',
    apiUrl: 'https://api.moov.ci/v1',
    color: '#FF6B00',
    icon: '💳',
    description: 'Paiement via Moov Money',
  },
  MTN: {
    name: 'MTN Money',
    code: 'mtn',
    apiUrl: 'https://api.mtn.ci/v1',
    color: '#FFCC00',
    icon: '📲',
    description: 'Paiement via MTN Money',
  },
  ORANGE: {
    name: 'Orange Money',
    code: 'orange',
    apiUrl: 'https://api.orange.ci/v1',
    color: '#FF6600',
    icon: '🟠',
    description: 'Paiement via Orange Money',
  },
};

/**
 * Interface pour les paramètres de paiement mobile money
 */
export interface MobileMoneyPaymentParams {
  amount: number;
  currency: string;
  phoneNumber: string;
  orderId: string;
  description: string;
  callbackUrl: string;
  provider: keyof typeof MOBILE_MONEY_PROVIDERS;
}

/**
 * Interface pour la réponse de paiement
 */
export interface MobileMoneyPaymentResponse {
  success: boolean;
  transactionId?: string;
  status: 'pending' | 'completed' | 'failed';
  message: string;
  provider: string;
}

/**
 * Interface pour le webhook de paiement
 */
export interface MobileMoneyWebhookPayload {
  transactionId: string;
  orderId: string;
  amount: number;
  status: 'completed' | 'failed' | 'pending';
  provider: string;
  timestamp: string;
  signature: string;
}
