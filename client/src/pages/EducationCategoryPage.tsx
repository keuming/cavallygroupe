import { useState, useMemo } from 'react';
import { useLocation, useParams } from 'wouter';
import { ChevronLeft, Download, Share2, TrendingUp, Filter, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';
import OptimizedImage from '@/components/OptimizedImage';
import { EDUCATION_LEVELS } from '@/components/EnhancedEducationMenu';
import { useDarkMode } from '@/hooks/useDarkMode';
import { cn } from '@/lib/utils';

interface ViewStats {
  viewCount: number;
  lastViewed: Date;
  shareCount: number;
}

export default function EducationCategoryPage() {
  const [, navigate] = useLocation();
  const { levelId, sublevelId } = useParams<{ levelId: string; sublevelId?: string }>();
  const { isDarkMode } = useDarkMode();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [viewStats, setViewStats] = useState<Record<number, ViewStats>>({});

  // Récupérer les produits
  const { data: allProducts } = trpc.products.list.useQuery({});

  // Trouver le niveau d'étude
  const educationLevel = useMemo(() => {
    return EDUCATION_LEVELS.find((level) => level.id === levelId);
  }, [levelId]);

  // Trouver le sous-niveau
  const sublevel = useMemo(() => {
    return educationLevel?.sublevels?.find((sub) => sub.id === sublevelId);
  }, [educationLevel, sublevelId]);

  // Filtrer les produits par niveau et recherche
  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];

    let filtered = allProducts;

    // Filtrer par niveau d'étude (basé sur le titre du produit)
    const searchTerms = sublevelId
      ? [sublevel?.name, educationLevel?.name]
      : [educationLevel?.name];

    filtered = filtered.filter((product: any) => {
      const productTitle = product.title.toLowerCase();
      return searchTerms.some((term) =>
        term ? productTitle.includes(term.toLowerCase()) : false
      );
    });

    // Filtrer par recherche
    if (searchQuery) {
      filtered = filtered.filter((product: any) =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrer par prix
    filtered = filtered.filter((product: any) => {
      const price = product.price || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    return filtered;
  }, [allProducts, levelId, sublevelId, educationLevel, sublevel, searchQuery, priceRange]);

  // Calculer les statistiques
  const stats = useMemo(() => {
    const totalViews = Object.values(viewStats).reduce((sum, stat) => sum + stat.viewCount, 0);
    const totalShares = Object.values(viewStats).reduce((sum, stat) => sum + stat.shareCount, 0);

    return {
      totalProducts: filteredProducts.length,
      totalViews,
      totalShares,
      averagePrice: filteredProducts.length > 0
        ? (filteredProducts.reduce((sum: number, p: any) => sum + (p.price || 0), 0) / filteredProducts.length).toFixed(2)
        : '0',
    };
  }, [filteredProducts, viewStats]);

  const handleProductClick = (productId: number) => {
    setViewStats((prev) => ({
      ...prev,
      [productId]: {
        viewCount: (prev[productId]?.viewCount || 0) + 1,
        lastViewed: new Date(),
        shareCount: prev[productId]?.shareCount || 0,
      },
    }));
  };

  const handleShare = (productId: number) => {
    setViewStats((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        shareCount: (prev[productId]?.shareCount || 0) + 1,
      },
    }));
  };

  const pageTitle = sublevelId
    ? `${sublevel?.name} - ${educationLevel?.name}`
    : educationLevel?.name;

  return (
    <div className={cn('min-h-screen', isDarkMode ? 'bg-gray-900' : 'bg-gray-50')}>
      {/* En-tête */}
      <div
        className={cn(
          'sticky top-0 z-40 border-b',
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  isDarkMode
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-600'
                )}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className={cn('text-2xl font-bold', isDarkMode ? 'text-white' : 'text-gray-900')}>
                  {pageTitle}
                </h1>
                <p className={cn('text-sm', isDarkMode ? 'text-gray-400' : 'text-gray-600')}>
                  {filteredProducts.length} produits disponibles
                </p>
              </div>
            </div>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <Input
                placeholder="Rechercher des produits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'
                )}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  viewMode === 'grid'
                    ? isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 text-blue-600'
                    : isDarkMode
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-600'
                )}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  viewMode === 'list'
                    ? isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 text-blue-600'
                    : isDarkMode
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-600'
                )}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className={cn('text-sm font-medium', isDarkMode ? 'text-gray-400' : 'text-gray-600')}>
                  Produits
                </p>
                <p className={cn('text-3xl font-bold mt-2', isDarkMode ? 'text-white' : 'text-gray-900')}>
                  {stats.totalProducts}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                <p className={cn('text-sm font-medium', isDarkMode ? 'text-gray-400' : 'text-gray-600')}>
                  Consultations
                </p>
                <p className={cn('text-3xl font-bold mt-2', isDarkMode ? 'text-white' : 'text-gray-900')}>
                  {stats.totalViews}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardContent className="pt-6">
              <div className="text-center">
                <Share2 className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <p className={cn('text-sm font-medium', isDarkMode ? 'text-gray-400' : 'text-gray-600')}>
                  Partages
                </p>
                <p className={cn('text-3xl font-bold mt-2', isDarkMode ? 'text-white' : 'text-gray-900')}>
                  {stats.totalShares}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className={cn('text-sm font-medium', isDarkMode ? 'text-gray-400' : 'text-gray-600')}>
                  Prix moyen
                </p>
                <p className={cn('text-3xl font-bold mt-2', isDarkMode ? 'text-white' : 'text-gray-900')}>
                  {stats.averagePrice} FCFA
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grille de produits */}
        {filteredProducts.length > 0 ? (
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'
                : 'space-y-4'
            )}
          >
            {filteredProducts.map((product: any) => (
              <Card
                key={product.id}
                className={cn(
                  'cursor-pointer transition-transform hover:scale-105',
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
                )}
                onClick={() => handleProductClick(product.id)}
              >
                <CardContent className="p-4">
                  <div className="relative mb-4 overflow-hidden rounded-lg bg-gray-200 h-48">
                    <OptimizedImage
                      src={product.coverImageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover"
                      priority={filteredProducts.indexOf(product) < 4}
                    />
                  </div>

                  <h3 className={cn('font-semibold line-clamp-2', isDarkMode ? 'text-white' : 'text-gray-900')}>
                    {product.title}
                  </h3>

                  <p className={cn('text-sm mt-1', isDarkMode ? 'text-gray-400' : 'text-gray-600')}>
                    {product.author}
                  </p>

                  <div className="flex items-center justify-between mt-4">
                    <span className={cn('font-bold text-lg', isDarkMode ? 'text-white' : 'text-gray-900')}>
                      {product.price} FCFA
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(product.id);
                      }}
                      className="p-2 rounded-lg hover:bg-opacity-80 bg-blue-500 text-white transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  {viewStats[product.id] && (
                    <div className={cn('text-xs mt-2 pt-2 border-t', isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-600')}>
                      {viewStats[product.id].viewCount} vues • {viewStats[product.id].shareCount} partages
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className={cn('text-lg', isDarkMode ? 'text-gray-400' : 'text-gray-600')}>
              Aucun produit trouvé pour cette catégorie.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
