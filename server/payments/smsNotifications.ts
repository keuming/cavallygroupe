import { smsNotificationTemplates } from './mobilePaymentProviders';

export interface SmsNotificationRequest {
  phoneNumber: string;
  templateKey: string;
  variables: Record<string, string>;
}

/**
 * Envoie une notification SMS au client
 * En production, cela utiliserait une API SMS (Twilio, Vonage, etc.)
 */
export async function sendSmsNotification(request: SmsNotificationRequest): Promise<boolean> {
  try {
    const { phoneNumber, templateKey, variables } = request;

    // Récupérer le template
    const template = smsNotificationTemplates[templateKey];
    if (!template) {
      console.warn(`Template SMS non trouvé: ${templateKey}`);
      return false;
    }

    // Remplacer les variables dans le template
    let message = template;
    Object.entries(variables).forEach(([key, value]) => {
      message = message.replace(`{${key}}`, value);
    });

    // En production, appeler une API SMS réelle
    // Pour maintenant, on log simplement le message
    console.log(`[SMS] Envoi à ${phoneNumber}: ${message}`);

    // Simulation d'envoi réussi
    return true;
  } catch (error) {
    console.error(`Erreur lors de l'envoi du SMS: ${error}`);
    return false;
  }
}

/**
 * Envoie une notification SMS de confirmation de paiement
 */
export async function sendPaymentConfirmationSms(
  phoneNumber: string,
  orderId: string,
  amount: string
): Promise<boolean> {
  return sendSmsNotification({
    phoneNumber,
    templateKey: 'payment_confirmed',
    variables: {
      amount,
      orderId,
      trackingUrl: `${process.env.FRONTEND_URL || 'https://www.cavallygroupe.com'}/track/${orderId}`,
    },
  });
}

/**
 * Envoie une notification SMS d'échec de paiement
 */
export async function sendPaymentFailedSms(phoneNumber: string): Promise<boolean> {
  return sendSmsNotification({
    phoneNumber,
    templateKey: 'payment_failed',
    variables: {},
  });
}

/**
 * Envoie une notification SMS de confirmation de commande
 */
export async function sendOrderConfirmationSms(
  phoneNumber: string,
  orderId: string,
  deliveryDate: string
): Promise<boolean> {
  return sendSmsNotification({
    phoneNumber,
    templateKey: 'order_confirmed',
    variables: {
      orderId,
      deliveryDate,
    },
  });
}

/**
 * Envoie une notification SMS de livraison
 */
export async function sendOrderShippedSms(
  phoneNumber: string,
  trackingNumber: string
): Promise<boolean> {
  return sendSmsNotification({
    phoneNumber,
    templateKey: 'order_shipped',
    variables: {
      trackingNumber,
    },
  });
}

/**
 * Envoie une notification SMS de livraison complétée
 */
export async function sendOrderDeliveredSms(phoneNumber: string): Promise<boolean> {
  return sendSmsNotification({
    phoneNumber,
    templateKey: 'order_delivered',
    variables: {},
  });
}
