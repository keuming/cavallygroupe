import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLocalCartCount, addToLocalCart } from "@/hooks/useLocalCart";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { BookOpen, ShoppingCart, Upload, Search, X, Moon, Sun, Menu, Settings, LogOut, User, ChevronRight } from "lucide-react";
import { useDarkMode } from "@/hooks/useDarkMode";
import { getLoginUrl } from "@/const";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import { ChatbotWidget, type Message } from "@/components/ChatbotWidget";
import { AddToCartModal } from "@/components/AddToCartModal";
import { Footer } from "@/components/Footer";
import { ModernEducationMenu } from "@/components/ModernEducationMenu";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [lastAdded, setLastAdded] = useState<{title: string; price: string} | null>(null);
  const [aiMessages, setAiMessages] = useState<Message[]>([]);

  const { data: categories } = trpc.categories.list.useQuery();
  const { data: cartItems } = trpc.cart.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: allProducts } = trpc.products.list.useQuery({ limit: 50 });
  const { data: searchResults } = trpc.products.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );
  const addToCartMutation = trpc.cart.add.useMutation();
  const aiChatMutation = trpc.aiChat.sendMessage.useMutation();
  const logoutMutation = trpc.auth.logout.useMutation();

  const [localCartCount, setLocalCartCount] = useState(0);
  useEffect(() => {
    if (!isAuthenticated) {
      setLocalCartCount(getLocalCartCount());
      const handler = () => setLocalCartCount(getLocalCartCount());
      window.addEventListener("local-cart-updated", handler);
      return () => window.removeEventListener("local-cart-updated", handler);
    }
  }, [isAuthenticated]);

  const dbCartCount = cartItems?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
  const totalCartCount = isAuthenticated ? dbCartCount : localCartCount;

  const products = searchQuery ? searchResults : allProducts;
  const filtered = selectedCategory
    ? products?.filter((p: any) => p.categoryId === selectedCategory)
    : products;

  const handleAddToCart = (product: any) => {
    if (isAuthenticated) {
      addToCartMutation.mutate({ productId: product.id, quantity: 1 });
    } else {
      addToLocalCart({ id: product.id, title: product.title, price: product.price, coverImageUrl: product.coverImageUrl ?? undefined, stock: product.stock }, 1);
    }
    setLastAdded({ title: product.title, price: product.price });
    setCartCount(prev => prev + 1);
    setShowCartModal(true);
  };

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        localStorage.removeItem("cavally_token");
        localStorage.removeItem("cavally_cart");
        if ("caches" in window) caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
        setTimeout(() => { window.location.href = "/"; }, 100);
      },
    });
  };

  const catColors: Record<number, string> = {
    1: "#005f8a", 2: "#7c3aed", 3: "#059669", 4: "#d97706",
    5: "#dc2626", 6: "#0891b2", 7: "#16a34a", 8: "#9333ea",
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50"}`}>

      {/* NAVBAR */}
      <nav className={`sticky top-0 z-50 shadow-sm border-b ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer flex-shrink-0" onClick={() => { setSelectedCategory(null); setSearchQuery(""); }}>
              <div className="w-9 h-9 bg-[#005f8a] rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="font-bold text-[#005f8a] text-sm leading-tight">Cavally Livres</p>
                <p className="text-xs text-gray-500">Manuels & Oeuvres</p>
              </div>
            </div>

            {/* Barre de recherche */}
            <div className="flex-1 max-w-xl relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher un livre, auteur..."
                className={`w-full pl-9 pr-4 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-[#005f8a] ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "bg-gray-100 border-transparent"}`}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-2.5 text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Actions droite */}
            <div className="flex items-center gap-2">
              {/* Panier */}
              <button onClick={() => navigate("/cart")} className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <ShoppingCart className="w-5 h-5 text-gray-600" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#005f8a] text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {totalCartCount}
                  </span>
                )}
              </button>

              {/* Dark mode */}
              <button onClick={toggleDarkMode} className="p-2 rounded-xl hover:bg-gray-100 transition-colors hidden sm:block">
                {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-500" />}
              </button>

              {/* User */}
              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="w-7 h-7 bg-[#005f8a] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{user?.name?.[0]?.toUpperCase()}</span>
                    </div>
                    <span className="text-sm font-medium hidden sm:block">{user?.name?.split(" ")[0]}</span>
                  </button>
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-2 w-48 hidden group-hover:block z-50">
                    {user?.role === "admin" && (
                      <button onClick={() => window.location.href = "https://dashboard.cavallygroupe.com"} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Settings className="w-4 h-4" /> Dashboard Admin
                      </button>
                    )}
                    <button onClick={() => navigate("/customer-dashboard")} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <User className="w-4 h-4" /> Mon espace
                    </button>
                    <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50">
                      <LogOut className="w-4 h-4" /> Déconnexion
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => navigate("/login")} className="px-4 py-2 bg-[#005f8a] text-white rounded-xl text-sm font-medium hover:bg-[#004a6b] transition-colors hidden sm:block">
                  Connexion
                </button>
              )}
            </div>
          </div>

          {/* Barre catégories */}
          <div className="flex items-center gap-2 pb-3 overflow-x-auto scrollbar-hide">
            <ModernEducationMenu isDarkMode={isDarkMode} />
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!selectedCategory ? "bg-[#005f8a] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Tous
            </button>
            {categories?.filter((c: any) => c.name !== "Manuels Scolaires").map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(selectedCategory === cat.id ? null : cat.id); navigate(`/category/${cat.id}`); }}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${selectedCategory === cat.id ? "text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                style={selectedCategory === cat.id ? { backgroundColor: catColors[cat.id] || "#005f8a" } : {}}
              >
                {cat.icon && <span className="mr-1">{cat.icon}</span>}
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6 max-w-7xl">

        {/* HERO - Bouton ENVOYER MA LISTE en vedette */}
        {!searchQuery && !selectedCategory && (
          <div className="mb-8">
            {/* Banner principal */}
            <div className="bg-gradient-to-r from-[#005f8a] to-[#0080b8] rounded-2xl p-6 sm:p-10 text-white mb-4 relative overflow-hidden animate-fade-in-up card-shine">
              <div className="absolute right-0 top-0 opacity-10 text-[200px] leading-none">📚</div>
              <div className="relative z-10 max-w-2xl">
                <p className="text-blue-100 text-sm font-medium mb-2 uppercase tracking-wide">Cavally Livres — Abidjan</p>
                <h1 className="text-2xl sm:text-4xl font-bold mb-3 leading-tight">
                  Vos manuels scolaires<br />livrés à domicile
                </h1>
                <p className="text-blue-100 mb-6 text-sm sm:text-base">
                  Uploadez votre liste de livres et recevez un devis personnalisé sous 24h
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* BOUTON PRINCIPAL */}
                  <button
                    onClick={() => navigate("/supply-list-upload")}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-[#005f8a] rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 animate-pulse-blue"
                  >
                    <Upload className="w-6 h-6" />
                    ENVOYER MA LISTE
                  </button>
                  <button
                    onClick={() => navigate("/cart")}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 transition-colors border border-white/30"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Commander à l'unité
                  </button>
                </div>
                <p className="text-blue-200 text-xs mt-3">
                  ✓ PDF, Word ou Photo  ✓ Devis sous 24h  ✓ Livraison gratuite Abidjan
                </p>
              </div>
            </div>

            {/* Cards info rapide */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: "📋", title: "Envoyez votre liste", desc: "PDF, Word ou Photo" },
                { icon: "💰", title: "Recevez votre devis", desc: "Sous 24h par SMS/Email" },
                { icon: "🚚", title: "Livraison rapide", desc: "Gratuite à Abidjan" },
              ].map(card => (
                <div key={card.title} className={`rounded-xl p-4 text-center ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-sm hover-lift animate-fade-in-up`}>
                  <div className="text-2xl mb-2">{card.icon}</div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{card.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Titre section produits */}
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            {searchQuery ? `Résultats pour "${searchQuery}"` : selectedCategory ? categories?.find((c: any) => c.id === selectedCategory)?.name : "Notre catalogue"}
          </h2>
          {selectedCategory && (
            <button onClick={() => setSelectedCategory(null)} className="text-sm text-[#005f8a] flex items-center gap-1 hover:underline">
              Voir tout <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Grille produits */}
        {(!filtered || filtered.length === 0) ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">{searchQuery ? "Aucun résultat trouvé" : "Catalogue en cours de chargement..."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((product: any) => (
              <div
                key={product.id}
                className={`rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group hover-lift ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  {product.coverImageUrl ? (
                    <img src={product.coverImageUrl} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                      <BookOpen className="w-12 h-12 text-[#005f8a] opacity-40" />
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-xs font-bold bg-red-500 px-2 py-1 rounded-full">Rupture</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className={`font-semibold text-sm line-clamp-2 leading-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}>{product.title}</p>
                  {product.author && <p className="text-xs text-gray-500 mt-0.5 truncate">{product.author}</p>}
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-bold text-[#005f8a]">{Number(product.price).toLocaleString()} <span className="text-xs font-normal">FCFA</span></span>
                    <button
                      onClick={e => { e.stopPropagation(); handleAddToCart(product); }}
                      disabled={product.stock === 0}
                      className="w-8 h-8 bg-[#005f8a] text-white rounded-xl flex items-center justify-center hover:bg-[#004a6b] transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA bas de page */}
        {!searchQuery && !selectedCategory && filtered && filtered.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-[#005f8a] to-[#0080b8] rounded-2xl p-8 text-center text-white">
            <p className="text-2xl font-bold mb-2">Vous avez une longue liste ?</p>
            <p className="text-blue-100 mb-6">Envoyez-nous votre liste complète et nous préparons tout pour vous</p>
            <button
              onClick={() => navigate("/supply-list-upload")}
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#005f8a] rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-lg"
            >
              <Upload className="w-6 h-6" />
              ENVOYER MA LISTE MAINTENANT
            </button>
          </div>
        )}
      </div>

      {/* PWA Banner */}
      <PWAInstallBanner />

      {/* Modal panier */}
      {lastAdded && (
        <AddToCartModal
          isOpen={showCartModal}
          onClose={() => setShowCartModal(false)}
          product={{ title: lastAdded.title, price: lastAdded.price }}
          quantity={1}
          cartCount={totalCartCount + 1}
        />
      )}

      {/* Footer */}
      <Footer />

      {/* Chatbot */}
      <ChatbotWidget
        messages={aiMessages}
        onSendMessage={(content: string) => {
          const userMessage: Message = { role: "user", content };
          setAiMessages(prev => [...prev, userMessage]);
          aiChatMutation.mutate(
            { conversationId: "", message: content, context: { userType: user?.role === "admin" ? "admin" : "customer" } },
            {
              onSuccess: (response) => {
                setAiMessages(prev => [...prev, { role: "assistant", content: typeof response.message === "string" ? response.message : String(response.message) }]);
              },
              onError: () => {
                setAiMessages(prev => [...prev, { role: "assistant", content: "Une erreur s'est produite. Veuillez réessayer." }]);
              },
            }
          );
        }}
      />
    </div>
  );
}
