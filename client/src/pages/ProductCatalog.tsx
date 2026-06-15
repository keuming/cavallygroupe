import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { BookOpen, ShoppingCart, ZoomIn, AlertCircle, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { ImageLightbox } from "@/components/ImageLightbox";
import { useToast, ToastContainer } from "@/components/Toast";
import { trpc } from "@/lib/trpc";

export default function ProductCatalog() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [sourceRect, setSourceRect] = useState<DOMRect | undefined>();
  const { toasts, removeToast, success, error } = useToast();
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: allProducts } = trpc.products.list.useQuery({});
  const { data: searchResults } = trpc.products.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );
  const { data: cartData } = trpc.cart.list.useQuery();
  const addToCartMutation = trpc.cart.add.useMutation();
  const [cartCount, setCartCount] = useState(0);
  const [showCartBadge, setShowCartBadge] = useState(false);

  // Mettre à jour le compteur du panier
  useEffect(() => {
    if (cartData && Array.isArray(cartData)) {
      const newCount = cartData.reduce((sum: number, item: any) => sum + item.quantity, 0);
      if (newCount !== cartCount) {
        setCartCount(newCount);
        setShowCartBadge(true);
        // Retirer l'animation après 500ms
        const timer = setTimeout(() => setShowCartBadge(false), 500);
        return () => clearTimeout(timer);
      }
    }
  }, [cartData, cartCount]);

  const utils = trpc.useUtils();
  const products = searchQuery ? searchResults : allProducts;
  const filtered = selectedCategory
    ? products?.filter((p: any) => p.categoryId === selectedCategory)
    : products;

  // Calculer les statistiques de la catégorie sélectionnée
  const categoryStats = filtered ? {
    count: filtered.length,
    minPrice: Math.min(...filtered.map((p: any) => Number(p.price))),
    maxPrice: Math.max(...filtered.map((p: any) => Number(p.price))),
    avgPrice: Math.round(filtered.reduce((sum: number, p: any) => sum + Number(p.price), 0) / filtered.length)
  } : null;

  const selectedCategoryData = categories?.find((c) => c.id === selectedCategory);

  const handleAddToCart = (productId: number, productName?: string) => {
    addToCartMutation.mutate(
      { productId, quantity: 1 },
      {
        onSuccess: () => {
          success(`${productName || 'Produit'} ajouté au panier ✓`);
          // Invalider le cache du panier pour mettre à jour le badge
          utils.cart.list.invalidate();
        },
        onError: () => {
          error("Erreur lors de l'ajout au panier");
        },
      }
    );
  };

  // Déterminer le badge pour un produit
  const getProductBadge = (product: any) => {
    if (product.stock === 0) return { text: "Rupture", color: "bg-red-500" };
    if (product.stock < 5) return { text: "Stock faible", color: "bg-orange-500" };
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 bg-[#005f8a] rounded-lg flex items-center justify-center shadow-md">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-[#005f8a]">Cavally Livres</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/products")}
              className="text-[#005f8a] font-semibold hover:bg-blue-50"
            >
              Catalogue
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate("/cart")}
              className="text-gray-700 hover:text-[#005f8a] hover:bg-slate-100 relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className={`absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center transition-all duration-300 ${
                  showCartBadge ? 'scale-125 animate-pulse' : 'scale-100'
                }`}>
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Bannière de catégorie */}
      {selectedCategoryData && (
        <div className="bg-gradient-to-r from-[#005f8a] to-[#0077b6] text-white py-8 mb-8">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-2">{selectedCategoryData.name}</h2>
            <p className="text-blue-100 text-lg">
              {categoryStats?.count} produit{categoryStats?.count !== 1 ? 's' : ''} disponible{categoryStats?.count !== 1 ? 's' : ''}
            </p>
            {categoryStats && (
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-blue-100 text-sm">Prix minimum</p>
                  <p className="text-2xl font-bold">{categoryStats.minPrice.toLocaleString()} FCFA</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-blue-100 text-sm">Prix moyen</p>
                  <p className="text-2xl font-bold">{categoryStats.avgPrice.toLocaleString()} FCFA</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-blue-100 text-sm">Prix maximum</p>
                  <p className="text-2xl font-bold">{categoryStats.maxPrice.toLocaleString()} FCFA</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {!selectedCategoryData && (
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Catalogue des Produits</h2>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar des filtres */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Recherche */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-bold text-lg mb-4 text-[#005f8a] flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Recherche
                </h3>
                <Input
                  placeholder="Titre, auteur, ISBN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-slate-300 focus:border-[#005f8a]"
                />
              </div>

              {/* Catégories */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-bold text-lg mb-4 text-[#005f8a] flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Catégories
                </h3>
                <div className="space-y-2">
                  <Button
                    variant={selectedCategory === null ? "default" : "outline"}
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full justify-start transition-all ${
                      selectedCategory === null
                        ? "bg-[#005f8a] hover:bg-[#004a6b] text-white"
                        : "hover:bg-blue-50"
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
                          ? "bg-[#005f8a] hover:bg-[#004a6b] text-white"
                          : "hover:bg-blue-50"
                      }`}
                    >
                      {cat.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Grille de produits */}
          <div className="lg:col-span-3">
            {filtered && filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((product: any) => {
                  const badge = getProductBadge(product);
                  return (
                    <Card
                      key={product.id}
                      className="hover:shadow-xl transition-all duration-300 overflow-hidden group hover:scale-105 transform"
                    >
                      {/* Image container */}
                      <div className="relative">
                        {product.coverImageUrl ? (
                          <div
                            className="w-full h-56 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden cursor-pointer relative group"
                            onClick={(e) => {
                              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                              setSourceRect(rect);
                              setLightboxImage(product.coverImageUrl);
                              setLightboxOpen(true);
                            }}
                          >
                            <img
                              src={product.coverImageUrl}
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                              <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-56 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-slate-400" />
                          </div>
                        )}

                        {/* Badge */}
                        {badge && (
                          <div className={`absolute top-3 right-3 ${badge.color} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                            {badge.text}
                          </div>
                        )}
                      </div>

                      {/* Contenu */}
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base line-clamp-2 group-hover:text-[#005f8a] transition-colors">
                          {product.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-1">{product.author}</CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>

                        {/* Prix et stock */}
                        <div className="space-y-2">
                          <p className="text-3xl font-bold text-[#005f8a]">
                            {Number(product.price).toLocaleString()} FCFA
                          </p>
                          <p className={`text-sm font-medium ${
                            product.stock > 0 ? "text-green-600" : "text-red-600"
                          }`}>
                            {product.stock > 0 ? `${product.stock} en stock` : "Rupture de stock"}
                          </p>
                        </div>

                        {/* Boutons */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={() => navigate(`/product/${product.id}`)}
                            variant="outline"
                            className="flex-1 border-[#005f8a] text-[#005f8a] hover:bg-blue-50"
                          >
                            Détails
                          </Button>
                          <Button
                            onClick={() => handleAddToCart(product.id, product.title)}
                            disabled={product.stock === 0 || addToCartMutation.isPending}
                            className="flex-1 bg-[#005f8a] hover:bg-[#004a6b] text-white"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            {addToCartMutation.isPending ? "Ajout..." : "Ajouter"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-gray-500 text-xl font-medium">Aucun produit trouvé</p>
                <p className="text-gray-400 mt-2">Essayez une autre recherche ou catégorie</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && lightboxImage && (
        <ImageLightbox
          images={[lightboxImage]}
          sourceRect={sourceRect}
          onClose={() => {
            setLightboxOpen(false);
            setLightboxImage(null);
            setSourceRect(undefined);
          }}
        />
      )}
    </div>
  );
}
