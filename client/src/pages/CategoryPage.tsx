import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { BookOpen, Search, SlidersHorizontal, X, ShoppingCart, Star, Package } from "lucide-react";
import { addToLocalCart } from "@/hooks/useLocalCart";
import { AddToCartModal } from "@/components/AddToCartModal";
import { useAuth } from "@/_core/hooks/useAuth";

export default function CategoryPage({ categoryId }: { categoryId: number }) {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc">("newest");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [lastAdded, setLastAdded] = useState<{title: string; price: string} | null>(null);

  const { data: categories } = trpc.categories.list.useQuery();
  const cat = categories?.find((c: any) => c.id === categoryId);
  const catColor = cat?.color || "#005f8a";
  const catIcon = cat?.icon || "📚";

  const { data: products, isLoading } = trpc.products.withFilters.useQuery({
    categoryId,
    sortBy,
    inStockOnly,
  });

  const addToCartMutation = trpc.cart.add.useMutation();

  const filtered = products?.filter((p: any) =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) || (p.author || "").toLowerCase().includes(search.toLowerCase())
  ) || [];

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Bannière catégorie */}
      <div style={{ background: `linear-gradient(135deg, ${catColor} 0%, ${catColor}dd 100%)` }} className="relative overflow-hidden">
        {/* Pattern décoratif */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-8 text-8xl">{catIcon}</div>
          <div className="absolute bottom-2 right-32 text-6xl opacity-50">{catIcon}</div>
          <div className="absolute top-8 left-1/2 text-4xl opacity-30">{catIcon}</div>
        </div>
        
        <div className="container mx-auto px-4 py-10 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/70 text-sm mb-4">
            <button onClick={() => navigate("/")} className="hover:text-white transition-colors">Accueil</button>
            <span>/</span>
            <span className="text-white font-medium">{cat?.name || "Catégorie"}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-4xl backdrop-blur-sm">
              {catIcon}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{cat?.name || "Catégorie"}</h1>
              {cat?.description && <p className="text-white/80 mt-1 text-sm max-w-md">{cat.description}</p>}
              <p className="text-white/60 text-xs mt-1">{filtered.length} produit{filtered.length !== 1 ? "s" : ""} disponible{filtered.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-3 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={`Rechercher dans ${cat?.name || "cette catégorie"}...`}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#005f8a] focus:border-transparent outline-none"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{ borderColor: showFilters ? catColor : undefined, color: showFilters ? catColor : undefined }}
              className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium transition-colors ${showFilters ? "bg-blue-50" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:block">Filtres</span>
            </button>
          </div>

          {/* Filtres expandés */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t flex flex-wrap gap-3 items-center">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#005f8a]"
              >
                <option value="newest">Plus récents</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
              </select>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={e => setInStockOnly(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-600">En stock uniquement</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Grille produits */}
      <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">{catIcon}</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {search ? "Aucun résultat" : "Aucun produit disponible"}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {search ? `Aucun produit ne correspond à "${search}"` : "Des produits seront bientôt disponibles dans cette catégorie"}
            </p>
            {search && <button onClick={() => setSearch("")} className="text-[#005f8a] underline text-sm">Effacer la recherche</button>}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((product: any) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  {product.coverImageUrl ? (
                    <img
                      src={product.coverImageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: `${catColor}15` }}>
                      <span className="text-5xl">{catIcon}</span>
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-xs font-bold bg-red-500 px-2 py-1 rounded-full">Rupture</span>
                    </div>
                  )}
                  {product.stock > 0 && product.stock <= 5 && (
                    <div className="absolute top-2 left-2">
                      <span className="text-xs font-bold bg-orange-400 text-white px-2 py-0.5 rounded-full">Plus que {product.stock}</span>
                    </div>
                  )}
                </div>

                {/* Contenu */}
                <div className="p-3">
                  <p className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight">{product.title}</p>
                  {product.author && <p className="text-xs text-gray-500 mt-0.5">{product.author}</p>}
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-bold text-base" style={{ color: catColor }}>
                      {Number(product.price).toLocaleString()} FCFA
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); handleAddToCart(product); }}
                      disabled={product.stock === 0}
                      style={{ backgroundColor: product.stock === 0 ? undefined : catColor }}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white disabled:bg-gray-200 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal ajout panier */}
      {lastAdded && (
        <AddToCartModal
          isOpen={showCartModal}
          onClose={() => setShowCartModal(false)}
          product={{ title: lastAdded.title, price: lastAdded.price }}
          quantity={1}
          cartCount={cartCount}
        />
      )}
    </div>
  );
}
