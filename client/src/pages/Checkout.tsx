import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { getLocalCart, clearLocalCart } from "@/hooks/useLocalCart";
import { 
  ShoppingCart, User, UserPlus, ArrowRight, ArrowLeft, 
  CheckCircle, MapPin, Phone, Mail, CreditCard, 
  Loader2, Package, Lock, ChevronRight, X
} from "lucide-react";

type Step = "cart-review" | "auth-choice" | "guest-info" | "login-form" | "register-form" | "delivery" | "payment" | "confirmation";

interface CartItem {
  id?: number;
  productId: number;
  quantity: number;
  product: { id: number; title: string; price: string; coverImageUrl?: string; stock: number };
}

export default function Checkout() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>("cart-review");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [orderId, setOrderId] = useState<number | null>(null);

  // Panier
  const [localCartItems, setLocalCartItems] = useState<CartItem[]>([]);
  const { data: dbCartItems } = trpc.cart.list.useQuery(undefined, { enabled: isAuthenticated });
  const cartItems: CartItem[] = isAuthenticated ? ((dbCartItems || []) as CartItem[]) : localCartItems;
  const total = cartItems.reduce((sum, item) => sum + Number(item.product?.price || 0) * item.quantity, 0);

  // Forms
  const [guestInfo, setGuestInfo] = useState({ name: "", email: "", phone: "" });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [delivery, setDelivery] = useState({ address: "", city: "Abidjan", postalCode: "" });
  const [paymentMethod, setPaymentMethod] = useState("wave");

  const createOrderMutation = trpc.orders.create.useMutation();
  const loginMutation = trpc.auth.login.useMutation();
  const registerMutation = trpc.auth.register.useMutation();

  useEffect(() => {
    setLocalCartItems(getLocalCart());
  }, []);

  useEffect(() => {
    if (isAuthenticated && step === "auth-choice") setStep("delivery");
    if (isAuthenticated && step === "login-form") setStep("delivery");
    if (isAuthenticated && step === "register-form") setStep("delivery");
  }, [isAuthenticated]);

  const customerName = isAuthenticated ? user?.name || "" : guestInfo.name;
  const customerEmail = isAuthenticated ? user?.email || "" : (guestInfo.email || loginForm.email || registerForm.email);
  const customerPhone = isAuthenticated ? user?.phone || "" : guestInfo.phone;

  const handleLogin = async () => {
    setIsLoading(true); setError("");
    try {
      const result = await loginMutation.mutateAsync(loginForm);
      if ((result as any).token) localStorage.setItem("cavally_token", (result as any).token);
      setStep("delivery");
    } catch (e: any) { setError(e.message || "Erreur de connexion"); }
    setIsLoading(false);
  };

  const handleRegister = async () => {
    setIsLoading(true); setError("");
    try {
      const result = await registerMutation.mutateAsync(registerForm);
      if ((result as any).token) localStorage.setItem("cavally_token", (result as any).token);
      setStep("delivery");
    } catch (e: any) { setError(e.message || "Erreur inscription"); }
    setIsLoading(false);
  };

  const handleOrder = async () => {
    setIsLoading(true); setError("");
    try {
      const items = cartItems.map(item => ({
        productId: item.productId || item.product?.id,
        quantity: item.quantity,
        unitPrice: item.product?.price || "0",
      }));
      const result = await createOrderMutation.mutateAsync({
        customerName, customerPhone, customerEmail,
        deliveryAddress: delivery.address,
        deliveryCity: delivery.city,
        deliveryPostalCode: delivery.postalCode,
        paymentMethod: paymentMethod as "wave" | "moov" | "mtn" | "orange" | "stripe" | "cash",
        items,
        totalAmount: total.toString(),
      });
      if ((result as any).orderNumber) {
        setOrderNumber((result as any).orderNumber);
        setOrderId((result as any).orderId);
        clearLocalCart();
        setStep("confirmation");
      }
    } catch (e: any) { setError(e.message || "Erreur lors de la commande"); }
    setIsLoading(false);
  };

  const steps = ["Panier", "Compte", "Livraison", "Paiement", "Confirmation"];
  const stepIndex = { "cart-review": 0, "auth-choice": 1, "guest-info": 1, "login-form": 1, "register-form": 1, "delivery": 2, "payment": 3, "confirmation": 4 };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate("/")} className="text-[#005f8a] hover:text-[#004a6b]">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-[#005f8a]">Finaliser ma commande</h1>
        </div>
        {/* Progress bar */}
        <div className="container mx-auto px-4 pb-3">
          <div className="flex items-center gap-1">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${i <= stepIndex[step] ? "bg-[#005f8a] text-white" : "bg-gray-200 text-gray-500"}`}>
                  {i < stepIndex[step] ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs ml-1 hidden sm:block ${i <= stepIndex[step] ? "text-[#005f8a] font-medium" : "text-gray-400"}`}>{s}</span>
                {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${i < stepIndex[step] ? "bg-[#005f8a]" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">

        {/* ÉTAPE 1: Révision panier */}
        {step === "cart-review" && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-[#005f8a]" /> Mon Panier</h2>
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500">Votre panier est vide</p>
                <button onClick={() => navigate("/")} className="mt-4 text-[#005f8a] underline">Voir le catalogue</button>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-4">
                  {cartItems.map((item, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 shadow-sm flex gap-3">
                      <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product?.coverImageUrl ? (
                          <img src={item.product.coverImageUrl} alt={item.product.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">📚</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">{item.product?.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Qté: {item.quantity}</p>
                        <p className="text-[#005f8a] font-bold mt-1">{(Number(item.product?.price || 0) * item.quantity).toLocaleString()} FCFA</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-[#005f8a] text-white rounded-xl p-4 mb-6">
                  <div className="flex justify-between">
                    <span>Total ({cartItems.reduce((s, i) => s + i.quantity, 0)} articles)</span>
                    <span className="font-bold text-lg">{total.toLocaleString()} FCFA</span>
                  </div>
                  <p className="text-blue-100 text-xs mt-1">🚚 Livraison gratuite à Abidjan</p>
                </div>
                <button
                  onClick={() => isAuthenticated ? setStep("delivery") : setStep("auth-choice")}
                  className="w-full py-4 bg-[#005f8a] text-white rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:bg-[#004a6b] transition-colors shadow-lg"
                >
                  Continuer <ArrowRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        )}

        {/* ÉTAPE 2: Choix auth */}
        {step === "auth-choice" && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold mb-2">Comment voulez-vous continuer ?</h2>
            <p className="text-gray-500 text-sm mb-6">Choisissez une option pour finaliser votre commande</p>
            
            <div className="space-y-3">
              {/* Option invité */}
              <button
                onClick={() => setStep("guest-info")}
                className="w-full bg-white border-2 border-gray-200 hover:border-[#005f8a] rounded-xl p-5 text-left transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">Commander sans compte</p>
                    <p className="text-sm text-gray-500">Rapide et simple — juste vos coordonnées</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#005f8a]" />
                </div>
              </button>

              {/* Option connexion */}
              <button
                onClick={() => setStep("login-form")}
                className="w-full bg-white border-2 border-gray-200 hover:border-[#005f8a] rounded-xl p-5 text-left transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">Se connecter</p>
                    <p className="text-sm text-gray-500">Accéder à mon compte existant</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#005f8a]" />
                </div>
              </button>

              {/* Option inscription */}
              <button
                onClick={() => setStep("register-form")}
                className="w-full bg-white border-2 border-[#005f8a] rounded-xl p-5 text-left transition-all group bg-gradient-to-r from-blue-50 to-white"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#005f8a] rounded-xl flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">Créer un compte <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-1">Recommandé</span></p>
                    <p className="text-sm text-gray-500">Suivez vos commandes facilement</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#005f8a]" />
                </div>
              </button>
            </div>

            <button onClick={() => setStep("cart-review")} className="mt-4 text-gray-400 text-sm flex items-center gap-1 hover:text-gray-600">
              <ArrowLeft className="w-4 h-4" /> Retour au panier
            </button>
          </div>
        )}

        {/* ÉTAPE 2b: Info invité */}
        {step === "guest-info" && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold mb-1">Vos coordonnées</h2>
            <p className="text-gray-500 text-sm mb-6">Pour la livraison et la confirmation de commande</p>
            {error && <div className="bg-red-50 text-red-700 p-3 rounded-xl mb-4 text-sm">{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Nom complet *</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input value={guestInfo.name} onChange={e => setGuestInfo(p => ({...p, name: e.target.value}))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#005f8a] focus:border-transparent outline-none"
                    placeholder="Votre nom complet" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Téléphone *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input value={guestInfo.phone} onChange={e => setGuestInfo(p => ({...p, phone: e.target.value}))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#005f8a] focus:border-transparent outline-none"
                    placeholder="07 00 00 00 00" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Email (pour la confirmation)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input value={guestInfo.email} onChange={e => setGuestInfo(p => ({...p, email: e.target.value}))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#005f8a] focus:border-transparent outline-none"
                    placeholder="votre@email.com" type="email" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep("auth-choice")} className="px-4 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => { if (!guestInfo.name || !guestInfo.phone) { setError("Nom et téléphone requis"); return; } setError(""); setStep("delivery"); }}
                className="flex-1 py-3 bg-[#005f8a] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#004a6b]"
              >
                Continuer <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ÉTAPE 2c: Login */}
        {step === "login-form" && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold mb-1">Connexion</h2>
            <p className="text-gray-500 text-sm mb-6">Connectez-vous pour continuer</p>
            {error && <div className="bg-red-50 text-red-700 p-3 rounded-xl mb-4 text-sm">{error}</div>}
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input value={loginForm.email} onChange={e => setLoginForm(p => ({...p, email: e.target.value}))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#005f8a] outline-none"
                  placeholder="Email" type="email" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input value={loginForm.password} onChange={e => setLoginForm(p => ({...p, password: e.target.value}))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#005f8a] outline-none"
                  placeholder="Mot de passe" type="password" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep("auth-choice")} className="px-4 py-3 border border-gray-200 rounded-xl text-gray-600">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button onClick={handleLogin} disabled={isLoading}
                className="flex-1 py-3 bg-[#005f8a] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#004a6b] disabled:opacity-60"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><User className="w-5 h-5" /> Se connecter</>}
              </button>
            </div>
          </div>
        )}

        {/* ÉTAPE 2d: Register */}
        {step === "register-form" && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold mb-1">Créer mon compte</h2>
            <p className="text-gray-500 text-sm mb-6">Rapide — moins de 30 secondes</p>
            {error && <div className="bg-red-50 text-red-700 p-3 rounded-xl mb-4 text-sm">{error}</div>}
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input value={registerForm.name} onChange={e => setRegisterForm(p => ({...p, name: e.target.value}))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#005f8a] outline-none"
                  placeholder="Nom complet" />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input value={registerForm.phone} onChange={e => setRegisterForm(p => ({...p, phone: e.target.value}))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#005f8a] outline-none"
                  placeholder="Téléphone" />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input value={registerForm.email} onChange={e => setRegisterForm(p => ({...p, email: e.target.value}))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#005f8a] outline-none"
                  placeholder="Email" type="email" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input value={registerForm.password} onChange={e => setRegisterForm(p => ({...p, password: e.target.value}))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#005f8a] outline-none"
                  placeholder="Mot de passe (min. 8 caractères)" type="password" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep("auth-choice")} className="px-4 py-3 border border-gray-200 rounded-xl text-gray-600">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button onClick={handleRegister} disabled={isLoading}
                className="flex-1 py-3 bg-[#005f8a] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#004a6b] disabled:opacity-60"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UserPlus className="w-5 h-5" /> Créer mon compte</>}
              </button>
            </div>
          </div>
        )}

        {/* ÉTAPE 3: Livraison */}
        {step === "delivery" && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold mb-1 flex items-center gap-2"><MapPin className="w-5 h-5 text-[#005f8a]" /> Adresse de livraison</h2>
            <p className="text-gray-500 text-sm mb-6">Livraison gratuite à Abidjan et environs</p>
            {error && <div className="bg-red-50 text-red-700 p-3 rounded-xl mb-4 text-sm">{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Adresse complète *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input value={delivery.address} onChange={e => setDelivery(p => ({...p, address: e.target.value}))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#005f8a] outline-none"
                    placeholder="Quartier, rue, numéro..." />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Ville *</label>
                <select value={delivery.city} onChange={e => setDelivery(p => ({...p, city: e.target.value}))}
                  className="w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#005f8a] outline-none bg-white">
                  {["Abidjan", "Bouaké", "Yamoussoukro", "Daloa", "San-Pédro", "Korhogo", "Man", "Gagnoa"].map(v => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => isAuthenticated ? setStep("cart-review") : setStep("auth-choice")} className="px-4 py-3 border border-gray-200 rounded-xl text-gray-600">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => { if (!delivery.address) { setError("Adresse requise"); return; } setError(""); setStep("payment"); }}
                className="flex-1 py-3 bg-[#005f8a] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#004a6b]"
              >
                Continuer <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ÉTAPE 4: Paiement */}
        {step === "payment" && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold mb-1 flex items-center gap-2"><CreditCard className="w-5 h-5 text-[#005f8a]" /> Mode de paiement</h2>
            <p className="text-gray-500 text-sm mb-6">Choisissez votre mode de paiement préféré</p>
            {error && <div className="bg-red-50 text-red-700 p-3 rounded-xl mb-4 text-sm">{error}</div>}

            <div className="space-y-3 mb-6">
              {[
                { id: "wave", name: "Wave", icon: "🌊", desc: "Paiement mobile instantané" },
                { id: "orange_money", name: "Orange Money", icon: "🟠", desc: "Paiement via Orange Money" },
                { id: "mtn_momo", name: "MTN MoMo", icon: "🟡", desc: "Paiement via MTN Mobile Money" },
                { id: "cash", name: "Paiement à la livraison", icon: "💵", desc: "Payez en espèces à la réception" },
              ].map(pm => (
                <button key={pm.id} onClick={() => setPaymentMethod(pm.id)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${paymentMethod === pm.id ? "border-[#005f8a] bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <span className="text-2xl">{pm.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{pm.name}</p>
                    <p className="text-xs text-gray-500">{pm.desc}</p>
                  </div>
                  {paymentMethod === pm.id && <CheckCircle className="w-5 h-5 text-[#005f8a] ml-auto" />}
                </button>
              ))}
            </div>

            {/* Récapitulatif */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="font-semibold text-gray-700 mb-2">Récapitulatif</p>
              <div className="text-sm space-y-1">
                <div className="flex justify-between"><span className="text-gray-500">Client</span><span>{customerName}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Livraison</span><span>{delivery.address}, {delivery.city}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Paiement</span><span>{paymentMethod}</span></div>
                <div className="flex justify-between font-bold pt-2 border-t mt-2"><span>Total</span><span className="text-[#005f8a]">{total.toLocaleString()} FCFA</span></div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep("delivery")} className="px-4 py-3 border border-gray-200 rounded-xl text-gray-600">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button onClick={handleOrder} disabled={isLoading}
                className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-600 disabled:opacity-60 shadow-lg"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle className="w-5 h-5" /> Confirmer la commande</>}
              </button>
            </div>
          </div>
        )}

        {/* ÉTAPE 5: Confirmation */}
        {step === "confirmation" && (
          <div className="animate-fade-in text-center py-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-14 h-14 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Commande confirmée !</h2>
            <p className="text-gray-500 mb-1">Numéro de commande</p>
            <p className="text-2xl font-mono font-bold text-[#005f8a] mb-6">{orderNumber}</p>

            <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
              <p className="font-semibold text-gray-700 mb-2">Prochaines étapes</p>
              <div className="space-y-2 text-sm text-gray-600">
                {customerEmail && <p>📧 Un email de confirmation a été envoyé à <strong>{customerEmail}</strong></p>}
                {customerPhone && <p>📱 Vous recevrez un SMS de confirmation au <strong>{customerPhone}</strong></p>}
                <p>🚚 Livraison sous 24-48h à Abidjan</p>
                <p>📦 Vous serez contacté avant la livraison</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => navigate("/")} className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50">
                Continuer mes achats
              </button>
              {isAuthenticated && (
                <button onClick={() => navigate("/customer-dashboard")} className="flex-1 py-3 bg-[#005f8a] text-white rounded-xl font-bold hover:bg-[#004a6b]">
                  Mes commandes
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
