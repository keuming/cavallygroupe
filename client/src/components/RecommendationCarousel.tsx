import { useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAIRecommendations, type RecommendationItem } from '@/hooks/useAIRecommendations';
import { useDarkMode } from '@/hooks/useDarkMode';
import ImageWithFallback from '@/components/ImageWithFallback';
import { useLocation } from 'wouter';

export function RecommendationCarousel() {
  const { recommendations, isLoading, trackProductClick } = useAIRecommendations();
  const { isDarkMode } = useDarkMode();
  const [, navigate] = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (isLoading || recommendations.length === 0) {
    return null;
  }

  const itemsPerPage = 4;
  const maxIndex = Math.max(0, recommendations.length - itemsPerPage);

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleProductClick = (product: RecommendationItem) => {
    trackProductClick(product.id);
    navigate(`/product/${product.id}`);
  };

  const getReasonLabel = (reason: RecommendationItem['reason']) => {
    const labels: Record<RecommendationItem['reason'], string> = {
      viewed: 'Vu récemment',
      purchased: 'Acheté avant',
      similar: 'Similaire',
      trending: 'Tendance',
      personalized: 'Pour vous',
    };
    return labels[reason];
  };

  const getReasonColor = (reason: RecommendationItem['reason']) => {
    const colors: Record<RecommendationItem['reason'], string> = {
      viewed: 'bg-blue-100 text-blue-800',
      purchased: 'bg-green-100 text-green-800',
      similar: 'bg-purple-100 text-purple-800',
      trending: 'bg-red-100 text-red-800',
      personalized: 'bg-yellow-100 text-yellow-800',
    };
    if (isDarkMode) {
      return colors[reason].replace('100', '900').replace('800', '200');
    }
    return colors[reason];
  };

  const visibleRecommendations = recommendations.slice(currentIndex, currentIndex + itemsPerPage);

  return (
    <div className={`py-8 px-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-yellow-50 to-orange-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Spécialement pour vous
            </h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`${isDarkMode ? 'border-gray-600 text-gray-300' : ''}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
              className={`${isDarkMode ? 'border-gray-600 text-gray-300' : ''}`}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Carousel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleRecommendations.map((product) => (
            <Card
              key={product.id}
              className={`overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'
              }`}
              onClick={() => handleProductClick(product)}
            >
              {/* Image */}
              <div className={`relative h-48 overflow-hidden ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                <ImageWithFallback
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Reason Badge */}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${getReasonColor(product.reason)}`}>
                  {getReasonLabel(product.reason)}
                </div>

                {/* Score Badge */}
                <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  ⭐ {Math.round(product.score)}
                </div>
              </div>

              {/* Content */}
              <div className="p-3">
                <h3 className={`font-semibold text-sm line-clamp-2 mb-2 ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  {product.title}
                </h3>

                <div className="flex items-center justify-between">
                  <span className={`text-lg font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    {product.price.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {product.category}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination Indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: Math.ceil(recommendations.length / itemsPerPage) }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i * itemsPerPage)}
              className={`w-2 h-2 rounded-full transition-all ${
                i * itemsPerPage === currentIndex
                  ? 'bg-yellow-500 w-6'
                  : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
              }`}
              aria-label={`Page ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
