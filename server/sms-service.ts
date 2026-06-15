import axios from 'axios';

export interface SMSNotificationConfig {
  provider: 'twilio' | 'vonage' | 'africastalking' | 'mock';
  apiKey?: string;
  apiSecret?: string;
  accountSid?: string;
  authToken?: string;
  senderName?: string;
}

export interface SMSMessage {
  to: string;
  message: string;
  orderId: number;
  status: string;
}

class SMSService {
  private config: SMSNotificationConfig;

  constructor(config: SMSNotificationConfig) {
    this.config = config;
  }

  async sendSMS(message: SMSMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      switch (this.config.provider) {
        case 'twilio':
          return await this.sendViaTwilio(message);
        case 'vonage':
          return await this.sendViaVonage(message);
        case 'africastalking':
          return await this.sendViaAfricasTalking(message);
        case 'mock':
          return await this.sendViaMock(message);
        default:
          return { success: false, error: 'Unknown SMS provider' };
      }
    } catch (error) {
      console.error('[SMS Service] Error sending SMS:', error);
      return { success: false, error: String(error) };
    }
  }

  private async sendViaTwilio(message: SMSMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const accountSid = this.config.accountSid;
      const authToken = this.config.authToken;
      const senderName = this.config.senderName || 'Cavaly';

      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          From: senderName,
          To: message.to,
          Body: message.message,
        },
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return {
        success: response.status === 201,
        messageId: response.data?.sid,
      };
    } catch (error) {
      return { success: false, error: `Twilio error: ${String(error)}` };
    }
  }

  private async sendViaVonage(message: SMSMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const apiKey = this.config.apiKey;
      const apiSecret = this.config.apiSecret;
      const senderName = this.config.senderName || 'Cavaly';

      const response = await axios.post(
        'https://rest.nexmo.com/sms/json',
        {
          api_key: apiKey,
          api_secret: apiSecret,
          to: message.to,
          from: senderName,
          text: message.message,
        }
      );

      const success = response.data?.messages?.[0]?.status === '0';
      return {
        success,
        messageId: response.data?.messages?.[0]?.['message-id'],
      };
    } catch (error) {
      return { success: false, error: `Vonage error: ${String(error)}` };
    }
  }

  private async sendViaAfricasTalking(message: SMSMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const apiKey = this.config.apiKey;
      const senderName = this.config.senderName || 'Cavaly';

      const response = await axios.post(
        'https://api.sandbox.africastalking.com/version1/messaging',
        {
          username: 'sandbox',
          messages: [
            {
              to: message.to,
              message: message.message,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      const success = response.data?.SMSMessageData?.Recipients?.[0]?.statusCode === '101';
      return {
        success,
        messageId: response.data?.SMSMessageData?.Recipients?.[0]?.messageId,
      };
    } catch (error) {
      return { success: false, error: `Africa's Talking error: ${String(error)}` };
    }
  }

  private async sendViaMock(message: SMSMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Mock implementation for testing
    console.log('[SMS Service - Mock] Sending SMS:', {
      to: message.to,
      message: message.message,
      orderId: message.orderId,
      status: message.status,
    });

    return {
      success: true,
      messageId: `mock-${Date.now()}`,
    };
  }
}

// SMS Message Templates
export const SMS_TEMPLATES = {
  pending: (orderNumber: string) =>
    `Cavally Livres: Votre commande ${orderNumber} a été reçue. Nous la traiterons bientôt.`,

  confirmed: (orderNumber: string) =>
    `Cavally Livres: Votre commande ${orderNumber} a été confirmée. Merci!`,

  preparing: (orderNumber: string) =>
    `Cavally Livres: Votre commande ${orderNumber} est en préparation.`,

  in_transit: (orderNumber: string) =>
    `Cavally Livres: Votre commande ${orderNumber} est en transit. Elle arrivera bientôt!`,

  out_for_delivery: (orderNumber: string, courierPhone?: string) =>
    `Cavally Livres: Votre commande ${orderNumber} est en cours de livraison. ${courierPhone ? `Livreur: ${courierPhone}` : ''}`,

  delivered: (orderNumber: string) =>
    `Cavally Livres: Votre commande ${orderNumber} a été livrée. Merci de votre achat!`,

  cancelled: (orderNumber: string) =>
    `Cavally Livres: Votre commande ${orderNumber} a été annulée. Contactez-nous pour plus d'infos.`,
};

// Create singleton instance
const smsService = new SMSService({
  provider: 'mock',
});

// Export function for sending SMS
export async function sendSMS(to: string, message: string, orderId: number, status: string) {
  return await smsService.sendSMS({ to, message, orderId, status });
}

export default SMSService;
