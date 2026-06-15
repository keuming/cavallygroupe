import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/lib/trpc';

export interface RecommendationItem {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  score: number;
  reason: 'viewed' | 'purchased' | 'similar' | 'trending' | 'personalized';
}

export interface UseAIRecommendationsReturn {
  recommendations: RecommendationItem[];
  isLoading: boolean;
  error: string | null;
  refreshRecommendations: () => Promise<void>;
  trackProductView: (productId: string) => void;
  trackProductClick: (productId: string) => void;
}

const MAX_RECOMMENDATIONS = 12;
const STORAGE_KEY = 'cavaly_user_behavior';

interface UserBehavior {
  viewedProducts: { id: string; timestamp: number }[];
  purchasedProducts: { id: string; timestamp: number }[];
  clickedProducts: { id: string; timestamp: number }[];
  lastUpdated: number;
}

export function useAIRecommendations(): UseAIRecommendationsReturn {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userBehavior, setUserBehavior] = useState<UserBehavior>({
    viewedProducts: [],
    purchasedProducts: [],
    clickedProducts: [],
    lastUpdated: Date.now(),
  });

  // Load user behavior from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUserBehavior(JSON.parse(stored));
      } catch (err) {
        console.error('Failed to load user behavior:', err);
      }
    }
  }, []);

  // Save user behavior to localStorage
  const saveBehavior = useCallback((behavior: UserBehavior) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(behavior));
    setUserBehavior(behavior);
  }, []);

  // Track product view
  const trackProductView = useCallback((productId: string) => {
    setUserBehavior((prev) => {
      const updated = { ...prev };
      
      // Remove if already in viewed
      updated.viewedProducts = updated.viewedProducts.filter((p) => p.id !== productId);
      
      // Add to viewed with timestamp
      updated.viewedProducts.unshift({
        id: productId,
        timestamp: Date.now(),
      });
      
      // Keep only last 50 views
      updated.viewedProducts = updated.viewedProducts.slice(0, 50);
      updated.lastUpdated = Date.now();
      
      saveBehavior(updated);
      return updated;
    });
  }, [saveBehavior]);

  // Track product click
  const trackProductClick = useCallback((productId: string) => {
    setUserBehavior((prev) => {
      const updated = { ...prev };
      
      // Remove if already in clicked
      updated.clickedProducts = updated.clickedProducts.filter((p) => p.id !== productId);
      
      // Add to clicked with timestamp
      updated.clickedProducts.unshift({
        id: productId,
        timestamp: Date.now(),
      });
      
      // Keep only last 30 clicks
      updated.clickedProducts = updated.clickedProducts.slice(0, 30);
      updated.lastUpdated = Date.now();
      
      saveBehavior(updated);
      return updated;
    });
  }, [saveBehavior]);

  // Generate AI recommendations
  const refreshRecommendations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get all products
      const { data: allProducts } = await trpc.products.list.useQuery({});
      
      if (!allProducts || allProducts.length === 0) {
        setRecommendations([]);
        return;
      }

      // Calculate recommendation scores
      const scored = allProducts.map((product: any) => {
        let score = 0;
        let reason: RecommendationItem['reason'] = 'personalized';

        // Score based on viewed products (recent views weighted higher)
        const viewedIndex = userBehavior.viewedProducts.findIndex((p) => p.id === product.id);
        if (viewedIndex !== -1) {
          const recency = (Date.now() - userBehavior.viewedProducts[viewedIndex].timestamp) / (1000 * 60 * 60);
          score += Math.max(0, 100 - recency * 5); // Decay over time
          reason = 'viewed';
        }

        // Score based on similar products (same category)
        if (userBehavior.viewedProducts.length > 0) {
          const lastViewedCategory = userBehavior.viewedProducts[0];
          if (lastViewedCategory && product.category === lastViewedCategory.id) {
            score += 50;
            reason = 'similar';
          }
        }

        // Boost trending products
        if (product.popularity && product.popularity > 80) {
          score += 30;
          reason = 'trending';
        }

        // Personalization based on click patterns
        const clickedIndex = userBehavior.clickedProducts.findIndex((p) => p.id === product.id);
        if (clickedIndex !== -1) {
          score += 20;
        }

        // Add small random factor for diversity
        score += Math.random() * 10;

        return {
          id: product.id,
          title: product.name,
          price: product.price,
          image: product.image || '/placeholder.png',
          category: product.category,
          score,
          reason,
        };
      });

      // Sort by score and take top recommendations
      const topRecommendations = scored
        .sort((a: RecommendationItem, b: RecommendationItem) => b.score - a.score)
        .slice(0, MAX_RECOMMENDATIONS);

      setRecommendations(topRecommendations);
    } catch (err) {
      console.error('Failed to generate recommendations:', err);
      setError('Erreur lors de la génération des recommandations');
    } finally {
      setIsLoading(false);
    }
  }, [userBehavior]);

  // Auto-refresh recommendations when behavior changes
  useEffect(() => {
    const timer = setTimeout(() => {
      refreshRecommendations();
    }, 500); // Debounce to avoid too many updates

    return () => clearTimeout(timer);
  }, [userBehavior, refreshRecommendations]);

  return {
    recommendations,
    isLoading,
    error,
    refreshRecommendations,
    trackProductView,
    trackProductClick,
  };
}
