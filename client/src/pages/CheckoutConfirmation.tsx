import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { CheckoutLayout } from '@/components/CheckoutLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  CheckCircle,
  Package,
  Truck,
  CreditCard,
  Download,
  Share2,
  X,
  ArrowRight,
} from 'lucide-react';

interface OrderData {
  orderNumber: string;
  totalAmount: string;
  estimatedDelivery: string;
  paymentMethod: string;
  shippingAddress: string;
}

export function CheckoutConfirmation() {
  const [, navigate] = useLocation();
  const [showModal, setShowModal] = useState(true);
  const [orderData] = useState<OrderData>({
    orderNumber: 'ORD-20260406-12345',
    totalAmount: '61 360 FCFA',
    estimatedDelivery: '8 avril 2026',
    paymentMethod: 'Wave Money',
    shippingAddress: 'Jean Dupont, 123 Rue de la Paix, Abidjan',
  });

  useEffect(() => {
    // Clear session storage
    sessionStorage.removeItem('shippingData');
    sessionStorage.removeItem('paymentData');
  }, []);

  const handleDownloadInvoice = () => {
    // In a real app, this would generate and download a PDF invoice
    alert('Téléchargement de la facture en cours...');
  };

  const handleShareOrder = () => {
    const text = `J'ai commandé chez Cavally Livres! Numéro de commande: ${orderData.orderNumber}`;
    if (navigator.share) {
      navigator.share({
        title: 'Cavally Livres - Commande confirmée',
        text,
      });
    } else {
      alert(text);
    }
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  return (
    <>
      {/* Modal de Confirmation */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-0 shadow-2xl">
            <div className="p-8">
              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>

              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <CheckCircle className="w-20 h-20 text-green-600" />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">
                Réservation confirmée!
              </h2>
              <p className="text-center text-slate-600 mb-6">
                Votre commande a été enregistrée avec succès
              </p>

              {/* Order Number */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6 text-center border border-blue-200">
                <p className="text-xs text-slate-600 mb-1">Numéro de commande</p>
                <p className="text-2xl font-bold text-blue-600 font-mono">
                  {orderData.orderNumber}
                </p>
              </div>

              {/* Quick Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-slate-600">
                    Livraison: <span className="font-medium text-slate-900">{orderData.estimatedDelivery}</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CreditCard className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-slate-600">
                    Montant: <span className="font-medium text-slate-900">{orderData.totalAmount}</span>
                  </span>
                </div>
              </div>

              {/* Confirmation Message */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 text-sm text-green-800">
                <p className="font-medium mb-1">✓ Confirmation envoyée</p>
                <p className="text-xs">Un SMS de confirmation a été envoyé à votre numéro</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setShowModal(false);
                    navigate('/account');
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  Voir ma commande
                </Button>
                <Button
                  onClick={() => setShowModal(false)}
                  variant="outline"
                  className="w-full"
                >
                  Continuer
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <CheckoutLayout currentStep={4}>
        <div className="space-y-6">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Commande confirmée!
          </h2>
          <p className="text-lg text-slate-600">
            Merci pour votre achat. Votre commande a été enregistrée avec succès.
          </p>
        </div>

        {/* Order Number */}
        <Card className="p-6 bg-blue-50 border-blue-200 text-center">
          <p className="text-sm text-slate-600 mb-2">Numéro de commande</p>
          <p className="text-3xl font-bold text-blue-600 font-mono">
            {orderData.orderNumber}
          </p>
          <p className="text-xs text-slate-600 mt-2">
            Conservez ce numéro pour suivre votre commande
          </p>
        </Card>

        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Delivery Info */}
          <Card className="p-4 border-slate-200">
            <div className="flex items-start gap-3">
              <Truck className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  Livraison prévue
                </h3>
                <p className="text-sm text-slate-600">{orderData.estimatedDelivery}</p>
              </div>
            </div>
          </Card>

          {/* Payment Info */}
          <Card className="p-4 border-slate-200">
            <div className="flex items-start gap-3">
              <CreditCard className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  Méthode de paiement
                </h3>
                <p className="text-sm text-slate-600">{orderData.paymentMethod}</p>
              </div>
            </div>
          </Card>

          {/* Shipping Address */}
          <Card className="p-4 border-slate-200 md:col-span-2">
            <div className="flex items-start gap-3">
              <Package className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-1">
                  Adresse de livraison
                </h3>
                <p className="text-sm text-slate-600">{orderData.shippingAddress}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Order Items Summary */}
        <Card className="p-4 border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Articles commandés</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div>
                <p className="font-medium text-slate-900">Mathématiques 6ème</p>
                <p className="text-sm text-slate-600">Quantité: 2</p>
              </div>
              <p className="font-medium text-slate-900">25 000 FCFA</p>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-slate-900">Français 5ème</p>
                <p className="text-sm text-slate-600">Quantité: 1</p>
              </div>
              <p className="font-medium text-slate-900">11 000 FCFA</p>
            </div>
          </div>
        </Card>

        {/* Total Amount */}
        <Card className="p-4 bg-slate-50 border-slate-200">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-900">Montant total</span>
            <span className="text-2xl font-bold text-blue-600">
              {orderData.totalAmount}
            </span>
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="p-4 bg-green-50 border-green-200">
          <h3 className="font-semibold text-green-900 mb-3">Prochaines étapes</h3>
          <ul className="space-y-2 text-sm text-green-800">
            <li className="flex gap-2">
              <span className="font-bold">1.</span>
              <span>Vous recevrez un SMS de confirmation avec le lien de suivi</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">2.</span>
              <span>Notre équipe prépare votre commande</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">3.</span>
              <span>Vous recevrez un SMS quand le colis est en route</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold">4.</span>
              <span>Livraison à votre adresse</span>
            </li>
          </ul>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={handleDownloadInvoice}
            variant="outline"
            className="flex-1 gap-2"
          >
            <Download className="w-4 h-4" />
            Télécharger la facture
          </Button>
          <Button
            onClick={handleShareOrder}
            variant="outline"
            className="flex-1 gap-2"
          >
            <Share2 className="w-4 h-4" />
            Partager
          </Button>
        </div>

        {/* Continue Shopping Button */}
        <Button
          onClick={handleContinueShopping}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
        >
          Continuer vos achats
        </Button>

        {/* Support Info */}
        <Card className="p-4 bg-slate-50 border-slate-200 text-center">
          <p className="text-sm text-slate-600 mb-2">Besoin d'aide?</p>
          <p className="text-sm font-medium text-slate-900">
            Contactez-nous: <span className="text-blue-600">+225 05 86 00 01 03</span>
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Email: online@cavallylivres.com
          </p>
        </Card>
      </div>
    </CheckoutLayout>
    </>
  );
}
