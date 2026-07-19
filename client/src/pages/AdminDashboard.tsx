import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { BarChart3, Package, ShoppingCart, AlertTriangle, Plus, Edit2, Trash2, BookOpen, X, Bell, Calendar, TrendingUp, Settings, QrCode } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

import { OrderManagementPanel } from "@/components/OrderManagementPanel";
import { SupplyListsPanel } from "@/components/SupplyListsPanel";
import { UserManagementPanel } from "@/components/UserManagementPanel";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    imageUrl: "",
  });

  // Fetch admin data - MUST be called before any conditional returns
  const utils = trpc.useUtils();
  const { data: stats } = trpc.admin.getStats.useQuery();
  const { data: products } = trpc.admin.listProducts.useQuery({});
  const { data: orders } = trpc.admin.listOrders.useQuery({});
  const { data: lowStockProducts } = trpc.admin.getLowStockProducts.useQuery({ threshold: 10 });
  const { data: categories } = trpc.categories.list.useQuery();

  const addProductMutation = trpc.admin.createProduct.useMutation({
    onSuccess: () => {
      utils.admin.listProducts.invalidate();
    },
  });

  // Allow public access to admin dashboard

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadProgress(10);
    const CLOUD = "xau4buvq";
    const PRESET = "xzyaf71u";
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", PRESET);
      fd.append("folder", "cavally-livres");
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (ev) => {
        if (ev.lengthComputable) setUploadProgress(Math.round((ev.loaded/ev.total)*90)+5);
      });
      xhr.addEventListener("load", () => {
        const data = JSON.parse(xhr.responseText);
        if (data.secure_url) {
          setUploadProgress(100);
          setFormData((prev) => ({ ...prev, imageUrl: data.secure_url }));
        } else { setUploadProgress(0); }
      });
      xhr.addEventListener("error", () => setUploadProgress(0));
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`);
      xhr.send(fd);
    } catch (err) { setUploadProgress(0); }
  };
      reader.onerror = () => {
        clearInterval(interval);
        setUploadProgress(0);
        console.error("Erreur lecture fichier");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      clearInterval(interval);
      setUploadProgress(0);
      console.error("Error uploading image:", error);
    }
  };

  const handleAddProduct = async () => {
    if (!formData.title || !formData.author || !formData.category || !formData.price || !formData.stock) {
      alert("Veuillez remplir tous les champs requis");
      return;
    }

    try {
      await addProductMutation.mutateAsync({
        title: formData.title,
        author: formData.author,
        categoryId: parseInt(formData.category) || 1,
        price: formData.price,
        stock: parseInt(formData.stock),
        description: formData.description,
        coverImageUrl: formData.imageUrl,
      });

      // Reset form and close dialog
      setFormData({
        title: "",
        author: "",
        category: "",
        price: "",
        stock: "",
        description: "",
        imageUrl: "",
      });
      setShowAddProductDialog(false);
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Erreur lors de l'ajout du produit: " + (error instanceof Error ? error.message : "Erreur inconnue"));
    }
  };

  // Filter orders by status (not used but kept for potential future use)
  // const filteredOrders = orderStatusFilter
  //   ? orders?.filter(order => order.status === orderStatusFilter)
  //   : orders;

  // Count orders by status
  const orderStats = {
    new: orders?.filter(o => o.status === "pending").length || 0,
    validated: orders?.filter(o => o.status === "confirmed").length || 0,
    rejected: orders?.filter(o => o.status === "cancelled").length || 0,
    unprocessed: orders?.filter(o => o.status === "pending").length || 0,
    processing: orders?.filter(o => o.status === "in_transit").length || 0,
    delivered: orders?.filter(o => o.status === "delivered").length || 0,
    paid: orders?.filter(o => o.paymentStatus === "completed").length || 0,
    unpaid: orders?.filter(o => o.paymentStatus === "pending").length || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate("/")}>
            <div className="w-10 h-10 bg-gradient-to-br from-[#005f8a] to-[#004a6a] rounded-lg flex items-center justify-center shadow-md">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#005f8a]">Cavally Livres</h1>
              <p className="text-xs text-gray-600">Administration</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-600">Administrateur</p>
          </div>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 shadow-sm min-h-[calc(100vh-80px)] p-6 overflow-y-auto">
          <div className="space-y-8">
            {/* Commandes Section */}
            <div>
              <h3 className="font-bold text-lg text-[#005f8a] mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Commandes
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => { setOrderStatusFilter("pending"); setActiveTab("orders"); }}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                    orderStatusFilter === "pending"
                      ? "bg-[#005f8a] text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Nouvelles Commandes</span>
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{orderStats.new}</span>
                  </div>
                </button>
                <button
                  onClick={() => { setOrderStatusFilter("confirmed"); setActiveTab("orders"); }}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                    orderStatusFilter === "confirmed"
                      ? "bg-[#005f8a] text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Commandes Validées</span>
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">{orderStats.validated}</span>
                  </div>
                </button>
                <button
                  onClick={() => { setOrderStatusFilter("cancelled"); setActiveTab("orders"); }}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                    orderStatusFilter === "cancelled"
                      ? "bg-[#005f8a] text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Commandes Rejetées</span>
                    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">{orderStats.rejected}</span>
                  </div>
                </button>
                <button
                  onClick={() => { setOrderStatusFilter("in_transit"); setActiveTab("orders"); }}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                    orderStatusFilter === "in_transit"
                      ? "bg-[#005f8a] text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>En Cours de Livraison</span>
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">{orderStats.processing}</span>
                  </div>
                </button>
                <button
                  onClick={() => { setOrderStatusFilter("delivered"); setActiveTab("orders"); }}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                    orderStatusFilter === "delivered"
                      ? "bg-[#005f8a] text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Commandes Livrées</span>
                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">{orderStats.delivered}</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Paiements Section */}
            <div>
              <h3 className="font-bold text-lg text-[#005f8a] mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Paiements
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => { setOrderStatusFilter(null); setActiveTab("dashboard"); }}
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span>Commandes Payées</span>
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">{orderStats.paid}</span>
                  </div>
                </button>
                <button
                  onClick={() => { setOrderStatusFilter(null); setActiveTab("dashboard"); }}
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span>Commandes Non Payées</span>
                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">{orderStats.unpaid}</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Gestion Produits Section */}
            <div>
              <h3 className="font-bold text-lg text-[#005f8a] mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Gestion Produits
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => { setActiveTab("products"); }}
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-all"
                >
                  Tous les Produits
                </button>
                <button
                  onClick={() => { setShowAddProductDialog(true); setActiveTab("products"); }}
                  className="w-full text-left px-4 py-2 rounded-lg bg-[#005f8a] text-white transition-all hover:bg-[#004a6a]"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Nouvel Ajout
                </button>
                <button
                  onClick={() => { setActiveTab("products"); }}
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-all"
                >
                  Modifier
                </button>
                <button
                  onClick={() => { setActiveTab("products"); }}
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-all"
                >
                  Supprimer
                </button>
                <button
                  onClick={() => { setActiveTab("products"); }}
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-all"
                >
                  Mettre à Jour
                </button>
              </div>
            </div>

            {/* Clients Section */}
            <div>
              <h3 className="font-bold text-lg text-[#005f8a] mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Clients
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab("users")}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                    activeTab === "users"
                      ? "bg-[#005f8a] text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  🧑‍🤝‍🧑 Liste des Clients
                </button>
                <button
                  onClick={() => setActiveTab("users")}
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-all"
                >
                  📊 Monitoring
                </button>
              </div>
            </div>

            {/* Outils Marketing */}
            <div>
              <h3 className="font-bold text-lg text-[#005f8a] mb-4 flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Marketing
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate("/admin/products")}
                  className="w-full text-left px-4 py-2 rounded-lg bg-gradient-to-r from-[#005f8a] to-[#ff8c42] text-white transition-all hover:shadow-md"
                >
                  <Package className="w-4 h-4 inline mr-2" />
                  Gestion des Articles
                </button>
                <button
                  onClick={() => navigate("/admin/qrcode")}
                  className="w-full text-left px-4 py-2 rounded-lg bg-gradient-to-r from-[#005f8a] to-[#ff8c42] text-white transition-all hover:shadow-md"
                >
                  <QrCode className="w-4 h-4 inline mr-2" />
                  Générateur QR Code
                </button>
              </div>
            </div>

            {/* Autres Sections */}
            <div>
              <h3 className="font-bold text-lg text-[#005f8a] mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Autres
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => { setActiveTab("reports"); }}
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-all"
                >
                  Statistiques
                </button>
                <button
                  onClick={() => { setActiveTab("reports"); }}
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-all"
                >
                  Rapports
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8 bg-white border border-gray-200">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-50 data-[state=active]:text-[#005f8a]">Dashboard</TabsTrigger>
              <TabsTrigger value="products" className="data-[state=active]:bg-blue-50 data-[state=active]:text-[#005f8a]">Produits</TabsTrigger>
              <TabsTrigger value="orders" className="data-[state=active]:bg-blue-50 data-[state=active]:text-[#005f8a]">Commandes</TabsTrigger>
              <TabsTrigger value="supplyLists" className="data-[state=active]:bg-blue-50 data-[state=active]:text-[#005f8a]">Devis</TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-blue-50 data-[state=active]:text-[#005f8a]">Utilisateurs</TabsTrigger>
              <TabsTrigger value="reports" className="data-[state=active]:bg-blue-50 data-[state=active]:text-[#005f8a]">Rapports</TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-blue-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Total Produits</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalProducts || 0}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Package className="w-6 h-6 text-[#005f8a]" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-blue-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Total Commandes</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalOrders || 0}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <ShoppingCart className="w-6 h-6 text-[#005f8a]" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-green-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Revenu Total</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{(stats?.totalRevenue || 0).toLocaleString()} FCFA</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-red-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Stock Faible</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.lowStockProducts || 0}</p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-lg">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Recent Orders */}
              <Card className="p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4 text-gray-900">Commandes Récentes</h2>
                <div className="space-y-2">
                  {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                    stats.recentOrders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200 hover:bg-[#f0f7fb] transition-colors">
                        <div>
                          <p className="font-medium text-gray-900">{order.orderNumber}</p>
                          <p className="text-sm text-gray-600">{order.customerName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{parseFloat(order.totalAmount).toLocaleString()} FCFA</p>
                          <p className="text-sm text-[#005f8a] font-medium capitalize">{order.status}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-600 py-4">Aucune commande récente</p>
                  )}
                </div>
              </Card>

              {/* Low Stock Alert */}
              {lowStockProducts && lowStockProducts.length > 0 && (
                <Card className="p-6 border-l-4 border-l-red-600 bg-red-50">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h2 className="text-xl font-bold text-red-900">Alerte Stock Faible</h2>
                  </div>
                  <div className="space-y-2">
                    {lowStockProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-white rounded border border-red-200">
                        <div>
                          <p className="font-medium text-gray-900">{product.title}</p>
                          <p className="text-sm text-gray-600">Stock: {product.stock}</p>
                        </div>
                        <Button size="sm" className="bg-[#005f8a] hover:bg-[#004a6a]">Réapprovisionner</Button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products" className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Gestion des Produits</h2>
                <Button 
                  onClick={() => setShowAddProductDialog(true)}
                  className="bg-[#005f8a] hover:bg-[#004a6a] text-white shadow-md hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un produit
                </Button>
              </div>

              <div className="space-y-2">
                {products && products.length > 0 ? (
                  products.map((product) => (
                    <Card key={product.id} className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{product.title}</p>
                          <p className="text-sm text-gray-600">{product.author}</p>
                          <p className="text-sm font-semibold text-[#005f8a] mt-1">{parseFloat(product.price).toLocaleString()} FCFA</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Stock</p>
                            <p className="text-lg font-bold text-gray-900">{product.stock}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="hover:bg-[#f0f7fb]">
                              <Edit2 className="w-4 h-4 text-[#005f8a]" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="p-8 text-center">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4 opacity-50" />
                    <p className="text-gray-600">Aucun produit trouvé</p>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <OrderManagementPanel statusFilter={orderStatusFilter} />
            </TabsContent>

            {/* Supply Lists Tab */}
            <TabsContent value="supplyLists" className="space-y-6">
              <SupplyListsPanel />
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <UserManagementPanel />
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Rapports et Statistiques</h2>

              <Card className="p-6 shadow-sm">
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <p className="text-sm text-[#005f8a] font-medium">Revenu Total</p>
                    <p className="text-3xl font-bold text-blue-900 mt-2">{(stats?.totalRevenue || 0).toLocaleString()} FCFA</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <p className="text-sm text-[#005f8a] font-medium">Nombre de Commandes</p>
                    <p className="text-3xl font-bold text-blue-900 mt-2">{stats?.totalOrders || 0}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                    <p className="text-sm text-green-600 font-medium">Panier Moyen</p>
                    <p className="text-3xl font-bold text-green-900 mt-2">
                      {stats?.totalOrders ? ((stats.totalRevenue || 0) / stats.totalOrders).toLocaleString() : 0} FCFA
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-600 font-medium">Produits en Stock</p>
                    <p className="text-3xl font-bold text-purple-900 mt-2">{stats?.totalProducts || 0}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4 text-gray-900">Exporter les données</h3>
                <div className="flex gap-4">
                  <Button variant="outline" className="border-blue-200 hover:bg-[#f0f7fb]">Exporter en CSV</Button>
                  <Button variant="outline" className="border-blue-200 hover:bg-[#f0f7fb]">Exporter en PDF</Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Add Product Dialog */}
      <Dialog open={showAddProductDialog} onOpenChange={setShowAddProductDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#005f8a]">Ajouter un nouveau produit</DialogTitle>
            <DialogDescription>
              Remplissez le formulaire pour ajouter un produit au catalogue
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-900">Titre *</label>
              <Input
                placeholder="Ex: Mathématiques 6ème"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 border-gray-200"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900">Auteur *</label>
              <Input
                placeholder="Ex: Jean Dupont"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="mt-1 border-gray-200"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900">Catégorie *</label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="mt-1 border-gray-200">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat: any) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-900">Prix (FCFA) *</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="mt-1 border-gray-200"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-900">Stock *</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="mt-1 border-gray-200"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900">Description</label>
              <Input
                placeholder="Description du produit"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 border-gray-200"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900">Image du produit</label>

              {/* Preview si image chargée */}
              {formData.imageUrl ? (
                <div className="mt-2 space-y-2">
                  <div className="relative inline-block">
                    <img
                      src={formData.imageUrl}
                      alt="Aperçu"
                      className="h-40 w-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, imageUrl: "" }));
                        setUploadProgress(0);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-xs text-green-600 font-medium">✓ Image chargée avec succès</p>
                  <label htmlFor="image-upload" className="text-xs text-[#005f8a] cursor-pointer hover:underline block">
                    Changer l'image
                  </label>
                </div>
              ) : (
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#005f8a] transition-colors cursor-pointer">
                  <label htmlFor="image-upload" className="cursor-pointer block">
                    <div className="text-gray-600">
                      <p className="text-sm font-medium">Cliquez pour charger une image</p>
                      <p className="text-xs text-gray-500 mt-1">ou glissez-déposez</p>
                    </div>
                  </label>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e)}
                className="hidden"
                id="image-upload"
              />

              {/* Barre de progression pendant le chargement */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">Chargement en cours...</span>
                    <span className="text-xs font-bold text-[#005f8a]">{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#005f8a] to-[#ff8c42] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddProductDialog(false)}
                className="flex-1 border-gray-200"
              >
                Annuler
              </Button>
              <Button
                onClick={handleAddProduct}
                disabled={addProductMutation.isPending}
                className="flex-1 bg-[#005f8a] hover:bg-[#004a6a] text-white"
              >
                {addProductMutation.isPending ? "Ajout en cours..." : "Ajouter"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
