import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { BookOpen, AlertCircle, CheckCircle, Loader, MapPin, Phone, Mail, CreditCard, Package, ArrowRight } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Checkout() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { data: cartItems, refetch: refetchCart } = trpc.cart.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const createOrderMutation = trpc.orders.create.useMutation();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    customerName: user?.name || "",
    customerPhone: "",
    customerEmail: user?.email || "",
    deliveryAddress: "",
    deliveryCity: "",
    deliveryPostalCode: "",
    paymentMethod: "cash" as const,
  });

  const total = cartItems?.reduce((sum, item) => {
    return sum + Number(item.product.price) * item.quantity;
  }, 0) || 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage(null);
  };

  const validateForm = (): boolean => {
    if (!formData.customerName.trim()) {
      setErrorMessage("Le nom complet est requis");
      return false;
    }
    if (!formData.customerPhone.trim()) {
      setErrorMessage("Le téléphone est requis");
      return false;
    }
    if (!formData.deliveryAddress.trim()) {
      setErrorMessage("L'adresse de livraison est requise");
      return false;
    }
    if (!formData.deliveryCity.trim()) {
      setErrorMessage("La ville est requise");
      return false;
    }
    if (!cartItems || cartItems.length === 0) {
      setErrorMessage("Votre panier est vide");
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    if (!cartItems || cartItems.length === 0) {
      setErrorMessage("Votre panier est vide");
      setIsSubmitting(false);
      return;
    }

    const orderItems = cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.product.price,
    }));

    createOrderMutation.mutate(
      {
        ...formData,
        paymentMethod: formData.paymentMethod as any,
        items: orderItems,
        totalAmount: total.toString(),
      },
      {
        onSuccess: (data) => {
          setSuccessMessage(`Commande créée avec succès! Numéro de commande: ${data.orderNumber}`);
          setIsSubmitting(false);
          // Clear cart and navigate after 2 seconds
          setTimeout(() => {
            refetchCart();
            navigate(`/order-confirmation?orderId=${data.orderId}`);
          }, 2000);
        },
        onError: (error: any) => {
          console.error('Order creation error:', error);
          const errorMsg = error?.message || 'Une erreur est survenue lors de la création de la commande';
          setErrorMessage(`Erreur: ${errorMsg}`);
          setIsSubmitting(false);
        },
      }
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
        <nav className="bg-white border-b border-orange-100 shadow-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate("/")}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">Cavally Livres</h1>
            </div>
          </div>
        </nav>
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-md mx-auto">
            <div className="mb-8">
              <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Connexion requise</h2>
              <p className="text-gray-600 mb-8">Veuillez vous connecter pour continuer vers le checkout</p>
            </div>
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              Se connecter
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <nav className="bg-white border-b border-orange-100 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">Cavally Livres</h1>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate("/cart")}
            className="text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-colors"
          >
            ← Retour au panier
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Finaliser votre commande</h2>
          <p className="text-gray-600">Veuillez remplir les informations ci-dessous pour confirmer votre achat</p>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-semibold">Erreur</p>
              <p className="text-red-700 text-sm">{errorMessage}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-green-800 font-semibold">Succès</p>
              <p className="text-green-700 text-sm">{successMessage}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire */}
          <div className="lg:col-span-2">
            <Card className="border-orange-100 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-blue-50 border-b border-orange-100">
                <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-orange-600" />
                  Informations de livraison
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Section 1: Informations personnelles */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Phone className="w-5 h-5 text-orange-600" />
                      Vos informations
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="customerName" className="text-sm font-semibold text-gray-700">
                          Nom complet *
                        </Label>
                        <Input
                          id="customerName"
                          name="customerName"
                          value={formData.customerName}
                          onChange={handleInputChange}
                          placeholder="Jean Dupont"
                          required
                          className="border-gray-200 rounded-lg focus:border-orange-500 focus:ring-orange-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customerPhone" className="text-sm font-semibold text-gray-700">
                          Téléphone *
                        </Label>
                        <Input
                          id="customerPhone"
                          name="customerPhone"
                          value={formData.customerPhone}
                          onChange={handleInputChange}
                          placeholder="+225 07 12 34 56 78"
                          required
                          className="border-gray-200 rounded-lg focus:border-orange-500 focus:ring-orange-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customerEmail" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-orange-600" />
                        Email
                      </Label>
                      <Input
                        id="customerEmail"
                        name="customerEmail"
                        type="email"
                        value={formData.customerEmail}
                        onChange={handleInputChange}
                        placeholder="jean@example.com"
                        className="border-gray-200 rounded-lg focus:border-orange-500 focus:ring-orange-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200"></div>

                  {/* Section 2: Adresse de livraison */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-orange-600" />
                      Adresse de livraison
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="deliveryAddress" className="text-sm font-semibold text-gray-700">
                        Adresse *
                      </Label>
                      <Input
                        id="deliveryAddress"
                        name="deliveryAddress"
                        value={formData.deliveryAddress}
                        onChange={handleInputChange}
                        placeholder="123 Rue de la Paix"
                        required
                        className="border-gray-200 rounded-lg focus:border-orange-500 focus:ring-orange-500 transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="deliveryCity" className="text-sm font-semibold text-gray-700">
                          Ville *
                        </Label>
                        <Input
                          id="deliveryCity"
                          name="deliveryCity"
                          value={formData.deliveryCity}
                          onChange={handleInputChange}
                          placeholder="Abidjan"
                          required
                          className="border-gray-200 rounded-lg focus:border-orange-500 focus:ring-orange-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deliveryPostalCode" className="text-sm font-semibold text-gray-700">
                          Code postal
                        </Label>
                        <Input
                          id="deliveryPostalCode"
                          name="deliveryPostalCode"
                          value={formData.deliveryPostalCode}
                          onChange={handleInputChange}
                          placeholder="01 BP 1234"
                          className="border-gray-200 rounded-lg focus:border-orange-500 focus:ring-orange-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200"></div>

                  {/* Section 3: Mode de paiement */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-orange-600" />
                      Mode de paiement
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod" className="text-sm font-semibold text-gray-700">
                        Choisissez votre méthode de paiement *
                      </Label>
                      <select
                        id="paymentMethod"
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 rounded-lg p-3 bg-white text-gray-900 font-medium focus:border-orange-500 focus:ring-orange-500 transition-colors hover:border-gray-300"
                      >
                        <option value="cash">💵 Espèces à la livraison</option>
                        <option value="wave">📱 Wave Money</option>
                        <option value="moov">📱 Moov Money</option>
                        <option value="mtn">📱 MTN Money</option>
                        <option value="orange">📱 Orange Money</option>
                        <option value="stripe">💳 Carte bancaire (Stripe)</option>
                      </select>
                    </div>
                  </div>

                  {/* Bouton de confirmation */}
                  <Button
                    type="submit"
                    disabled={isSubmitting || createOrderMutation.isPending}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-400 text-white mt-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting || createOrderMutation.isPending ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Traitement en cours...
                      </>
                    ) : (
                      <>
                        Confirmer la commande
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Résumé de la commande */}
          <div>
            <Card className="border-orange-100 shadow-lg overflow-hidden sticky top-24">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-blue-50 border-b border-orange-100">
                <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-orange-600" />
                  Résumé
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Produits */}
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {cartItems?.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm border-b border-gray-100 pb-3 hover:bg-orange-50 p-2 rounded transition-colors">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.product.title}</p>
                          <p className="text-gray-500 text-xs">Quantité: {item.quantity}</p>
                        </div>
                        <span className="font-semibold text-orange-600">
                          {(Number(item.product.price) * item.quantity).toLocaleString()} FCFA
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200"></div>

                  {/* Totaux */}
                  <div className="space-y-3 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Nombre d'articles:</span>
                      <span className="font-semibold text-gray-900">{cartItems?.length || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sous-total:</span>
                      <span className="font-semibold text-gray-900">{total.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Frais de port:</span>
                      <span className="font-semibold text-gray-900">0 FCFA</span>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200"></div>

                    {/* Total */}
                    <div className="flex justify-between text-lg pt-2">
                      <span className="font-bold text-gray-900">Total:</span>
                      <span className="font-bold text-orange-600 text-xl">{total.toLocaleString()} FCFA</span>
                    </div>
                  </div>

                  {/* Info box */}
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800">
                      ✓ Paiement sécurisé<br/>
                      ✓ Livraison rapide<br/>
                      ✓ Satisfaction garantie
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
