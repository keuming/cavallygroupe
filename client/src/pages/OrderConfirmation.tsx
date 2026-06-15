import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ArrowRight,
  Download,
  Share2,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';

interface OrderItem {
  productId: number;
  quantity: number;
  unitPrice: string;
  subtotal: string;
}

interface OrderData {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: string;
  shippingCost: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPostalCode?: string;
  createdAt: Date;
  items?: OrderItem[];
}

export default function OrderConfirmation() {
  const [, navigate] = useLocation();
  const [orderId, setOrderId] = useState<number | null>(null);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get orderId from URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('orderId');
    if (id) {
      setOrderId(Number(id));
    } else {
      setIsLoading(false);
    }
  }, []);

  const { data: orderData, isLoading: isLoadingOrder } = trpc.orders.getById.useQuery(
    { id: orderId || 0 },
    { enabled: !!orderId }
  );

  const { data: trackingData } = trpc.tracking.getTracking.useQuery(
    { orderId: orderId || 0 },
    { enabled: !!orderId }
  );

  useEffect(() => {
    if (orderData) {
      setOrder(orderData as OrderData);
      setIsLoading(false);
    }
  }, [orderData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      in_transit: 'En transit',
      out_for_delivery: 'En cours de livraison',
      delivered: 'Livrée',
      cancelled: 'Annulée',
    };
    return labels[status] || status;
  };

  const getPaymentStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'En attente',
      completed: 'Payée',
      failed: 'Échouée',
      refunded: 'Remboursée',
    };
    return labels[status] || status;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      wave: '📱 Wave Money',
      moov: '💳 Moov Money',
      mtn: '📲 MTN Money',
      orange: '🟠 Orange Money',
      stripe: '💳 Carte Bancaire',
      cash: '💵 Espèces à la Livraison',
    };
    return labels[method] || method;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const text = `Ma commande ${order?.orderNumber} a été confirmée! Total: ${order?.totalAmount} FCFA`;
    if (navigator.share) {
      navigator.share({
        title: 'Confirmation de Commande',
        text,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Lien copié dans le presse-papiers');
    }
  };

  if (isLoading || isLoadingOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005f8a] mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre commande...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800 text-center">
                Commande non trouvée. Veuillez vérifier le lien ou contacter le support.
              </p>
              <Button
                onClick={() => navigate('/')}
                className="w-full mt-4 bg-[#005f8a] hover:bg-[#004a6a]"
              >
                Retour à l'accueil
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      {/* Navigation */}
      <nav className="mb-8 flex items-center justify-between max-w-4xl mx-auto">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="w-10 h-10 bg-[#005f8a] rounded-lg flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-[#005f8a]">Cavally Livres</h1>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto">
        {/* Header with Success Message */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Commande Confirmée!</h1>
          <p className="text-gray-600">
            Merci pour votre achat. Votre commande a été reçue et sera traitée rapidement.
          </p>
        </div>

        {/* Order Number and Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-1">Numéro de Commande</p>
                <p className="text-2xl font-bold text-[#005f8a]">{order.orderNumber}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-1">Statut de Commande</p>
                <Badge className={`${getStatusColor(order.status)} text-sm`}>
                  {getStatusLabel(order.status)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-1">Statut de Paiement</p>
                <Badge className={`${getStatusColor(order.paymentStatus)} text-sm`}>
                  {getPaymentStatusLabel(order.paymentStatus)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Résumé de la Commande
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Items List */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Articles Commandés</h3>
              <div className="space-y-3">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">Produit #{item.productId}</p>
                        <p className="text-sm text-gray-600">
                          Quantité: {item.quantity} × {item.unitPrice} FCFA
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">{item.subtotal} FCFA</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">Aucun article trouvé</p>
                )}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span>
                <span>
                  {order.items
                    ? order.items.reduce((sum, item) => sum + Number(item.subtotal), 0)
                    : 0}{' '}
                  FCFA
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Frais de port</span>
                <span>{order.shippingCost} FCFA</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-[#005f8a] pt-2 border-t">
                <span>Total</span>
                <span>{order.totalAmount} FCFA</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Mode de Paiement</p>
              <p className="font-semibold text-gray-900">
                {getPaymentMethodLabel(order.paymentMethod)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Informations de Livraison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recipient Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Destinataire</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-gray-600 min-w-fit">Nom:</span>
                    <span className="font-medium text-gray-900">{order.customerName}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-gray-600 mt-1 min-w-fit" />
                    <span className="font-medium text-gray-900">{order.customerPhone}</span>
                  </div>
                  {order.customerEmail && (
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-gray-600 mt-1 min-w-fit" />
                      <span className="font-medium text-gray-900">{order.customerEmail}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Adresse de Livraison</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-600 mt-1 min-w-fit" />
                    <div>
                      <p className="font-medium text-gray-900">{order.deliveryAddress}</p>
                      <p className="text-gray-600">
                        {order.deliveryCity}
                        {order.deliveryPostalCode && `, ${order.deliveryPostalCode}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tracking Section */}
        {trackingData && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Suivi de Livraison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{trackingData.statusLabel}</p>
                    <p className="text-sm text-gray-600">{trackingData.description}</p>
                    {trackingData.estimatedDeliveryDate && (
                      <p className="text-sm text-[#005f8a] mt-1">
                        Livraison estimée:{' '}
                        {new Date(trackingData.estimatedDeliveryDate).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                  <Truck className="w-8 h-8 text-[#005f8a]" />
                </div>

                {trackingData.courierName && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Livreur</p>
                    <p className="font-medium text-gray-900">{trackingData.courierName}</p>
                    {trackingData.courierPhone && (
                      <p className="text-sm text-gray-600">{trackingData.courierPhone}</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Imprimer
          </Button>

          <Button
            onClick={handleShare}
            variant="outline"
            className="flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Partager
          </Button>

          <Button
            onClick={() => navigate('/')}
            className="bg-[#005f8a] hover:bg-[#004a6a] flex items-center justify-center gap-2"
          >
            Continuer les achats
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Help Section */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-gray-900 mb-2">Besoin d'aide?</h3>
            <p className="text-gray-600 text-sm mb-3">
              Si vous avez des questions concernant votre commande, n'hésitez pas à nous contacter.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Contacter le Support
              </Button>
              <Button variant="outline" size="sm">
                Voir l'historique
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
