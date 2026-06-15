import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { BookOpen, Trash2, Plus, Minus, ArrowLeft, ShoppingCart, AlertCircle, Check } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import ImageWithFallback from "@/components/ImageWithFallback";

export default function Cart() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { data: cartItems, refetch } = trpc.cart.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const updateMutation = trpc.cart.update.useMutation();
  const removeMutation = trpc.cart.remove.useMutation();
  const clearMutation = trpc.cart.clear.useMutation();

  const handleUpdateQuantity = (cartItemId: number, quantity: number) => {
    if (quantity < 1) return;
    updateMutation.mutate(
      { cartItemId, quantity },
      {
        onSuccess: () => refetch(),
      }
    );
  };

  const handleRemove = (cartItemId: number) => {
    removeMutation.mutate(
      { cartItemId },
      {
        onSuccess: () => refetch(),
      }
    );
  };

  const handleClear = () => {
    if (confirm("Êtes-vous sûr de vouloir vider votre panier ?")) {
      clearMutation.mutate(undefined, {
        onSuccess: () => refetch(),
      });
    }
  };

  const subtotal = cartItems?.reduce((sum, item) => {
    return sum + Number(item.product.price) * item.quantity;
  }, 0) || 0;

  const shippingCost = 0;
  const total = subtotal + shippingCost;
  const itemCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-[#005f8a] hover:text-[#004a6a] hover:bg-blue-50"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Mon Panier</h1>
            <div className="w-20"></div>
          </div>
        </nav>
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connexion requise</h2>
          <p className="text-lg text-gray-600 mb-8">Veuillez vous connecter pour voir et gérer votre panier</p>
          <Button
            onClick={() => (window.location.href = getLoginUrl())}
            className="bg-[#005f8a] hover:bg-[#004a6b] text-white font-semibold px-8 py-6 text-lg"
          >
            Se connecter
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/products")}
            className="text-[#005f8a] hover:text-[#004a6a] hover:bg-blue-50"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Continuer vos achats
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Mon Panier</h1>
          <div className="w-32"></div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        {cartItems?.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-20 h-20 mx-auto text-gray-400 mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Votre panier est vide</h2>
            <p className="text-lg text-gray-600 mb-8">Commencez à explorer notre catalogue pour ajouter des produits</p>
            <Button
              onClick={() => navigate("/products")}
              className="bg-[#005f8a] hover:bg-[#004a6b] text-white font-semibold px-8 py-6 text-lg"
            >
              Découvrir le catalogue
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Panier */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Articles ({itemCount})
                </h2>
                <p className="text-gray-600">
                  {cartItems?.length || 0} produit{(cartItems?.length || 0) > 1 ? 's' : ''} dans votre panier
                </p>
              </div>

              <div className="space-y-4">
                {cartItems && cartItems.map((item) => (
                  <Card key={item.id} className="border-slate-200 hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        {/* Image */}
                        <div className="flex-shrink-0 w-24 h-32 bg-slate-100 rounded-lg overflow-hidden">
                          <ImageWithFallback
                            src={item.product.coverImageUrl || ""}
                            alt={item.product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Détails */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-bold text-lg text-gray-900 mb-1">
                                {item.product.title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                par {item.product.author}
                              </p>
                              {(item.product as any).isbn && (
                                <p className="text-xs text-gray-500">
                                  ISBN: {(item.product as any).isbn}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemove(item.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between">
                            {/* Quantité */}
                            <div className="flex items-center gap-3 bg-slate-100 rounded-lg p-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <Input
                                type="number"
                                min="1"
                                max={item.product.stock}
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateQuantity(item.id, parseInt(e.target.value) || 1)
                                }
                                className="w-12 text-center border-0 bg-transparent focus:ring-0 font-semibold"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.product.stock}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* Prix */}
                            <div className="text-right">
                              <p className="text-sm text-gray-600 mb-1">
                                {Number(item.product.price).toLocaleString()} FCFA × {item.quantity}
                              </p>
                              <p className="text-lg font-bold text-[#005f8a]">
                                {(Number(item.product.price) * item.quantity).toLocaleString()} FCFA
                              </p>
                            </div>
                          </div>

                          {/* Stock faible */}
                          {item.product.stock <= 5 && item.product.stock > 0 && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                              <AlertCircle className="w-4 h-4" />
                              Seulement {item.product.stock} exemplaire{item.product.stock > 1 ? 's' : ''} disponible{item.product.stock > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={handleClear}
                className="mt-8 w-full text-red-600 border-red-300 hover:bg-red-50 font-semibold py-6"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Vider le panier
              </Button>
            </div>

            {/* Résumé de la commande */}
            <div>
              <Card className="border-slate-200 shadow-lg sticky top-24">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-200">
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-[#005f8a]" />
                    Résumé de la commande
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Détails */}
                    <div>
                      <div className="flex justify-between mb-3 pb-3 border-b border-slate-200">
                        <span className="text-gray-600">Sous-total ({itemCount} article{itemCount > 1 ? 's' : ''}):</span>
                        <span className="font-semibold text-gray-900">
                          {Number(subtotal).toLocaleString()} FCFA
                        </span>
                      </div>

                      <div className="flex justify-between mb-3 pb-3 border-b border-slate-200">
                        <span className="text-gray-600">Frais de port:</span>
                        <span className="font-semibold text-gray-900">
                          {shippingCost === 0 ? (
                            <span className="text-green-600 flex items-center gap-1">
                              <Check className="w-4 h-4" />
                              Gratuit
                            </span>
                          ) : (
                            `${Number(shippingCost).toLocaleString()} FCFA`
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between mb-6 pb-6 border-b border-slate-200">
                        <span className="text-gray-600">Taxes:</span>
                        <span className="font-semibold text-gray-900">0 FCFA</span>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="bg-gradient-to-r from-blue-50 to-slate-50 rounded-lg p-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">Total:</span>
                        <span className="text-2xl font-bold text-[#005f8a]">
                          {Number(total).toLocaleString()} FCFA
                        </span>
                      </div>
                    </div>

                    {/* Bouton de paiement */}
                    <Button
                      onClick={() => navigate("/checkout")}
                      className="w-full bg-[#005f8a] hover:bg-[#004a6b] text-white font-bold py-6 text-lg rounded-lg"
                    >
                      Procéder au paiement
                    </Button>

                    {/* Continuer les achats */}
                    <Button
                      variant="outline"
                      onClick={() => navigate("/products")}
                      className="w-full border-slate-300 text-gray-700 hover:bg-slate-50 font-semibold py-6"
                    >
                      Continuer les achats
                    </Button>

                    {/* Info */}
                    <div className="text-xs text-gray-500 text-center mt-6 pt-6 border-t border-slate-200">
                      <p>Livraison gratuite pour toute commande</p>
                      <p className="mt-2">Paiement sécurisé • Retours gratuits</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
