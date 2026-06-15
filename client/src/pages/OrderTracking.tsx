import { useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import { ArrowLeft, Loader2, MapPin, Calendar, Phone, User, Search } from 'lucide-react';
import { BookOpen } from 'lucide-react';

const STATUS_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: 'En attente', color: 'bg-gray-100 text-gray-800', icon: '⏳' },
  confirmed: { label: 'Confirmée', color: 'bg-blue-100 text-blue-800', icon: '✓' },
  preparing: { label: 'En préparation', color: 'bg-yellow-100 text-yellow-800', icon: '📦' },
  in_transit: { label: 'En transit', color: 'bg-purple-100 text-purple-800', icon: '🚚' },
  out_for_delivery: { label: 'En cours de livraison', color: 'bg-blue-100 text-blue-800', icon: '🚗' },
  delivered: { label: 'Livrée', color: 'bg-green-100 text-green-800', icon: '✓✓' },
  cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800', icon: '✕' },
};

export default function OrderTrackingPage() {
  const [, navigate] = useLocation();
  const [orderNumber, setOrderNumber] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState(false);

  const { data: order, isLoading: loadingOrder } = trpc.orders.getByNumber.useQuery(
    { orderNumber },
    { enabled: searchSubmitted && !!orderNumber }
  );

  const { data: tracking, isLoading: loadingTracking } = trpc.tracking.getTracking.useQuery(
    { orderId: order?.id || 0 },
    { enabled: !!order?.id }
  );

  const { data: history, isLoading: loadingHistory } = trpc.tracking.getHistory.useQuery(
    { orderId: order?.id || 0 },
    { enabled: !!order?.id }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderNumber.trim()) {
      setSearchSubmitted(true);
    }
  };

  const isLoading = loadingOrder || loadingTracking || loadingHistory;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <nav className="bg-white border-b border-blue-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 bg-[#005f8a] rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-[#005f8a]">Cavally Livres</h1>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Suivi de votre commande</h2>

        {/* Search Card */}
        <Card className="border-blue-200 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Entrez votre numéro de commande
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-4">
              <Input
                placeholder="Ex: ORD-20260212-12345"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="flex-1"
              />
              <Button
                type="submit"
                className="bg-[#005f8a] hover:bg-[#004a6a] text-white"
              >
                Rechercher
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#005f8a]" />
          </div>
        )}

        {/* Order Found */}
        {order && !isLoading && (
          <div className="max-w-3xl">
            {/* Order Summary */}
            <Card className="border-blue-200 mb-6">
              <CardHeader>
                <CardTitle>Détails de la commande</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Numéro de commande</p>
                    <p className="font-bold text-[#005f8a]">{order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Montant</p>
                    <p className="font-bold text-gray-900">
                      {Number(order.totalAmount).toLocaleString('fr-CI')} FCFA
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Statut de paiement</p>
                    <p className="font-semibold">
                      {order.paymentStatus === 'completed' ? (
                        <span className="text-green-600">✓ Payé</span>
                      ) : (
                        <span className="text-yellow-600">En attente</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date de commande</p>
                    <p className="font-semibold">
                      {new Date(order.createdAt).toLocaleDateString('fr-CI')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Tracking Status */}
            {tracking && (
              <Card className="border-2 border-blue-200 mb-6">
                <CardHeader>
                  <CardTitle>Statut actuel de la livraison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className={`text-4xl ${STATUS_LABELS[tracking.status]?.color || 'bg-gray-100'} rounded-lg p-4`}>
                      {STATUS_LABELS[tracking.status]?.icon || '?'}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {STATUS_LABELS[tracking.status]?.label || tracking.statusLabel}
                      </h3>
                      {tracking.description && (
                        <p className="text-gray-600 mt-2">{tracking.description}</p>
                      )}
                      {tracking.estimatedDeliveryDate && (
                        <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Livraison estimée: {new Date(tracking.estimatedDeliveryDate).toLocaleDateString('fr-CI')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Delivery Details */}
                  {tracking.status !== 'pending' && (
                    <div className="mt-6 pt-6 border-t space-y-4">
                      {tracking.location && (
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-[#005f8a] mt-1" />
                          <div>
                            <p className="font-semibold text-gray-900">Localisation</p>
                            <p className="text-gray-600">{tracking.location}</p>
                          </div>
                        </div>
                      )}

                      {tracking.courierName && (
                        <div className="flex items-start gap-3">
                          <User className="w-5 h-5 text-[#005f8a] mt-1" />
                          <div>
                            <p className="font-semibold text-gray-900">Livreur</p>
                            <p className="text-gray-600">{tracking.courierName}</p>
                            {tracking.courierPhone && (
                              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                <Phone className="w-4 h-4" />
                                {tracking.courierPhone}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Timeline History */}
            {history && history.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Historique de la commande</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {history.map((item, index) => {
                      const itemStatus = STATUS_LABELS[item.status] || { label: item.statusLabel, color: 'bg-gray-100', icon: '•' };
                      return (
                        <div key={item.id} className="relative">
                          {/* Timeline line */}
                          {index < history.length - 1 && (
                            <div className="absolute left-6 top-12 w-0.5 h-12 bg-gray-200" />
                          )}

                          {/* Timeline item */}
                          <div className="flex gap-4">
                            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${itemStatus.color}`}>
                              {itemStatus.icon}
                            </div>
                            <div className="flex-1 pt-1">
                              <h4 className="font-semibold text-gray-900">{itemStatus.label}</h4>
                              {item.description && (
                                <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                              )}
                              <p className="text-xs text-gray-500 mt-2">
                                {new Date(item.createdAt).toLocaleDateString('fr-CI')} à{' '}
                                {new Date(item.createdAt).toLocaleTimeString('fr-CI', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Delivery Address */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Adresse de livraison</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold text-gray-900">{order.customerName}</p>
                <p className="text-gray-600 mt-1">{order.deliveryAddress}</p>
                <p className="text-gray-600">{order.deliveryCity}</p>
                {order.deliveryPostalCode && (
                  <p className="text-gray-600">{order.deliveryPostalCode}</p>
                )}
                <p className="text-gray-600 mt-2">📞 {order.customerPhone}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* No Order Found */}
        {searchSubmitted && !order && !isLoading && (
          <Card className="max-w-2xl border-blue-200">
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600 text-lg mb-4">
                Aucune commande trouvée avec le numéro: <span className="font-bold">{orderNumber}</span>
              </p>
              <p className="text-gray-500 text-sm mb-6">
                Vérifiez que vous avez entré le bon numéro de commande (format: ORD-YYYYMMDD-XXXXX)
              </p>
              <Button
                onClick={() => {
                  setOrderNumber('');
                  setSearchSubmitted(false);
                }}
                className="bg-[#005f8a] hover:bg-[#004a6a]"
              >
                Nouvelle recherche
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="mt-8 max-w-2xl bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-2">Besoin d'aide?</h3>
            <p className="text-sm text-blue-800 mb-3">
              Si vous avez des questions sur votre commande, contactez-nous:
            </p>
            <div className="text-sm text-blue-800 space-y-1">
              <p>📞 +225 05 86 000 103</p>
              <p>📧 online@cavallylivres.com</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
