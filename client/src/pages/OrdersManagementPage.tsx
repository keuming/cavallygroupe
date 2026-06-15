import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, Download, Printer, Eye, Search, Filter } from 'lucide-react';
import type { Order } from '@/../../drizzle/schema';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmée', color: 'bg-blue-100 text-blue-800' },
  in_transit: { label: 'En transit', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Livrée', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800' },
};

export function OrdersManagementPage() {
  const { data: user } = trpc.auth.me.useQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: orders, isLoading } = trpc.orders.list.useQuery(undefined, {
    enabled: user?.role === 'admin',
  });

  const updateStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      // Refresh orders list
      trpc.useUtils().orders.list.invalidate();
    },
  });

  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    return orders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerPhone.includes(searchTerm);

      const matchesStatus = !statusFilter || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    await updateStatusMutation.mutateAsync({
      orderId,
      status: newStatus as any,
    });
  };

  const handlePrint = (order: Order) => {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Bon de Commande ${order.orderNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 20px; }
              .section { margin-bottom: 20px; }
              .section-title { font-weight: bold; border-bottom: 1px solid #000; margin-bottom: 10px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .total { font-weight: bold; font-size: 16px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>BON DE COMMANDE</h1>
              <p>${order.orderNumber}</p>
            </div>
            
            <div class="section">
              <div class="section-title">Informations Client</div>
              <p><strong>Nom:</strong> ${order.customerName}</p>
              <p><strong>Téléphone:</strong> ${order.customerPhone}</p>
              <p><strong>Email:</strong> ${order.customerEmail || 'N/A'}</p>
            </div>
            
            <div class="section">
              <div class="section-title">Adresse de Livraison</div>
              <p>${order.deliveryAddress}</p>
              <p>${order.deliveryCity} ${order.deliveryPostalCode || ''}</p>
            </div>
            
            <div class="section">
              <div class="section-title">Détails de la Commande</div>
              <table>
                <tr>
                  <th>Montant Total</th>
                  <th>Frais de Livraison</th>
                  <th>Statut</th>
                  <th>Méthode de Paiement</th>
                </tr>
                <tr>
                  <td class="total">${Number(order.totalAmount).toFixed(2)} XOF</td>
                  <td>${Number(order.shippingCost || 0).toFixed(2)} XOF</td>
                  <td>${STATUS_LABELS[order.status]?.label || order.status}</td>
                  <td>${order.paymentMethod}</td>
                </tr>
              </table>
            </div>
            
            <div class="section">
              <div class="section-title">Statut du Paiement</div>
              <p>${order.paymentStatus}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownloadList = (order: Order) => {
    // Generate CSV
    const csvContent = `Numéro de Commande,${order.orderNumber}\nClient,${order.customerName}\nTéléphone,${order.customerPhone}\nAdresse,${order.deliveryAddress}\nVille,${order.deliveryCity}\nMontant Total,${order.totalAmount} XOF\nStatut,${order.status}\nDate,${new Date(order.createdAt).toLocaleDateString('fr-FR')}`;

    const element = document.createElement('a');
    element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`);
    element.setAttribute('download', `commande-${order.orderNumber}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Accès refusé. Seuls les administrateurs peuvent accéder à cette page.</p>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Gestion des Commandes</h1>
          <p className="text-gray-600">Gérez et suivez toutes les commandes clients</p>
        </div>

        {/* Filtres */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher par numéro, client ou téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="confirmed">Confirmée</SelectItem>
                <SelectItem value="in_transit">En transit</SelectItem>
                <SelectItem value="delivered">Livrée</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tableau des commandes */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="px-4 py-3 text-left font-semibold">Numéro</th>
                  <th className="px-4 py-3 text-left font-semibold">Client</th>
                  <th className="px-4 py-3 text-left font-semibold">Téléphone</th>
                  <th className="px-4 py-3 text-left font-semibold">Montant</th>
                  <th className="px-4 py-3 text-left font-semibold">Statut</th>
                  <th className="px-4 py-3 text-left font-semibold">Paiement</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm">{order.orderNumber}</td>
                    <td className="px-4 py-3">{order.customerName}</td>
                    <td className="px-4 py-3">{order.customerPhone}</td>
                    <td className="px-4 py-3 font-semibold">{Number(order.totalAmount).toFixed(2)} XOF</td>
                    <td className="px-4 py-3">
                      <Badge className={STATUS_LABELS[order.status]?.color}>
                        {STATUS_LABELS[order.status]?.label || order.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={order.paymentStatus === 'completed' ? 'default' : 'secondary'}>
                        {order.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsDetailsOpen(true);
                        }}
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handlePrint(order)}
                        title="Imprimer le bon"
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownloadList(order)}
                        title="Télécharger la liste"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune commande trouvée</p>
          </div>
        )}

        {/* Modal de détails */}
        {selectedOrder && (
          <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Détails de la Commande</DialogTitle>
                <DialogDescription>{selectedOrder.orderNumber}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Informations client */}
                <div>
                  <h3 className="font-semibold mb-3">Informations Client</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Nom</p>
                      <p className="font-medium">{selectedOrder.customerName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Téléphone</p>
                      <p className="font-medium">{selectedOrder.customerPhone}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Email</p>
                      <p className="font-medium">{selectedOrder.customerEmail || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Date</p>
                      <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                </div>

                {/* Adresse de livraison */}
                <div>
                  <h3 className="font-semibold mb-3">Adresse de Livraison</h3>
                  <p className="text-sm">{selectedOrder.deliveryAddress}</p>
                  <p className="text-sm">{selectedOrder.deliveryCity} {selectedOrder.deliveryPostalCode}</p>
                </div>

                {/* Statut et paiement */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Statut de la Commande</label>
                    <Select
                      value={selectedOrder.status}
                      onValueChange={(value) =>
                        handleStatusChange(selectedOrder.id, value)
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="confirmed">Confirmée</SelectItem>
                        <SelectItem value="in_transit">En transit</SelectItem>
                        <SelectItem value="delivered">Livrée</SelectItem>
                        <SelectItem value="cancelled">Annulée</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Statut du Paiement</label>
                    <p className="mt-2 font-medium">{selectedOrder.paymentStatus}</p>
                  </div>
                </div>

                {/* Montants */}
                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span>Montant Total</span>
                    <span className="font-semibold">{Number(selectedOrder.totalAmount).toFixed(2)} XOF</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frais de Livraison</span>
                    <span>{Number(selectedOrder.shippingCost || 0).toFixed(2)} XOF</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handlePrint(selectedOrder)}
                    className="flex-1"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimer
                  </Button>
                  <Button
                    onClick={() => handleDownloadList(selectedOrder)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}
