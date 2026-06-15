import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle, Clock, Truck, Package, XCircle } from "lucide-react";
import { OrderItemsDetails } from "./OrderItemsDetails";

type OrderStatus = "pending" | "confirmed" | "in_transit" | "delivered" | "cancelled";
type NotificationChannel = "email" | "sms" | "whatsapp";

const statusConfig: Record<OrderStatus, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: "En Attente", icon: <Clock className="w-4 h-4" />, color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Confirmée", icon: <CheckCircle className="w-4 h-4" />, color: "bg-blue-100 text-blue-800" },
  in_transit: { label: "En Transit", icon: <Truck className="w-4 h-4" />, color: "bg-purple-100 text-purple-800" },
  delivered: { label: "Livrée", icon: <Package className="w-4 h-4" />, color: "bg-green-100 text-green-800" },
  cancelled: { label: "Annulée", icon: <XCircle className="w-4 h-4" />, color: "bg-red-100 text-red-800" },
};

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  status: OrderStatus;
  totalAmount: string;
  paymentMethod: string;
  paymentStatus: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPostalCode: string | null;
  items?: any[];
  createdAt: Date;
  updatedAt: Date;
}

interface OrderManagementPanelProps {
  statusFilter?: string | null;
}

export function OrderManagementPanel({ statusFilter }: OrderManagementPanelProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [notificationChannel, setNotificationChannel] = useState<NotificationChannel>("email");
  const [courierName, setCourierName] = useState("");
  const [courierPhone, setCourierPhone] = useState("");
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: orders, isLoading, refetch } = trpc.orderManagement.getAllOrders.useQuery();
  const { data: stats } = trpc.orderManagement.getOrderStats.useQuery();
  const utils = trpc.useUtils();

  const updateStatusMutation = trpc.orderManagement.updateOrderStatus.useMutation({
    onSuccess: () => {
      utils.orderManagement.getAllOrders.invalidate();
      utils.orderManagement.getOrderStats.invalidate();
      setSelectedOrder(null);
    },
  });

  const acceptOrderMutation = trpc.orderManagement.acceptOrder.useMutation({
    onSuccess: () => {
      utils.orderManagement.getAllOrders.invalidate();
      utils.orderManagement.getOrderStats.invalidate();
      setSelectedOrder(null);
      alert('Commande acceptée avec succès');
    },
    onError: (error) => {
      console.error('Erreur lors de l\'acceptation:', error);
      alert('Erreur: ' + error.message);
    },
  });

  const rejectOrderMutation = trpc.orderManagement.rejectOrder.useMutation({
    onSuccess: () => {
      utils.orderManagement.getAllOrders.invalidate();
      utils.orderManagement.getOrderStats.invalidate();
      setSelectedOrder(null);
      setRejectionReason("");
      alert('Commande refusée avec succès');
    },
    onError: (error) => {
      console.error('Erreur lors du refus:', error);
      alert('Erreur: ' + error.message);
    },
  });

  const markAsInTransitMutation = trpc.orderManagement.markAsInTransit.useMutation({
    onSuccess: () => {
      utils.orderManagement.getAllOrders.invalidate();
      utils.orderManagement.getOrderStats.invalidate();
      setSelectedOrder(null);
      setCourierName("");
      setCourierPhone("");
      setEstimatedDeliveryDate("");
      alert('Commande marquée en transit avec succès');
    },
    onError: (error) => {
      console.error('Erreur lors du marquage en transit:', error);
      alert('Erreur: ' + error.message);
    },
  });

  const markAsDeliveredMutation = trpc.orderManagement.markAsDelivered.useMutation({
    onSuccess: () => {
      utils.orderManagement.getAllOrders.invalidate();
      utils.orderManagement.getOrderStats.invalidate();
      setSelectedOrder(null);
      alert('Commande marquée comme livrée avec succès');
    },
    onError: (error) => {
      console.error('Erreur lors du marquage comme livrée:', error);
      alert('Erreur: ' + error.message);
    },
  });

  const handleAcceptOrder = async () => {
    if (!selectedOrder) return;
    await acceptOrderMutation.mutateAsync({
      orderId: selectedOrder.id,
      notificationChannel,
    });
  };

  const handleRejectOrder = async () => {
    if (!selectedOrder) return;
    await rejectOrderMutation.mutateAsync({
      orderId: selectedOrder.id,
      notificationChannel,
      reason: rejectionReason,
    });
  };

  const handleMarkAsInTransit = async () => {
    if (!selectedOrder || !courierName || !courierPhone) return;
    await markAsInTransitMutation.mutateAsync({
      orderId: selectedOrder.id,
      notificationChannel,
      courierName,
      courierPhone,
      estimatedDeliveryDate,
    });
  };

  const handleMarkAsDelivered = async () => {
    if (!selectedOrder) return;
    await markAsDeliveredMutation.mutateAsync({
      orderId: selectedOrder.id,
      notificationChannel,
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Chargement des commandes...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Confirmées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#005f8a]">{stats.confirmed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">En Transit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.inTransit}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Livrées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Annulées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Gestion des Commandes</CardTitle>
          <CardDescription>Gérez les statuts et envoyez des notifications aux clients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders && orders.length > 0 ? (
              [...orders]
                .filter((order) => !statusFilter || order.status === statusFilter)
                .reverse()
                .map((order) => (
                <div key={order.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{order.orderNumber}</h3>
                      <p className="text-sm text-gray-600">{order.customerName}</p>
                    </div>
                    <Badge className={statusConfig[order.status as OrderStatus].color}>
                      {statusConfig[order.status as OrderStatus].label}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Montant:</span> {order.totalAmount} FCFA
                    </div>
                    <div>
                      <span className="font-medium">Téléphone:</span> {order.customerPhone}
                    </div>
                    <div>
                      <span className="font-medium">Paiement:</span> {order.paymentMethod}
                    </div>
                    <div>
                      <span className="font-medium">Statut paiement:</span> {order.paymentStatus}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Livraison:</span> {order.deliveryAddress}, {order.deliveryCity}
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-orange-500 hover:bg-orange-600 text-white" size="sm" onClick={() => setSelectedOrder(order)}>
                        Gérer la commande
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Gérer la commande {order.orderNumber}</DialogTitle>
                        <DialogDescription>Sélectionnez une action et un canal de notification</DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                        {/* Order Items */}
                        <OrderItemsDetails orderId={order.id} />

                        {/* Notification Channel */}
                        <div>
                          <Label>Canal de notification</Label>
                          <Select value={notificationChannel} onValueChange={(value: any) => setNotificationChannel(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="sms">SMS</SelectItem>
                              <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Status-specific actions - moved to action buttons section below */}

                        {/* Livreur info - shown for active orders */}
                        {order.status !== "delivered" && order.status !== "cancelled" && (
                          <div className="space-y-2">
                            <Label>Livreur</Label>
                            <Input
                              placeholder="Nom du livreur"
                              value={courierName}
                              onChange={(e) => setCourierName(e.target.value)}
                            />
                            <Input
                              placeholder="Téléphone du livreur"
                              value={courierPhone}
                              onChange={(e) => setCourierPhone(e.target.value)}
                            />
                            <Input
                              type="date"
                              placeholder="Date de livraison estimée"
                              value={estimatedDeliveryDate}
                              onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                            />
                          </div>
                        )}

                        {/* Action buttons - all available */}
                        <div className="space-y-2">
                          {order.status === "pending" && (
                            <Button
                              onClick={handleAcceptOrder}
                              disabled={acceptOrderMutation.isPending}
                              className="w-full bg-green-600 hover:bg-green-700"
                            >
                              {acceptOrderMutation.isPending ? "Acceptation..." : "Accepter la commande"}
                            </Button>
                          )}

                          {order.status === "pending" && (
                            <div className="space-y-2">
                              <Label>Raison du refus (optionnel)</Label>
                              <Textarea
                                placeholder="Entrez la raison du refus..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                              />
                              <Button
                                onClick={handleRejectOrder}
                                disabled={rejectOrderMutation.isPending}
                                variant="destructive"
                                className="w-full"
                              >
                                {rejectOrderMutation.isPending ? "Refus..." : "Refuser la commande"}
                              </Button>
                            </div>
                          )}

                          {order.status !== "in_transit" && order.status !== "delivered" && (
                            <Button
                              onClick={handleMarkAsInTransit}
                              disabled={markAsInTransitMutation.isPending || !courierName || !courierPhone}
                              className="w-full bg-purple-600 hover:bg-purple-700"
                            >
                              {markAsInTransitMutation.isPending ? "Envoi..." : "Marquer comme en transit"}
                            </Button>
                          )}

                          {order.status !== "delivered" && (
                            <Button
                              onClick={handleMarkAsDelivered}
                              disabled={markAsDeliveredMutation.isPending}
                              className="w-full bg-green-600 hover:bg-green-700"
                            >
                              {markAsDeliveredMutation.isPending ? "Livraison..." : "Marquer comme livrée"}
                            </Button>
                          )}
                        </div>

                        {order.status === "delivered" && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              <span>Commande livrée avec succès</span>
                            </div>
                          </div>
                        )}

                        {order.status === "cancelled" && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4" />
                              <span>Commande annulée</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">Aucune commande trouvée</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
