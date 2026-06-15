import { useState, useRef, useEffect } from 'react';
import { Search, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSearchSuggestions } from '@/hooks/useSearchSuggestions';
import { useDarkMode } from '@/hooks/useDarkMode';

interface SearchAutocompleteProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function SearchAutocomplete({ onSearch, placeholder = 'Rechercher des produits...' }: SearchAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { suggestions, searchHistory, addToHistory, clearHistory, getSuggestions } = useSearchSuggestions();
  const { isDarkMode } = useDarkMode();

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    getSuggestions(value);
    setIsOpen(true);
  };

  // Handle suggestion click
  const handleSuggestionClick = (text: string) => {
    setQuery(text);
    addToHistory(text);
    onSearch(text);
    setIsOpen(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'Enter' && query.trim()) {
        addToHistory(query);
        onSearch(query);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex].text);
        } else if (query.trim()) {
          addToHistory(query);
          onSearch(query);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get suggestion icon color
  const getSuggestionColor = (type: string) => {
    const colors: Record<string, string> = {
      popular: isDarkMode ? 'text-red-400' : 'text-red-600',
      history: isDarkMode ? 'text-blue-400' : 'text-blue-600',
      category: isDarkMode ? 'text-purple-400' : 'text-purple-600',
      product: isDarkMode ? 'text-green-400' : 'text-green-600',
      correction: isDarkMode ? 'text-yellow-400' : 'text-yellow-600',
    };
    return colors[type] || (isDarkMode ? 'text-gray-400' : 'text-gray-600');
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
        isDarkMode 
          ? 'bg-gray-700 border-gray-600' 
          : 'bg-white border-yellow-300'
      }`}>
        <Search className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`flex-1 outline-none bg-transparent ${
            isDarkMode ? 'text-gray-100 placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
          }`}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className={`p-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && (suggestions.length > 0 || searchHistory.length > 0) && (
        <div className={`absolute top-full left-0 right-0 mt-2 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto ${
          isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200'
        }`}>
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className={`border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${suggestion.text}`}
                  onClick={() => handleSuggestionClick(suggestion.text)}
                  className={`w-full text-left px-4 py-2 flex items-center gap-3 transition-colors ${
                    index === selectedIndex
                      ? isDarkMode ? 'bg-gray-600' : 'bg-yellow-50'
                      : isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                  }`}
                >
                  <span className={`text-lg ${getSuggestionColor(suggestion.type)}`}>
                    {suggestion.icon}
                  </span>
                  <div className="flex-1">
                    <p className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {suggestion.text}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {suggestion.type === 'popular' && 'Recherche populaire'}
                      {suggestion.type === 'history' && 'Historique'}
                      {suggestion.type === 'category' && 'Catégorie'}
                      {suggestion.type === 'correction' && 'Correction suggérée'}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {Math.round(suggestion.score)}%
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Search History */}
          {searchHistory.length > 0 && suggestions.length === 0 && (
            <div>
              <div className={`px-4 py-2 flex items-center justify-between ${
                isDarkMode ? 'bg-gray-600' : 'bg-gray-100'
              }`}>
                <p className={`text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  HISTORIQUE
                </p>
                <button
                  onClick={clearHistory}
                  className={`text-xs flex items-center gap-1 hover:opacity-70 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  <Trash2 className="w-3 h-3" />
                  Effacer
                </button>
              </div>
              {searchHistory.slice(0, 5).map((item, index) => (
                <button
                  key={`history-${index}`}
                  onClick={() => handleSuggestionClick(item)}
                  className={`w-full text-left px-4 py-2 flex items-center gap-3 transition-colors ${
                    isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                  }`}
                >
                  <span className={`text-lg ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    🕐
                  </span>
                  <p className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {item}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
