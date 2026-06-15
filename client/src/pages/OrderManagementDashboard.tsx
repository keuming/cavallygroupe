import { useState } from "react";
import { useLocation } from "wouter";
import {
  Package,
  ChevronLeft,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Truck,
  AlertCircle,
  MessageSquare,
  Printer,
  Edit2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useDarkMode } from "@/hooks/useDarkMode";

type OrderStatus = "pending" | "confirmed" | "in_transit" | "delivered" | "cancelled";

const STATUS_CONFIG = {
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  confirmed: { label: "Confirmée", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  in_transit: { label: "En transit", color: "bg-purple-100 text-purple-800", icon: Truck },
  delivered: { label: "Livrée", color: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelled: { label: "Annulée", color: "bg-red-100 text-red-800", icon: AlertCircle },
};

export default function OrderManagementDashboard() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { isDarkMode } = useDarkMode();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Récupérer les commandes
  const { data: orders } = trpc.orders.list.useQuery(undefined);
  const updateOrderStatusMutation = trpc.orders.updateStatus.useMutation();
  const utils = trpc.useUtils();

  // Filtrer les commandes
  const filteredOrders = orders?.filter((order: any) => {
    const matchesSearch =
      order.orderNumber?.includes(searchQuery) ||
      order.customerEmail?.includes(searchQuery) ||
      order.customerName?.includes(searchQuery);
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (orderId: number, newStatus: OrderStatus) => {
    updateOrderStatusMutation.mutate(
      { orderId, status: newStatus },
      {
        onSuccess: () => {
          utils.orders.list.invalidate();
          alert("Statut de la commande mis à jour!");
        },
      }
    );
  };

  const handlePrintOrder = (order: any) => {
    const content = `
      CAVALLY GROUPE - BON DE COMMANDE
      ================================
      
      Référence: ${order.orderNumber}
      Date: ${new Date(order.createdAt).toLocaleDateString("fr-CI")}
      
      CLIENT
      ------
      Nom: ${order.customerName}
      Email: ${order.customerEmail}
      Téléphone: ${order.customerPhone || "N/A"}
      
      ADRESSE DE LIVRAISON
      -------------------
      ${order.shippingAddress || "Non spécifiée"}
      
      ARTICLES
      --------
      ${order.items?.map((item: any) => `- ${item.title} x${item.quantity} = ${item.price}XOF`).join("\n")}
      
      TOTAL: ${order.total}XOF
      STATUT: ${STATUS_CONFIG[order.status as OrderStatus].label}
      
      ================================
    `;
    const printWindow = window.open("", "", "width=600,height=800");
    if (printWindow) {
      printWindow.document.write("<pre>" + content + "</pre>");
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-lg font-semibold">Accès refusé</p>
          <p className="text-gray-600">Vous n'avez pas les permissions pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header */}
      <div
        className={`border-b ${
          isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } sticky top-0 z-40 shadow-sm`}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin")}
              className={`${
                isDarkMode
                  ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold text-yellow-600 flex items-center gap-2">
              <Package className="w-8 h-8" />
              Gestion des Commandes
            </h1>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Rechercher par référence, email ou nom..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                    : "bg-white border-gray-200"
                }`}
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant={selectedStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStatus("all")}
                className={selectedStatus === "all" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
              >
                Toutes
              </Button>
              {(Object.keys(STATUS_CONFIG) as OrderStatus[]).map((status) => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStatus(status)}
                  className={selectedStatus === status ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                >
                  {STATUS_CONFIG[status].label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="container mx-auto px-4 py-8">
        {filteredOrders && filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table
              className={`w-full border-collapse ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } rounded-lg shadow-md`}
            >
              <thead>
                <tr
                  className={`border-b ${
                    isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-100 border-gray-200"
                  }`}
                >
                  <th className="px-4 py-3 text-left font-semibold">Référence</th>
                  <th className="px-4 py-3 text-left font-semibold">Client</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Total</th>
                  <th className="px-4 py-3 text-left font-semibold">Statut</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order: any) => {
                  const statusConfig = STATUS_CONFIG[order.status as OrderStatus];
                  const StatusIcon = statusConfig.icon;

                  return (
                    <tr
                      key={order.id}
                      className={`border-b ${
                        isDarkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"
                      } transition-colors`}
                    >
                      <td className="px-4 py-3 font-semibold text-yellow-600">{order.orderNumber}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{order.customerName}</p>
                          <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {order.customerEmail}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(order.createdAt).toLocaleDateString("fr-CI")}
                      </td>
                      <td className="px-4 py-3 font-semibold text-yellow-600">
                        {order.total.toLocaleString("fr-CI", {
                          style: "currency",
                          currency: "XOF",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <StatusIcon className="w-4 h-4" />
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                            title="Voir les détails"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePrintOrder(order)}
                            title="Imprimer"
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const nextStatus = getNextStatus(order.status);
                              if (nextStatus) handleStatusChange(order.id, nextStatus);
                            }}
                            title="Changer le statut"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className={`text-lg ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              Aucune commande trouvée
            </p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            className={`rounded-lg shadow-xl max-w-2xl w-full p-6 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Détails de la commande</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedOrder(null)}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Référence</p>
                  <p className="font-semibold">{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-semibold">
                    {new Date(selectedOrder.createdAt).toLocaleDateString("fr-CI")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Client</p>
                  <p className="font-semibold">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold text-sm">{selectedOrder.customerEmail}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Articles</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between">
                      <span>{item.title}</span>
                      <span className="font-semibold">
                        {item.quantity}x {item.price.toLocaleString("fr-CI", {
                          style: "currency",
                          currency: "XOF",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-yellow-600">
                    {selectedOrder.total.toLocaleString("fr-CI", {
                      style: "currency",
                      currency: "XOF",
                    })}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handlePrintOrder(selectedOrder)}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimer
                  </Button>
                  <Button
                    onClick={() => setSelectedOrder(null)}
                    variant="outline"
                    className="flex-1"
                  >
                    Fermer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getNextStatus(currentStatus: OrderStatus): OrderStatus | null {
  const statusFlow: Record<OrderStatus, OrderStatus> = {
    pending: "confirmed",
    confirmed: "in_transit",
    in_transit: "delivered",
    delivered: "delivered",
    cancelled: "cancelled",
  };
  return statusFlow[currentStatus] || null;
}
