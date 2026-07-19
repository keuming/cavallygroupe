import nodemailer from 'nodemailer';

/**
 * Email Service for sending order confirmations and status updates
 * Uses SMTP credentials configured via environment variables (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    productId: number;
    quantity: number;
    unitPrice: string;
    subtotal: string;
  }>;
  totalAmount: string;
  shippingCost: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPostalCode?: string;
  paymentMethod: string;
  trackingUrl?: string;
}

interface StatusUpdateEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: string;
  statusLabel: string;
  estimatedDeliveryDate?: string;
  courierName?: string;
  courierPhone?: string;
  trackingUrl?: string;
}

/**
 * Initialize email transporter
 * In production, use environment variables for SMTP configuration
 */
function getTransporter() {
  // For development/testing, use a mock transporter
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    return {
      sendMail: async (options: EmailOptions) => {
        console.log('[Email Service - Mock] Sending email:', {
          to: options.to,
          subject: options.subject,
          preview: options.html.substring(0, 100),
        });
        return { messageId: `mock-${Date.now()}` };
      },
    };
  }

  // Production: Use actual SMTP
  const smtpUser = process.env.SMTP_USER || '';
  const smtpPass = process.env.SMTP_PASS || '';
  console.log('[SMTP] user:', smtpUser, '| hasPass:', Boolean(smtpPass), '| passLen:', smtpPass.length);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
    tls: { rejectUnauthorized: false },
  });
}

/**
 * Generate order confirmation email HTML
 */
function generateOrderConfirmationHTML(data: OrderEmailData): string {
  const itemsHTML = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">Produit #${item.productId}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${item.unitPrice} FCFA</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${item.subtotal} FCFA</td>
    </tr>
  `
    )
    .join('');

  const paymentMethodLabel = {
    wave: '📱 Wave Money',
    moov: '💳 Moov Money',
    mtn: '📲 MTN Money',
    orange: '🟠 Orange Money',
    stripe: '💳 Carte Bancaire',
    cash: '💵 Espèces à la Livraison',
  }[data.paymentMethod] || data.paymentMethod;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
          .header { background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .order-number { background: #f0f0f0; padding: 15px; border-left: 4px solid #ff6b35; margin: 20px 0; font-size: 18px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .summary { background: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0; }
          .summary-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .summary-row.total { border-top: 2px solid #ff6b35; padding-top: 12px; margin-top: 12px; font-size: 18px; font-weight: bold; color: #ff6b35; }
          .delivery-info { background: #f0f7ff; padding: 15px; border-radius: 4px; margin: 20px 0; }
          .delivery-info h3 { margin-top: 0; color: #333; }
          .button { display: inline-block; background: #ff6b35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Commande Confirmée!</h1>
            <p>Merci pour votre achat chez Cavally Livres</p>
          </div>
          <div class="content">
            <p>Bonjour ${data.customerName},</p>
            <p>Votre commande a été reçue et sera traitée rapidement. Vous pouvez suivre votre livraison en utilisant le numéro de commande ci-dessous.</p>

            <div class="order-number">
              Numéro de Commande: ${data.orderNumber}
            </div>

            <h3>Articles Commandés</h3>
            <table>
              <thead>
                <tr style="background: #f0f0f0;">
                  <th style="padding: 12px; text-align: left;">Article</th>
                  <th style="padding: 12px; text-align: center;">Quantité</th>
                  <th style="padding: 12px; text-align: right;">Prix Unitaire</th>
                  <th style="padding: 12px; text-align: right;">Sous-total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>

            <div class="summary">
              <div class="summary-row">
                <span>Sous-total:</span>
                <span>${data.items.reduce((sum, item) => sum + Number(item.subtotal), 0)} FCFA</span>
              </div>
              <div class="summary-row">
                <span>Frais de port:</span>
                <span>${data.shippingCost} FCFA</span>
              </div>
              <div class="summary-row total">
                <span>Total:</span>
                <span>${data.totalAmount} FCFA</span>
              </div>
            </div>

            <div class="delivery-info">
              <h3>Informations de Livraison</h3>
              <p><strong>Destinataire:</strong> ${data.customerName}</p>
              <p><strong>Adresse:</strong> ${data.deliveryAddress}, ${data.deliveryCity}${data.deliveryPostalCode ? ` ${data.deliveryPostalCode}` : ''}</p>
              <p><strong>Mode de Paiement:</strong> ${paymentMethodLabel}</p>
            </div>

            ${
              data.trackingUrl
                ? `<center><a href="${data.trackingUrl}" class="button">Suivre ma Commande</a></center>`
                : ''
            }

            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
              Si vous avez des questions concernant votre commande, n'hésitez pas à nous contacter.
            </p>
          </div>
          <div class="footer">
            <p>© 2026 Cavally Livres - Manuels & Oeuvres Littéraires</p>
            <p>Cet email a été envoyé à ${data.customerEmail}</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate status update email HTML
 */
function generateStatusUpdateHTML(data: StatusUpdateEmailData): string {
  const statusEmoji = {
    pending: '⏳',
    confirmed: '✓',
    in_transit: '🚚',
    out_for_delivery: '📍',
    delivered: '✓✓',
    cancelled: '✗',
  }[data.status] || '📦';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
          .header { background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .status-box { background: #f0f7ff; padding: 20px; border-left: 4px solid #ff6b35; margin: 20px 0; border-radius: 4px; }
          .status-emoji { font-size: 32px; margin-right: 10px; }
          .status-text { font-size: 18px; font-weight: bold; color: #333; }
          .info-box { background: #f9f9f9; padding: 15px; border-radius: 4px; margin: 15px 0; }
          .button { display: inline-block; background: #ff6b35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Mise à Jour de Votre Commande</h1>
          </div>
          <div class="content">
            <p>Bonjour ${data.customerName},</p>
            <p>Votre commande ${data.orderNumber} a été mise à jour.</p>

            <div class="status-box">
              <span class="status-emoji">${statusEmoji}</span>
              <span class="status-text">${data.statusLabel}</span>
            </div>

            <div class="info-box">
              <p><strong>Numéro de Commande:</strong> ${data.orderNumber}</p>
              ${data.estimatedDeliveryDate ? `<p><strong>Livraison Estimée:</strong> ${new Date(data.estimatedDeliveryDate).toLocaleDateString('fr-FR')}</p>` : ''}
              ${data.courierName ? `<p><strong>Livreur:</strong> ${data.courierName}${data.courierPhone ? ` - ${data.courierPhone}` : ''}</p>` : ''}
            </div>

            ${
              data.trackingUrl
                ? `<center><a href="${data.trackingUrl}" class="button">Suivre ma Livraison</a></center>`
                : ''
            }

            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
              Si vous avez des questions, n'hésitez pas à nous contacter.
            </p>
          </div>
          <div class="footer">
            <p>© 2026 Cavally Livres - Manuels & Oeuvres Littéraires</p>
            <p>Cet email a été envoyé à ${data.customerEmail}</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<boolean> {
  try {
    const transporter = getTransporter();
    const html = generateOrderConfirmationHTML(data);

    await transporter.sendMail({
      to: data.customerEmail,
      subject: `Commande Confirmée - ${data.orderNumber}`,
      html,
      text: `Commande ${data.orderNumber} confirmée. Total: ${data.totalAmount} FCFA`,
    });

    console.log(`[Email Service] Order confirmation sent to ${data.customerEmail}`);
    return true;
  } catch (error) {
    console.error('[Email Service] Error sending order confirmation:', error);
    return false;
  }
}

/**
 * Send status update email
 */
export async function sendStatusUpdateEmail(data: StatusUpdateEmailData): Promise<boolean> {
  try {
    const transporter = getTransporter();
    const html = generateStatusUpdateHTML(data);

    await transporter.sendMail({
      to: data.customerEmail,
      subject: `Mise à Jour - Commande ${data.orderNumber}`,
      html,
      text: `Votre commande ${data.orderNumber} est maintenant: ${data.statusLabel}`,
    });

    console.log(`[Email Service] Status update sent to ${data.customerEmail}`);
    return true;
  } catch (error) {
    console.error('[Email Service] Error sending status update:', error);
    return false;
  }
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmationEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  amount: string,
  paymentMethod: string
): Promise<boolean> {
  try {
    const transporter = getTransporter();

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .success-box { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 4px; margin: 20px 0; }
            .info-box { background: #f9f9f9; padding: 15px; border-radius: 4px; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Paiement Reçu</h1>
            </div>
            <div class="content">
              <p>Bonjour ${customerName},</p>
              <div class="success-box">
                <strong>Votre paiement a été reçu avec succès!</strong>
              </div>
              <div class="info-box">
                <p><strong>Numéro de Commande:</strong> ${orderNumber}</p>
                <p><strong>Montant:</strong> ${amount} FCFA</p>
                <p><strong>Mode de Paiement:</strong> ${paymentMethod}</p>
              </div>
              <p>Votre commande sera traitée rapidement. Vous recevrez une notification dès que votre colis sera expédié.</p>
            </div>
            <div class="footer">
              <p>© 2026 Cavally Livres - Manuels & Oeuvres Littéraires</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      to: customerEmail,
      subject: `Paiement Confirmé - ${orderNumber}`,
      html,
      text: `Paiement reçu pour la commande ${orderNumber}. Montant: ${amount} FCFA`,
    });

    console.log(`[Email Service] Payment confirmation sent to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error('[Email Service] Error sending payment confirmation:', error);
    return false;
  }
}
