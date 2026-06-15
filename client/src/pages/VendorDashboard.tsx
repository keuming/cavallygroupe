import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Plus, TrendingUp, Package, Users, LogOut, Eye, Trash2, MessageSquare } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { MessagingPanel } from "@/components/MessagingPanel";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { useDarkMode } from "@/hooks/useDarkMode";
import { AddManualModal } from "@/components/AddManualModal";
import { ManualsList } from "@/components/ManualsList";

export default function VendorDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { isDarkMode } = useDarkMode();
  const [showNewListingForm, setShowNewListingForm] = useState(false);
  const logoutMutation = trpc.auth.logout.useMutation();
  const [aiMessages, setAiMessages] = useState<Message[]>([
    { role: "system", content: "Vous êtes un assistant IA pour Cavaly Livres, une plateforme e-commerce de manuels et oeuvres littéraires en Côte d'Ivoire. Aidez les vendeurs avec leurs questions sur la gestion des produits, les commandes et les services." },
    { role: "assistant", content: "Bonjour! Je suis l'assistant IA de Cavaly Livres. Comment puis-je vous aider?" }
  ]);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Accès refusé</CardTitle>
            <CardDescription>Vous devez être connecté pour accéder au dashboard.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate("/");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Vendeur</h1>
            <p className="text-gray-600 dark:text-gray-400">Bienvenue, {user.name}</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="gap-2">
            <LogOut className="w-4 h-4" />
            Déconnexion
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Ventes Totales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-gray-500">Aucune vente pour le moment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Produits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-gray-500">Aucun produit ajouté</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Commandes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-gray-500">Aucune commande</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 €</div>
              <p className="text-xs text-gray-500">Aucun revenu</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="listings" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="listings" className="gap-2">
              <Package className="w-4 h-4" />
              Mes Manuels
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <Package className="w-4 h-4" />
              Articles
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="ai-assistant" className="gap-2">
              Assistant IA
            </TabsTrigger>
          </TabsList>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Mes Manuels</h2>
              <AddManualModal />
            </div>
            <ManualsList />
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Gestion des Articles</h2>
              <Button onClick={() => navigate("/admin/products")} className="gap-2">
                <Plus className="w-4 h-4" />
                Gérer les Articles
              </Button>
            </div>
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-600 text-center py-8">
                  Cliquez sur le bouton ci-dessus pour gérer vos articles.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <MessagingPanel />
          </TabsContent>

          {/* AI Assistant Tab */}
          <TabsContent value="ai-assistant" className="h-[600px]">
            <AIChatBox
              messages={aiMessages}
              onSendMessage={(message: Message | string) => {
                if (typeof message === 'string') {
                  setAiMessages([...aiMessages, { role: 'user', content: message }]);
                } else {
                  setAiMessages([...aiMessages, message]);
                }
              }}
              placeholder="Posez vos questions à l'assistant IA..."
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
