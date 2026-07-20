import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ShoppingBag, Package, MapPin, Settings, LogOut, Heart, MessageSquare } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { MessagingPanel } from "@/components/MessagingPanel";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { useDarkMode } from "@/hooks/useDarkMode";
import { OrderProgressBar } from "@/components/OrderProgressBar";

export default function CustomerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { isDarkMode } = useDarkMode();
  const { data: orders } = trpc.orders.getUserOrders.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation();
  const [aiMessages, setAiMessages] = useState<Message[]>([
    { role: "system", content: "Vous êtes un assistant IA pour Cavaly Livres, une plateforme e-commerce de manuels et oeuvres littéraires en Côte d'Ivoire. Aidez les clients avec leurs questions sur les produits, les commandes et les services." },
    { role: "assistant", content: "Bonjour! Je suis l'assistant IA de Cavaly Livres. Comment puis-je vous aider?" }
  ]);
  const aiChatMutation = trpc.aiChat.sendMessage.useMutation();

  if (!isAuthenticated || user?.userType !== "client") {
    return (
      <div className={`flex items-center justify-center min-h-screen transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <Card className={`w-full max-w-md transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
        }`}>
          <CardHeader>
            <CardTitle className={isDarkMode ? 'text-gray-100' : ''}>Accès non autorisé</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`mb-4 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Vous devez être connecté en tant que client pour accéder à cette page.</p>
            <Button onClick={() => navigate("/")} className="w-full">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        localStorage.removeItem("cavally_token");
        localStorage.removeItem("cavally_cart");
        // Vider le cache SW pour forcer rechargement frais
        if ('caches' in window) {
          caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
        }
        setTimeout(() => { window.location.href = "/"; }, 100);
      },
    });
  };

  return (
    <DashboardLayout>
      <div className={`space-y-6 transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold transition-colors duration-300 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-900'
            }`}>Tableau de Bord Client</h1>
            <p className={`mt-1 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Bienvenue, {user?.name}!</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className={`transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
          }`}>
            <CardHeader className="pb-3">
              <CardTitle className={`text-sm font-medium flex items-center gap-2 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>
                <ShoppingBag className="w-4 h-4 text-blue-500" />
                Commandes Totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>{orders?.length || 0}</div>
              <p className={`text-xs mt-1 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Toutes vos commandes</p>
            </CardContent>
          </Card>

          <Card className={`transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
          }`}>
            <CardHeader className="pb-3">
              <CardTitle className={`text-sm font-medium flex items-center gap-2 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>
                <Package className="w-4 h-4 text-green-500" />
                En Cours de Livraison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>
                {orders?.filter((o: any) => o.status === "in_transit").length || 0}
              </div>
              <p className={`text-xs mt-1 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Commandes en transit</p>
            </CardContent>
          </Card>

          <Card className={`transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
          }`}>
            <CardHeader className="pb-3">
              <CardTitle className={`text-sm font-medium flex items-center gap-2 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>
                <Heart className="w-4 h-4 text-red-500" />
                Articles Favoris
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>0</div>
              <p className={`text-xs mt-1 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>À venir</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className={`w-full transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <TabsList className={`grid w-full grid-cols-5 transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            <TabsTrigger value="orders">Mes Commandes</TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="support">Support IA</TabsTrigger>
            <TabsTrigger value="addresses">Adresses</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className={`transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
            }`}>
              <CardHeader>
                <CardTitle className={isDarkMode ? 'text-gray-100' : ''}>Historique des Commandes</CardTitle>
                <CardDescription className={isDarkMode ? 'text-gray-400' : ''}>Consultez toutes vos commandes et leur statut</CardDescription>
              </CardHeader>
              <CardContent>
                {orders && orders.length > 0 ? (
                  <div className="space-y-6">
                    {orders.map((order: any) => (
                      <div key={order.id}>
                        {/* Barre de progression */}
                        <OrderProgressBar
                          status={order.status}
                          createdAt={new Date(order.createdAt)}
                          confirmedAt={order.confirmedAt ? new Date(order.confirmedAt) : undefined}
                          inTransitAt={order.inTransitAt ? new Date(order.inTransitAt) : undefined}
                          deliveredAt={order.deliveredAt ? new Date(order.deliveredAt) : undefined}
                          estimatedDeliveryDate={order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate) : undefined}
                        />
                        
                        {/* Détails de la commande */}
                        <div className={`border rounded-lg p-4 transition-colors ${
                          isDarkMode 
                            ? 'border-gray-700 hover:bg-gray-700' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className={`font-semibold transition-colors duration-300 ${
                                isDarkMode ? 'text-gray-100' : 'text-gray-900'
                              }`}>Commande #{order.orderNumber}</p>
                              <p className={`text-sm transition-colors duration-300 ${
                                isDarkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`font-semibold transition-colors duration-300 ${
                                isDarkMode ? 'text-gray-100' : 'text-gray-900'
                              }`}>{order.totalAmount} FCFA</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className={`mt-2 transition-colors duration-300 ${
                            isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''
                          }`}>
                            Voir les détails
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBag className={`w-12 h-12 mx-auto mb-3 transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-600' : 'text-gray-300'
                    }`} />
                    <p className={`transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>Vous n'avez pas encore de commandes</p>
                    <Button onClick={() => navigate("/products")} className="mt-4">
                      Commencer à acheter
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Mes Messages</CardTitle>
                <CardDescription>Communiquez avec les vendeurs</CardDescription>
              </CardHeader>
              <CardContent>
                <MessagingPanel />
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Support Tab */}
          <TabsContent value="support">
            <Card>
              <CardHeader>
                <CardTitle>Support IA</CardTitle>
                <CardDescription>Posez vos questions à notre assistant IA</CardDescription>
              </CardHeader>
              <CardContent>
                <AIChatBox
                  messages={aiMessages}
                  onSendMessage={(content: string) => {
                    const userMessage: Message = { role: "user", content };
                    setAiMessages(prev => [...prev, userMessage]);
                    
                    aiChatMutation.mutate(
                      {
                        conversationId: "",
                        message: content,
                        context: {
                          userType: "customer",
                        },
                      },
                      {
                        onSuccess: (response) => {
                          const assistantMessage: Message = {
                            role: "assistant",
                            content: typeof response.message === 'string' ? response.message : String(response.message),
                          };
                          setAiMessages(prev => [...prev, assistantMessage]);
                        },
                        onError: () => {
                          const errorMessage: Message = {
                            role: "assistant",
                            content: "Une erreur s'est produite. Veuillez réessayer.",
                          };
                          setAiMessages(prev => [...prev, errorMessage]);
                        },
                      }
                    );
                  }}
                  isLoading={aiChatMutation.isPending}
                  placeholder="Posez vos questions..."
                  height="600px"
                  suggestedPrompts={[
                    "Comment suivre ma commande?",
                    "Quels sont les délais de livraison?",
                    "Quels modes de paiement acceptez-vous?",
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses">
            <Card>
              <CardHeader>
                <CardTitle>Mes Adresses</CardTitle>
                <CardDescription>Gérez vos adresses de livraison</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">Aucune adresse enregistrée</p>
                  <Button className="mt-4">Ajouter une adresse</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres du Compte</CardTitle>
                <CardDescription>Gérez vos informations personnelles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nom</label>
                  <p className="mt-1 text-gray-900">{user?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Téléphone</label>
                  <p className="mt-1 text-gray-900">{user?.phone || "Non renseigné"}</p>
                </div>
                <Button className="mt-6">Modifier le profil</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
