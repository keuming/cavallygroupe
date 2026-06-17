import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import OptimizedImage from "@/components/OptimizedImage";
import { useLocation } from "wouter";
import { BookOpen, ShoppingCart, Menu, X, Upload, Search, Truck, Lock, Award, Settings, ChevronDown, Moon, Sun } from "lucide-react";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useNotifications } from "@/hooks/useNotifications";
import { getLoginUrl } from "@/const";
import { ChatbotWidget, type Message } from "@/components/ChatbotWidget";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { ModernEducationMenu } from "@/components/ModernEducationMenu";


export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { notifications, unreadCount, addNotification } = useNotifications();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [aiMessages, setAiMessages] = useState<Message[]>([
    { role: "system", content: "Vous êtes un assistant IA pour Cavaly Livres, une plateforme e-commerce de manuels et oeuvres littéraires en Côte d'Ivoire. Aidez les clients avec leurs questions sur les produits, les commandes et les services." },
    { role: "assistant", content: "Bonjour! Je suis l'assistant IA de Cavaly Livres. Comment puis-je vous aider aujourd'hui?" }
  ]);

  const { data: categories, isLoading: categoriesLoading } = trpc.categories.list.useQuery();
  const { data: allProducts } = trpc.products.list.useQuery({});
  


  // Track scroll position for navbar shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const { data: searchResults } = trpc.products.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );
  const { data: cartItems } = trpc.cart.list.useQuery();
  const addToCartMutation = trpc.cart.add.useMutation();
  const cartCount = cartItems?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
  const aiChatMutation = trpc.aiChat.sendMessage.useMutation();

  const products = searchQuery ? searchResults : allProducts;
  const filtered = selectedCategory
    ? products?.filter((p: any) => p.categoryId === selectedCategory)
    : products;

  const utils = trpc.useUtils();

  const handleAddToCart = (productId: number) => {
    if (!isAuthenticated) {
      // Stocker le produit dans le panier local avant la connexion
      const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
      const existingItem = localCart.find((item: any) => item.productId === productId);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        localCart.push({ productId, quantity: 1 });
      }
      localStorage.setItem('localCart', JSON.stringify(localCart));
      alert("Produit ajoute au panier! Connectez-vous pour valider votre commande.");
      return;
    }
    addToCartMutation.mutate(
      { productId, quantity: 1 },
      {
        onSuccess: () => {
          // Invalider le cache du panier pour rafraichir le badge
          utils.cart.list.invalidate();
          alert("Produit ajoute au panier!");
        },
      }
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900 text-gray-100' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Navigation superieure */}
      <nav className={`bg-yellow-50 border-b-4 border-yellow-400 sticky top-0 z-50 transition-shadow duration-300 ${
        isScrolled ? 'shadow-lg' : 'shadow-md'
      } ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : ''
      }`}>
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
          {/* Ligne 1: Logo + Menu deroulant + Actions */}
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Logo */}
            <div
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
              onClick={() => navigate("/")}
            >
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-[#FFC107] to-[#FFA000] rounded-lg flex items-center justify-center shadow-md">
                <BookOpen className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-2xl font-bold text-yellow-600">Cavally Livres</h1>
                <p className="text-xs text-yellow-700 hidden md:block">Manuels & Oeuvres Litteraires</p>
              </div>
            </div>

            {/* Menu deroulant categories sur mobile */}
            <div className="lg:hidden flex-1 max-w-xs">
              <button
                onClick={() => setNavbarOpen(!navbarOpen)}
                className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-100 hover:bg-gray-600'
                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                }`}
              >
                {navbarOpen ? '✕ Categories' : '≡ Categories'}
              </button>
            </div>

            {/* Boutons actions droite */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className={`text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 transition-colors ${
                  isDarkMode ? 'text-gray-300 hover:text-yellow-400 hover:bg-gray-700' : ''
                }`}
                title={isDarkMode ? "Mode clair" : "Mode sombre"}
              >
                {isDarkMode ? <Sun className="w-4 sm:w-5 h-4 sm:h-5" /> : <Moon className="w-4 sm:w-5 h-4 sm:h-5" />}
              </Button>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 relative transition-colors ${
                    isDarkMode ? 'text-gray-300 hover:text-yellow-400 hover:bg-gray-700' : ''
                  }`}
                  title="Notifications"
                >
                  <ShoppingCart className="w-4 sm:w-5 h-4 sm:h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center animate-pulse">
                      {cartCount}
                    </span>
                  )}
                </Button>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <div className="absolute right-0 top-full mt-2 z-50">
                      <NotificationDropdown />
                    </div>
                  </>
                )}
              </div>
              {isAuthenticated && (
                <Button
                  size="sm"
                  onClick={() => navigate("/customer-dashboard")}
                  className="bg-gradient-to-r from-[#005f8a] to-[#0080b8] hover:shadow-lg text-white shadow-md transition-all hidden sm:flex items-center gap-1 font-semibold"
                  title="Espace Client - Suivi des commandes"
                >
                  <Lock className="w-3 sm:w-4 h-3 sm:h-4" />
                  <span className="hidden md:inline">ESPACE CLIENT</span>
                </Button>
              )}
              {isAuthenticated ? (
                <Button
                  size="sm"
                  onClick={() => navigate("/account")}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white shadow-md hover:shadow-lg transition-all text-xs sm:text-sm"
                >
                  {user?.name ? user.name.split(' ')[0] : "Compte"}
                </Button>
              ) : (
                <div className="relative flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => navigate("/login")}
                    className="bg-[#005f8a] hover:bg-[#004a6b] text-white shadow-md hover:shadow-lg transition-all text-xs sm:text-sm"
                  >
                    Connexion
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate("/register")}
                    className="bg-white border border-[#005f8a] text-[#005f8a] hover:bg-blue-50 shadow-md hover:shadow-lg transition-all text-xs sm:text-sm font-semibold hidden sm:flex"
                  >
                    Créer un compte
                  </Button>
                </div>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`lg:hidden text-yellow-600 hover:bg-yellow-50 p-2 rounded transition-colors ${
                  isDarkMode ? 'text-yellow-400 hover:bg-gray-700' : ''
                }`}
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Ligne 2: Menu categories desktop */}
          <div className="mt-3 hidden lg:flex items-center justify-start gap-3 pb-2 px-4">
            {/* Live Shopping */}
            <button
              onClick={() => navigate('/live-shopping')}
              className={`font-bold transition-all duration-200 whitespace-nowrap text-sm px-3 py-2 rounded shadow-md hover:shadow-lg flex items-center gap-2 flex-shrink-0 ${isDarkMode ? 'text-white bg-red-600 hover:bg-red-700' : 'text-white bg-red-500 hover:bg-red-600'}`}
            >
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>Live Shopping</span>
            </button>
            
            {/* Menu Manuels Scolaires */}
            <ModernEducationMenu isDarkMode={isDarkMode} />
            
            {/* Catégories principales */}
            {categories?.filter(cat => cat.name !== 'Manuels Scolaires').map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigate(`/category/${cat.id}`)}
                className={`font-medium transition-all duration-200 whitespace-nowrap text-base px-4 py-2 rounded flex-shrink-0 ${isDarkMode ? 'text-gray-300 hover:text-yellow-400 hover:bg-gray-700' : 'text-gray-700 hover:text-yellow-600 hover:bg-yellow-100'}`}
              >
                {cat.name}
              </button>
            ))}
            
            {/* Commande Rapide */}
            <button
              onClick={() => navigate('/quick-order')}
              className={`font-bold transition-all duration-200 whitespace-nowrap text-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 flex-shrink-0`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1h7.586a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM5 16a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Commande Rapide</span>
            </button>
          </div>

          {/* Menu deroulant mobile */}
          {navbarOpen && (
            <div className={`lg:hidden mt-3 pt-3 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-yellow-200'
            } grid grid-cols-2 sm:grid-cols-3 gap-2`}>
              <button
                onClick={() => {
                  navigate('/live-shopping');
                  setNavbarOpen(false);
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                  isDarkMode
                    ? 'bg-red-900 text-red-100 hover:bg-red-800'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                Live
              </button>
              {categories?.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    navigate(`/category/${cat.id}`);
                    setNavbarOpen(false);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-100 hover:bg-gray-600'
                      : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
              <button
                onClick={() => {
                  navigate('/quick-order');
                  setNavbarOpen(false);
                }}
                className={`col-span-2 sm:col-span-3 px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1h7.586a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM5 16a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Commande Rapide
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Overlay pour fermer le menu sur mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex w-full">
        {/* Sidebar lateral - caché sur mobile */}
        <aside
          className={`fixed lg:relative top-[calc(58px+4px)] lg:top-0 left-0 h-[calc(100vh-58px-4px)] lg:h-auto ${
            sidebarOpen ? "w-64 z-40" : "w-0 -translate-x-full lg:translate-x-0"
          } bg-gray-50 border-r border-gray-200 transition-all duration-300 overflow-y-auto shadow-lg lg:shadow-sm ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : ''
          }`}
        >
          <div className="p-6">
            <h2 className="text-xl font-bold text-yellow-700 mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Catégories
            </h2>
            <div className="space-y-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                className={`w-full justify-start transition-all ${
                  selectedCategory === null
                    ? "bg-[#005f8a] hover:bg-[#004a6a] text-white"
                    : "border-gray-200 hover:bg-gray-100"
                }`}
              >
                Tous les produits
              </Button>
              {categories?.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full justify-start transition-all ${
                    selectedCategory === cat.id
                      ? "bg-[#005f8a] hover:bg-[#004a6a] text-white"
                      : "border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {cat.name}
                </Button>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-bold text-yellow-700 mb-3 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Recherche
              </h3>
              <Input
                placeholder="Titre, auteur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-gray-200 focus:border-[#005f8a] focus:ring-blue-600"
              />
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <Button
                onClick={() => navigate("/quick-order")}
                className="w-full bg-gradient-to-r from-[#FFC107] to-[#FFA000] hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all"
              >
                <Upload className="w-4 h-4 mr-2" />
                COMMANDEZ ICI
              </Button>
              <p className="text-xs text-gray-600 mt-3 text-center leading-relaxed">
                Uploadez votre liste de fournitures et recevez une facture automatique
              </p>
            </div>
          </div>
        </aside>

        {/* Contenu principal */}
        <main className="flex-1 w-full p-4 sm:p-6 md:p-8 lg:p-8 min-h-screen">
          {/* Hero Section */}
          {!selectedCategory && !searchQuery && (
            <div className="mb-8 sm:mb-12 bg-white rounded-xl p-4 sm:p-8 shadow-md border border-gray-200 relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-2xl sm:text-4xl font-bold mb-3 text-gray-900">Bienvenue chez Cavally Livres</h2>
                <p className="text-gray-600 mb-6 text-sm sm:text-lg">
                  Decouvrez notre collection complete de manuels scolaires, universitaires et oeuvres litteraires
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-[#005f8a] transition-all">
                    <Truck className="w-6 h-6 flex-shrink-0 text-yellow-600" />
                    <span className="text-sm text-gray-700">Livraison rapide en Cote d'Ivoire</span>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-[#005f8a] transition-all">
                    <Lock className="w-6 h-6 flex-shrink-0 text-yellow-600" />
                    <span className="text-sm text-gray-700">Paiement securise</span>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-[#005f8a] transition-all">
                    <Award className="w-6 h-6 flex-shrink-0 text-yellow-600" />
                    <span className="text-sm text-gray-700">Produits authentiques</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Titre et compteur */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {selectedCategory
                ? categories?.find((c) => c.id === selectedCategory)?.name
                : searchQuery
                ? "Résultats de recherche"
                : "Tous nos produits"}
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-[#005f8a] rounded"></div>
              <p className="text-gray-600">
                {filtered?.length || 0} produit{filtered?.length !== 1 ? "s" : ""} disponible{filtered?.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Grille de produits - responsive */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
            {filtered?.map((product: any) => (
              <Card
                key={product.id}
                className={`hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1 ${
                isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
              }`}
              >
                {/* Image de couverture */}
                <div className={`w-full h-40 sm:h-48 md:h-56 lg:h-64 overflow-hidden relative group transition-colors duration-300 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}>
                  {product.coverImageUrl ? (
                    <OptimizedImage
                      src={product.coverImageUrl}
                      alt={product.title}
                      className="w-full h-48 object-cover"
                      width={300}
                      height={400}
                      priority={filtered?.indexOf(product) < 5}
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center transition-colors duration-300 ${
                      isDarkMode 
                        ? 'bg-gradient-to-br from-gray-700 to-gray-800' 
                        : 'bg-gradient-to-br from-gray-100 to-gray-200'
                    }`}>
                      <BookOpen className="w-12 h-12 text-gray-400 opacity-50" />
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className={`font-bold text-lg ${
                        isDarkMode ? 'text-gray-200' : 'text-white'
                      }`}>Rupture</span>
                    </div>
                  )}
                </div>

                <CardContent className={`flex-1 flex flex-col p-2 sm:p-4 transition-colors duration-300 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <h3 className={`font-bold text-xs sm:text-sm line-clamp-2 hover:text-yellow-600 transition-colors ${
                    isDarkMode ? 'text-gray-100' : 'text-gray-900'
                  }`}>
                    {product.title}
                  </h3>
                  <p className={`text-xs mt-1 line-clamp-1 hidden sm:block transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>{product.author}</p>

                  <div className="mt-auto pt-2 sm:pt-4">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <span className="text-sm sm:text-lg font-bold text-yellow-600">
                        {Number(product.price).toLocaleString()} FCFA
                      </span>
                    </div>

                    <p className={`text-xs font-medium mb-2 sm:mb-3 transition-colors duration-300 ${
                      product.stock > 0 
                        ? isDarkMode ? 'text-green-400' : 'text-green-600'
                        : isDarkMode ? 'text-red-400' : 'text-red-600'
                    }`}>
                      {product.stock > 0 ? `Stock: ${product.stock}` : "Rupture"}
                    </p>

                    <div className="flex gap-1 sm:gap-2 mb-2 sm:mb-3">
                      <Button
                        onClick={() => navigate(`/product/${product.id}`)}
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs border-blue-200 hover:bg-yellow-50 hover:text-yellow-600 transition-colors p-1 h-8 sm:h-auto"
                      >
                        Details
                      </Button>
                      <Button
                        onClick={() => handleAddToCart(product.id)}
                        disabled={product.stock === 0}
                        size="sm"
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs shadow-md hover:shadow-lg transition-all disabled:opacity-50 p-1 h-8 sm:h-auto"
                      >
                        <ShoppingCart className="w-3 h-3" />
                      </Button>
                    </div>


                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filtered?.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">Aucun produit trouvé</p>
              <p className="text-gray-400 text-sm mt-2">Essayez de modifier votre recherche ou votre sélection de catégorie</p>
            </div>
          )}
        </main>
      </div>

      {/* Chatbot Widget */}
      <ChatbotWidget
        messages={aiMessages}
        onSendMessage={(content: string) => {
          const userMessage: Message = { role: "user", content };
          setAiMessages(prev => [...prev, userMessage]);
          
          aiChatMutation.mutate(
            {
              conversationId: "",
              message: content,
              context: {
                userType: user?.role === "admin" ? "admin" : "customer",
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
        title="Assistant Cavally"
        subtitle="Comment puis-je vous aider ?"
        suggestedPrompts={[
          "Comment passer une commande rapide ?",
          "Je veux télécharger ma liste de fournitures",
          "Comment partager une liste avec d'autres parents ?",
          "Où trouver mes commandes ?",
        ]}
      />

      {/* Contact Info Bar */}
      <div className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-gray-600 font-medium">Service Client:</span>
            <a href="tel:+2250586000103" className="text-yellow-600 font-bold hover:underline">
              +225 05 86 000 103
            </a>
          </div>
          <div className="hidden md:block w-px h-6 bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600 font-medium">Email:</span>
            <a href="mailto:service.clients@cavallylivre.com" className="text-yellow-600 font-bold hover:underline">
              service.clients@cavallylivre.com
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#005f8a] rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-lg">Cavally Livres</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Votre plateforme de vente en ligne de manuels et oeuvres littéraires en Côte d'Ivoire
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-yellow-600">Contact</h3>
              <p className="text-gray-400 text-sm mb-2">Téléphone: +225 05 86 000 103</p>
              <p className="text-gray-400 text-sm">Email: service.clients@cavallylivre.com</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-yellow-600">Services</h3>
              <p className="text-gray-400 text-sm mb-2">Livraison rapide en Côte d'Ivoire</p>
              <p className="text-gray-400 text-sm mb-2">Paiement sécurisé</p>
              <p className="text-gray-400 text-sm">Support client 24/7</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-yellow-600">Moyens de paiement</h3>
              <p className="text-gray-400 text-sm mb-2">Stripe (Cartes bancaires)</p>
              <p className="text-gray-400 text-sm mb-2">Wave Money</p>
              <p className="text-gray-400 text-sm mb-2">Moov Money</p>
              <p className="text-gray-400 text-sm">Paiement à la livraison</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4 text-yellow-600">Accès Webmail</h3>
              <a
                href="https://cpl84.hosting24.com:2096/cpsess5529760598/3rdparty/roundcube/?_task=mail&_mbox=INBOX"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors duration-300"
              >
                <Settings className="w-4 h-4" />
                Accéder aux Emails
              </a>
              <p className="text-gray-400 text-sm mt-3">Accès sécurisé à vos boîtes email professionnelles</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p className="transition-all duration-200">
              &copy; 2
              <a
                href="/admin"
                className="inline-block px-1 py-0.5 rounded hover:bg-blue-500 hover:text-white hover:scale-110 transition-all duration-200 cursor-pointer font-bold text-gray-400 hover:text-white underline decoration-blue-500"
                title="Accès Dashboard"
              >
                0
              </a>
              26 Cavaly Livre. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

