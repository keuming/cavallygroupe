import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ImageWithFallback from "@/components/ImageWithFallback";
import { BookOpen, ChevronDown, X, Sliders } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { RecruitmentForm } from "./RecruitmentForm";
import { TutorsList } from "./TutorsList";
import { BecomeTutorForm } from "./BecomeTutorForm";

export default function CategoryPage({ categoryId }: { categoryId: number }) {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  
  // Filter states
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc" | "popular" | "rating">("newest");
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(0);
  
  const ITEMS_PER_PAGE = 12;

  // Fetch data
  const { data: category } = trpc.categories.list.useQuery();
  const categoryName = category?.find((c) => c.id === categoryId)?.name || "Catégorie";
  
  // Check if this is a special category
  const isRecruitment = categoryName === "Soutien scolaire";
  const isPetitesAnnonces = categoryName === "Petites annonces";
  const isParcoursJour = categoryName === "Parcours du jour";
  
  // Only fetch products if not a special category
  const { data: priceRange } = trpc.products.priceRange.useQuery(
    { categoryId },
    { enabled: !isRecruitment && !isPetitesAnnonces && !isParcoursJour }
  );
  const { data: products } = trpc.products.withFilters.useQuery(
    {
      categoryId,
      minPrice,
      maxPrice,
      inStockOnly,
      sortBy,
      limit: ITEMS_PER_PAGE,
      offset: page * ITEMS_PER_PAGE,
    },
    { enabled: !isRecruitment && !isPetitesAnnonces && !isParcoursJour }
  );
  const { data: totalCount } = trpc.products.count.useQuery(
    {
      categoryId,
      minPrice,
      maxPrice,
      inStockOnly,
    },
    { enabled: !isRecruitment && !isPetitesAnnonces && !isParcoursJour }
  );

  const addToCartMutation = trpc.cart.add.useMutation();
  const totalPages = totalCount ? Math.ceil(totalCount / ITEMS_PER_PAGE) : 0;

  const handleAddToCart = (productId: number) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    addToCartMutation.mutate(
      { productId, quantity: 1 },
      {
        onSuccess: () => {
          alert("Produit ajouté au panier!");
        },
      }
    );
  };

  const handleResetFilters = () => {
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setInStockOnly(false);
    setSortBy("newest");
    setPage(0);
  };

  // Special categories rendering
  if (isRecruitment) {
    return <RecruitmentForm />;
  }

  if (isParcoursJour) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Parcours du Jour</h1>
            <p className="text-xl text-gray-600 mb-6">
              Découvrez les parcours éducatifs et les témoignages inspirants de nos utilisateurs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Parcours Inspirants</h2>
                <p className="text-gray-600">Explorez les histoires de réussite et les parcours éducatifs</p>
              </div>
              <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white" disabled>
                Bientôt disponible
              </Button>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Témoignages</h2>
                <p className="text-gray-600">Lisez les témoignages et retours d'expérience de nos clients</p>
              </div>
              <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white" disabled>
                Bientôt disponible
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (isPetitesAnnonces) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Petites Annonces</h1>
            <p className="text-xl text-gray-600 mb-6">
              Explorez nos services d'annonces et trouvez des répétiteurs qualifiés
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tutors Card */}
            <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/petites-annonces/repetiteurs")}>
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Nos Répétiteurs</h2>
                <p className="text-gray-600">Trouvez un répétiteur qualifié pour vous aider dans vos études</p>
              </div>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                style={{ backgroundColor: "#005f8a" } as React.CSSProperties}
              >
                Voir les Répétiteurs
              </Button>
            </Card>

            {/* Become Tutor Card */}
            <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/petites-annonces/devenir-repetiteur")}>
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Devenir Répétiteur</h2>
                <p className="text-gray-600">Rejoignez notre réseau de répétiteurs et aidez les élèves à réussir</p>
              </div>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                style={{ backgroundColor: "#005f8a" } as React.CSSProperties}
              >
                Soumettre une Candidature
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Regular category rendering
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-400 to-blue-500 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">{categoryName}</h1>
          <p className="text-blue-100">
            {totalCount} produit{totalCount !== 1 ? "s" : ""} disponible{totalCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? "w-64" : "w-0"} transition-all duration-300 overflow-hidden`}>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5" />
                  Filtres
                </h2>
                {(minPrice !== undefined || maxPrice !== undefined || inStockOnly) && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs text-[#005f8a] hover:text-[#004a6a] font-medium"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Prix</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Prix minimum</label>
                    <Input
                      type="number"
                      placeholder={`Min: ${priceRange?.min || 0}`}
                      value={minPrice || ""}
                      onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Prix maximum</label>
                    <Input
                      type="number"
                      placeholder={`Max: ${priceRange?.max || 100000}`}
                      value={maxPrice || ""}
                      onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Stock Filter */}
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 text-[#005f8a] rounded"
                  />
                  <span className="text-sm text-gray-700">En stock uniquement</span>
                </label>
              </div>

              {/* Sort By */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Trier par</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">Plus récent</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                  <option value="popular">Populaire</option>
                  <option value="rating">Meilleure note</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toggle Filters Button */}
            <div className="mb-6 flex justify-between items-center">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-[#005f8a] rounded-lg hover:bg-blue-200 transition-colors lg:hidden"
              >
                <Sliders className="w-4 h-4" />
                {showFilters ? "Masquer" : "Afficher"} les filtres
              </button>
              <div className="text-sm text-gray-600">
                Page {page + 1} sur {totalPages}
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {products?.map((product: any) => (
                <Card
                  key={product.id}
                  className="hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1 border-blue-100 cursor-pointer"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  {/* Image */}
                  <div className="w-full h-48 bg-gray-200 overflow-hidden relative group">
                    {product.coverImageUrl ? (
                      <ImageWithFallback
                        src={product.coverImageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        width={250}
                        height={192}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                        <BookOpen className="w-12 h-12 text-blue-400 opacity-50" />
                      </div>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-bold">Rupture</span>
                      </div>
                    )}
                  </div>

                  <CardContent className="flex-1 flex flex-col p-4">
                    <h3 className="font-bold text-sm line-clamp-2 text-gray-900 hover:text-[#005f8a] transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{product.author}</p>

                    <div className="mt-auto pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-[#005f8a]">
                          {Number(product.price).toLocaleString()} FCFA
                        </span>
                      </div>

                      <p className={`text-xs font-medium mb-3 ${
                        product.stock > 0 ? "text-green-600" : "text-red-600"
                      }`}>
                        {product.stock > 0 ? `${product.stock} en stock` : "Rupture de stock"}
                      </p>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-[#005f8a] border-blue-200 hover:bg-[#f0f7fb]"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/product/${product.id}`);
                          }}
                        >
                          Détails
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-[#005f8a] hover:bg-[#004a6a]"
                          disabled={product.stock === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product.id);
                          }}
                        >
                          Ajouter
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mb-8">
                <Button
                  variant="outline"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  className="border-blue-200"
                >
                  Précédent
                </Button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Button
                    key={i}
                    variant={page === i ? "default" : "outline"}
                    onClick={() => setPage(i)}
                    className={page === i ? "bg-[#005f8a] hover:bg-[#004a6a]" : "border-blue-200"}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  disabled={page === totalPages - 1}
                  onClick={() => setPage(page + 1)}
                  className="border-blue-200"
                >
                  Suivant
                </Button>
              </div>
            )}

            {!products || products.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Aucun produit ne correspond à vos critères</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
