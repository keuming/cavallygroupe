/**
 * Service de paiement mobile money pour les API ivoiriennes
 * Gère Wave Money, Moov Money, MTN Money, Orange Money
 */

import crypto from 'crypto';

export interface MobileMoneyPaymentRequest {
  amount: number;
  phoneNumber: string;
  orderId: string;
  customerName: string;
  description: string;
  provider: 'wave' | 'moov' | 'mtn' | 'orange';
}

export interface MobileMoneyPaymentResult {
  success: boolean;
  transactionId?: string;
  status: 'pending' | 'completed' | 'failed';
  message: string;
  provider: string;
  redirectUrl?: string;
}

/**
 * Configuration des API de paiement mobile money
 */
const PAYMENT_CONFIG = {
  wave: {
    apiUrl: process.env.WAVE_API_URL || 'https://api.wave.com/v1',
    apiKey: process.env.WAVE_API_KEY || '',
    businessId: process.env.WAVE_BUSINESS_ID || '',
    webhookSecret: process.env.WAVE_WEBHOOK_SECRET || '',
  },
  moov: {
    apiUrl: process.env.MOOV_API_URL || 'https://api.moov.ci/v1',
    apiKey: process.env.MOOV_API_KEY || '',
    merchantId: process.env.MOOV_MERCHANT_ID || '',
    webhookSecret: process.env.MOOV_WEBHOOK_SECRET || '',
  },
  mtn: {
    apiUrl: process.env.MTN_API_URL || 'https://api.mtn.ci/v1',
    apiKey: process.env.MTN_API_KEY || '',
    subscriptionKey: process.env.MTN_SUBSCRIPTION_KEY || '',
    webhookSecret: process.env.MTN_WEBHOOK_SECRET || '',
  },
  orange: {
    apiUrl: process.env.ORANGE_API_URL || 'https://api.orange.ci/v1',
    apiKey: process.env.ORANGE_API_KEY || '',
    clientId: process.env.ORANGE_CLIENT_ID || '',
    webhookSecret: process.env.ORANGE_WEBHOOK_SECRET || '',
  },
};

/**
 * Service Wave Money
 */
class WaveMoneyService {
  async initiatePayment(request: MobileMoneyPaymentRequest): Promise<MobileMoneyPaymentResult> {
    try {
      const config = PAYMENT_CONFIG.wave;
      
      if (!config.apiKey) {
        console.warn('[Wave Money] API key not configured, using mock response');
        return this.mockPaymentResponse(request);
      }

      const payload = {
        amount: request.amount,
        currency: 'XOF', // Franc CFA Ouest africain
        phoneNumber: this.normalizePhoneNumber(request.phoneNumber, 'CI'),
        orderId: request.orderId,
        description: request.description,
        customerName: request.customerName,
        callbackUrl: `${process.env.APP_URL || 'http://localhost:3000'}/api/webhooks/wave`,
      };

      const response = await fetch(`${config.apiUrl}/payments/initiate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          'X-Business-ID': config.businessId,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Wave API error: ${error.message}`);
      }

      const data = await response.json();

      return {
        success: true,
        transactionId: data.transactionId,
        status: 'pending',
        message: 'Paiement initié. Veuillez confirmer sur votre téléphone Wave.',
        provider: 'wave',
        redirectUrl: data.redirectUrl,
      };
    } catch (error) {
      console.error('[Wave Money] Payment initiation error:', error);
      return {
        success: false,
        status: 'failed',
        message: `Erreur Wave Money: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        provider: 'wave',
      };
    }
  }

  async checkPaymentStatus(transactionId: string): Promise<{ status: 'pending' | 'completed' | 'failed' }> {
    try {
      const config = PAYMENT_CONFIG.wave;
      
      if (!config.apiKey) {
        return { status: 'pending' };
      }

      const response = await fetch(`${config.apiUrl}/payments/${transactionId}/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'X-Business-ID': config.businessId,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to check payment status');
      }

      const data = await response.json();
      return { status: data.status };
    } catch (error) {
      console.error('[Wave Money] Status check error:', error);
      return { status: 'pending' };
    }
  }

  private mockPaymentResponse(request: MobileMoneyPaymentRequest): MobileMoneyPaymentResult {
    return {
      success: true,
      transactionId: `WAVE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      message: 'Paiement initié (mode test). Veuillez confirmer sur votre téléphone.',
      provider: 'wave',
    };
  }

  private normalizePhoneNumber(phoneNumber: string, countryCode: string): string {
    // Remove spaces and special characters
    let normalized = phoneNumber.replace(/[\s\-\+]/g, '');
    
    // Add country code if not present
    if (!normalized.startsWith(countryCode)) {
      if (normalized.startsWith('0')) {
        normalized = countryCode + normalized.substring(1);
      } else {
        normalized = countryCode + normalized;
      }
    }
    
    return normalized;
  }
}

/**
 * Service Moov Money
 */
class MoovMoneyService {
  async initiatePayment(request: MobileMoneyPaymentRequest): Promise<MobileMoneyPaymentResult> {
    try {
      const config = PAYMENT_CONFIG.moov;
      
      if (!config.apiKey) {
        console.warn('[Moov Money] API key not configured, using mock response');
        return this.mockPaymentResponse(request);
      }

      const payload = {
        amount: request.amount,
        currency: 'XOF',
        phoneNumber: this.normalizePhoneNumber(request.phoneNumber, '225'),
        orderId: request.orderId,
        description: request.description,
        customerName: request.customerName,
        notificationUrl: `${process.env.APP_URL || 'http://localhost:3000'}/api/webhooks/moov`,
      };

      const response = await fetch(`${config.apiUrl}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          'X-Merchant-ID': config.merchantId,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Moov API error: ${error.message}`);
      }

      const data = await response.json();

      return {
        success: true,
        transactionId: data.paymentId,
        status: 'pending',
        message: 'Paiement initié. Veuillez confirmer sur votre téléphone Moov.',
        provider: 'moov',
        redirectUrl: data.redirectUrl,
      };
    } catch (error) {
      console.error('[Moov Money] Payment initiation error:', error);
      return {
        success: false,
        status: 'failed',
        message: `Erreur Moov Money: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        provider: 'moov',
      };
    }
  }

  async checkPaymentStatus(transactionId: string): Promise<{ status: 'pending' | 'completed' | 'failed' }> {
    try {
      const config = PAYMENT_CONFIG.moov;
      
      if (!config.apiKey) {
        return { status: 'pending' };
      }

      const response = await fetch(`${config.apiUrl}/payments/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'X-Merchant-ID': config.merchantId,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to check payment status');
      }

      const data = await response.json();
      return { status: data.status };
    } catch (error) {
      console.error('[Moov Money] Status check error:', error);
      return { status: 'pending' };
    }
  }

  private mockPaymentResponse(request: MobileMoneyPaymentRequest): MobileMoneyPaymentResult {
    return {
      success: true,
      transactionId: `MOOV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      message: 'Paiement initié (mode test). Veuillez confirmer sur votre téléphone.',
      provider: 'moov',
    };
  }

  private normalizePhoneNumber(phoneNumber: string, countryCode: string): string {
    let normalized = phoneNumber.replace(/[\s\-\+]/g, '');
    
    if (!normalized.startsWith(countryCode)) {
      if (normalized.startsWith('0')) {
        normalized = countryCode + normalized.substring(1);
      } else {
        normalized = countryCode + normalized;
      }
    }
    
    return normalized;
  }
}

/**
 * Service MTN Money
 */
class MTNMoneyService {
  async initiatePayment(request: MobileMoneyPaymentRequest): Promise<MobileMoneyPaymentResult> {
    try {
      const config = PAYMENT_CONFIG.mtn;
      
      if (!config.apiKey) {
        console.warn('[MTN Money] API key not configured, using mock response');
        return this.mockPaymentResponse(request);
      }

      const payload = {
        amount: request.amount,
        currency: 'XOF',
        msisdn: this.normalizePhoneNumber(request.phoneNumber, '225'),
        externalId: request.orderId,
        description: request.description,
        callbackUrl: `${process.env.APP_URL || 'http://localhost:3000'}/api/webhooks/mtn`,
      };

      const response = await fetch(`${config.apiUrl}/collection/v1_0/requesttopay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'X-Reference-Id': request.orderId,
          'X-Target-Environment': 'production',
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': config.subscriptionKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`MTN API error: ${error}`);
      }

      const transactionId = response.headers.get('X-Reference-Id') || `MTN-${Date.now()}`;

      return {
        success: true,
        transactionId,
        status: 'pending',
        message: 'Paiement initié. Veuillez confirmer sur votre téléphone MTN.',
        provider: 'mtn',
      };
    } catch (error) {
      console.error('[MTN Money] Payment initiation error:', error);
      return {
        success: false,
        status: 'failed',
        message: `Erreur MTN Money: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        provider: 'mtn',
      };
    }
  }

  async checkPaymentStatus(transactionId: string): Promise<{ status: 'pending' | 'completed' | 'failed' }> {
    try {
      const config = PAYMENT_CONFIG.mtn;
      
      if (!config.apiKey) {
        return { status: 'pending' };
      }

      const response = await fetch(`${config.apiUrl}/collection/v1_0/requesttopay/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'X-Target-Environment': 'production',
          'Ocp-Apim-Subscription-Key': config.subscriptionKey,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to check payment status');
      }

      const data = await response.json();
      return { status: data.status };
    } catch (error) {
      console.error('[MTN Money] Status check error:', error);
      return { status: 'pending' };
    }
  }

  private mockPaymentResponse(request: MobileMoneyPaymentRequest): MobileMoneyPaymentResult {
    return {
      success: true,
      transactionId: `MTN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      message: 'Paiement initié (mode test). Veuillez confirmer sur votre téléphone.',
      provider: 'mtn',
    };
  }

  private normalizePhoneNumber(phoneNumber: string, countryCode: string): string {
    let normalized = phoneNumber.replace(/[\s\-\+]/g, '');
    
    if (!normalized.startsWith(countryCode)) {
      if (normalized.startsWith('0')) {
        normalized = countryCode + normalized.substring(1);
      } else {
        normalized = countryCode + normalized;
      }
    }
    
    return normalized;
  }
}

/**
 * Service Orange Money
 */
class OrangeMoneyService {
  async initiatePayment(request: MobileMoneyPaymentRequest): Promise<MobileMoneyPaymentResult> {
    try {
      const config = PAYMENT_CONFIG.orange;
      
      if (!config.apiKey) {
        console.warn('[Orange Money] API key not configured, using mock response');
        return this.mockPaymentResponse(request);
      }

      const payload = {
        amount: request.amount,
        currency: 'XOF',
        phoneNumber: this.normalizePhoneNumber(request.phoneNumber, '225'),
        orderId: request.orderId,
        description: request.description,
        customerName: request.customerName,
        returnUrl: `${process.env.APP_URL || 'http://localhost:3000'}/order-confirmation/${request.orderId}`,
        notificationUrl: `${process.env.APP_URL || 'http://localhost:3000'}/api/webhooks/orange`,
      };

      const response = await fetch(`${config.apiUrl}/payments/initiate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          'X-Client-ID': config.clientId,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Orange API error: ${error.message}`);
      }

      const data = await response.json();

      return {
        success: true,
        transactionId: data.transactionId,
        status: 'pending',
        message: 'Paiement initié. Veuillez confirmer sur votre téléphone Orange.',
        provider: 'orange',
        redirectUrl: data.redirectUrl,
      };
    } catch (error) {
      console.error('[Orange Money] Payment initiation error:', error);
      return {
        success: false,
        status: 'failed',
        message: `Erreur Orange Money: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        provider: 'orange',
      };
    }
  }

  async checkPaymentStatus(transactionId: string): Promise<{ status: 'pending' | 'completed' | 'failed' }> {
    try {
      const config = PAYMENT_CONFIG.orange;
      
      if (!config.apiKey) {
        return { status: 'pending' };
      }

      const response = await fetch(`${config.apiUrl}/payments/${transactionId}/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'X-Client-ID': config.clientId,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to check payment status');
      }

      const data = await response.json();
      return { status: data.status };
    } catch (error) {
      console.error('[Orange Money] Status check error:', error);
      return { status: 'pending' };
    }
  }

  private mockPaymentResponse(request: MobileMoneyPaymentRequest): MobileMoneyPaymentResult {
    return {
      success: true,
      transactionId: `ORANGE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      message: 'Paiement initié (mode test). Veuillez confirmer sur votre téléphone.',
      provider: 'orange',
    };
  }

  private normalizePhoneNumber(phoneNumber: string, countryCode: string): string {
    let normalized = phoneNumber.replace(/[\s\-\+]/g, '');
    
    if (!normalized.startsWith(countryCode)) {
      if (normalized.startsWith('0')) {
        normalized = countryCode + normalized.substring(1);
      } else {
        normalized = countryCode + normalized;
      }
    }
    
    return normalized;
  }
}

/**
 * Factory pour obtenir le service de paiement approprié
 */
export class MobileMoneyServiceFactory {
  private static services = {
    wave: new WaveMoneyService(),
    moov: new MoovMoneyService(),
    mtn: new MTNMoneyService(),
    orange: new OrangeMoneyService(),
  };

  static getService(provider: 'wave' | 'moov' | 'mtn' | 'orange') {
    return this.services[provider];
  }

  static async initiatePayment(request: MobileMoneyPaymentRequest): Promise<MobileMoneyPaymentResult> {
    const service = this.getService(request.provider);
    return service.initiatePayment(request);
  }

  static async checkPaymentStatus(provider: 'wave' | 'moov' | 'mtn' | 'orange', transactionId: string) {
    const service = this.getService(provider);
    return service.checkPaymentStatus(transactionId);
  }
}

/**
 * Vérifier la signature du webhook
 */
export function verifyWebhookSignature(payload: any, signature: string, secret: string): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return hash === signature;
}
