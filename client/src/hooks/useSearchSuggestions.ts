import { useState, useCallback, useEffect } from 'react';

export interface SearchSuggestion {
  text: string;
  type: 'popular' | 'history' | 'category' | 'product' | 'correction';
  score: number;
  icon?: string;
}

const STORAGE_KEY = 'cavaly_search_history';
const MAX_HISTORY = 20;

// Levenshtein distance algorithm for spelling correction
function levenshteinDistance(a: string, b: string): number {
  const aLen = a.length;
  const bLen = b.length;
  const matrix: number[][] = Array(aLen + 1)
    .fill(null)
    .map(() => Array(bLen + 1).fill(0));

  for (let i = 0; i <= aLen; i++) matrix[i][0] = i;
  for (let j = 0; j <= bLen; j++) matrix[0][j] = j;

  for (let i = 1; i <= aLen; i++) {
    for (let j = 1; j <= bLen; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[aLen][bLen];
}

// Popular search terms (would come from backend in production)
const POPULAR_SEARCHES = [
  'Mathématiques',
  'Français',
  'Manuels scolaires',
  'Livres universitaires',
  'Oeuvres littéraires',
  'Dictionnaire',
  'Grammaire',
  'Histoire',
  'Géographie',
  'Sciences',
];

// Categories
const CATEGORIES = [
  'Cartable et fournitures',
  'Manuels Scolaires',
  'Manuels Universitaires',
  'Oeuvres Littéraires',
  'Petites annonces',
  'Soutien scolaire',
  'Parcours du jour',
];

export interface UseSearchSuggestionsReturn {
  suggestions: SearchSuggestion[];
  isLoading: boolean;
  searchHistory: string[];
  addToHistory: (query: string) => void;
  clearHistory: () => void;
  getSuggestions: (query: string) => void;
}

export function useSearchSuggestions(): UseSearchSuggestionsReturn {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load search history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSearchHistory(JSON.parse(stored));
      } catch (err) {
        console.error('Failed to load search history:', err);
      }
    }
  }, []);

  // Add query to history
  const addToHistory = useCallback((query: string) => {
    if (!query.trim()) return;

    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== query.toLowerCase());
      const updated = [query, ...filtered].slice(0, MAX_HISTORY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Clear search history
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Generate suggestions based on query
  const getSuggestions = useCallback((query: string) => {
    if (!query.trim()) {
      // Show popular searches and history when empty
      const suggestions: SearchSuggestion[] = [
        ...searchHistory.slice(0, 5).map((text) => ({
          text,
          type: 'history' as const,
          score: 100,
          icon: '🕐',
        })),
        ...POPULAR_SEARCHES.slice(0, 5).map((text) => ({
          text,
          type: 'popular' as const,
          score: 80,
          icon: '🔥',
        })),
      ];
      setSuggestions(suggestions);
      return;
    }

    setIsLoading(true);
    const lowerQuery = query.toLowerCase();
    const scored: SearchSuggestion[] = [];

    // Match popular searches
    POPULAR_SEARCHES.forEach((term) => {
      const lowerTerm = term.toLowerCase();
      if (lowerTerm.includes(lowerQuery)) {
        scored.push({
          text: term,
          type: 'popular',
          score: 100 - lowerTerm.indexOf(lowerQuery) * 5,
          icon: '🔥',
        });
      } else {
        // Check for spelling corrections
        const distance = levenshteinDistance(lowerQuery, lowerTerm);
        if (distance <= 2 && distance > 0) {
          scored.push({
            text: term,
            type: 'correction',
            score: 100 - distance * 30,
            icon: '✏️',
          });
        }
      }
    });

    // Match categories
    CATEGORIES.forEach((category) => {
      const lowerCategory = category.toLowerCase();
      if (lowerCategory.includes(lowerQuery)) {
        scored.push({
          text: category,
          type: 'category',
          score: 90 - lowerCategory.indexOf(lowerQuery) * 5,
          icon: '📁',
        });
      }
    });

    // Match search history
    searchHistory.forEach((term) => {
      const lowerTerm = term.toLowerCase();
      if (lowerTerm.includes(lowerQuery)) {
        scored.push({
          text: term,
          type: 'history',
          score: 70 - lowerTerm.indexOf(lowerQuery) * 3,
          icon: '🕐',
        });
      }
    });

    // Remove duplicates and sort by score
    const unique = Array.from(
      new Map(scored.map((s) => [s.text.toLowerCase(), s])).values()
    );
    const sorted = unique.sort((a, b) => b.score - a.score).slice(0, 10);

    setSuggestions(sorted);
    setIsLoading(false);
  }, [searchHistory]);

  return {
    suggestions,
    isLoading,
    searchHistory,
    addToHistory,
    clearHistory,
    getSuggestions,
  };
}
