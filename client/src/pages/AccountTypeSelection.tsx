import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ShoppingCart, Store, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";

export default function AccountTypeSelection() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const updateUserTypeMutation = trpc.auth.updateUserType.useMutation();

  // Rediriger si l'utilisateur a déjà un type de compte
  useEffect(() => {
    if (user?.userType && user.userType !== "client") {
      navigate("/vendor-dashboard");
    } else if (user?.userType === "client") {
      navigate("/customer-dashboard");
    }
  }, [user?.userType, navigate]);

  const handleSelectType = (type: "client" | "vendor") => {
    updateUserTypeMutation.mutate(
      { userType: type },
      {
        onSuccess: () => {
          utils.auth.me.invalidate();
          if (type === "vendor") {
            navigate("/vendor-dashboard");
          } else {
            navigate("/customer-dashboard");
          }
        },
        onError: (error: any) => {
          console.error("Erreur lors de la mise à jour du type de compte:", error);
          alert("Erreur lors de la mise à jour du type de compte");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Bienvenue sur Cavally Livres</h1>
          <p className="text-xl text-gray-600">
            Choisissez votre type de compte pour commencer
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Client Card */}
          <Card className="hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-500 cursor-pointer overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center gap-3 mb-2">
                <ShoppingCart className="w-8 h-8" />
                <CardTitle>Compte Client</CardTitle>
              </div>
              <CardDescription className="text-blue-100">
                Achetez des produits et suivez vos commandes
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 font-bold">✓</span>
                  <span className="text-gray-700">Parcourir et acheter des produits</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 font-bold">✓</span>
                  <span className="text-gray-700">Suivre vos commandes en temps réel</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 font-bold">✓</span>
                  <span className="text-gray-700">Gérer vos adresses de livraison</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 font-bold">✓</span>
                  <span className="text-gray-700">Consulter l'historique de vos achats</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-500 font-bold">✓</span>
                  <span className="text-gray-700">Laisser des avis sur les produits</span>
                </li>
              </ul>
              <Button
                onClick={() => handleSelectType("client")}
                disabled={updateUserTypeMutation.isPending}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center gap-2"
              >
                Continuer en tant que Client
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Vendor Card */}
          <Card className="hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-orange-500 cursor-pointer overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <div className="flex items-center gap-3 mb-2">
                <Store className="w-8 h-8" />
                <CardTitle>Compte Vendeur</CardTitle>
              </div>
              <CardDescription className="text-orange-100">
                Vendez vos produits et gérez votre boutique
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 font-bold">✓</span>
                  <span className="text-gray-700">Créer et gérer vos annonces</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 font-bold">✓</span>
                  <span className="text-gray-700">Suivre vos ventes et revenus</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 font-bold">✓</span>
                  <span className="text-gray-700">Gérer votre inventaire</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 font-bold">✓</span>
                  <span className="text-gray-700">Communiquer avec les clients</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-500 font-bold">✓</span>
                  <span className="text-gray-700">Accéder aux statistiques de vente</span>
                </li>
              </ul>
              <Button
                onClick={() => handleSelectType("vendor")}
                disabled={updateUserTypeMutation.isPending}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center gap-2"
              >
                Continuer en tant que Vendeur
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 p-6 bg-white rounded-lg shadow-md border border-gray-200">
          <p className="text-center text-gray-600">
            <span className="font-semibold">Vous pouvez changer de type de compte</span> à tout moment depuis vos paramètres de compte.
          </p>
        </div>
      </div>
    </div>
  );
}
