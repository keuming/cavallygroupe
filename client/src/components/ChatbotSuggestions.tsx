import { Book, BookOpen, Sparkles, ShoppingCart, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ChatbotSuggestion {
  icon: React.ReactNode;
  text: string;
  category: string;
}

export interface ChatbotSuggestionsProps {
  suggestions: ChatbotSuggestion[];
  onSelectSuggestion: (text: string) => void;
  isLoading?: boolean;
}

/**
 * Composant pour afficher les suggestions de questions rapides
 * basées sur les catégories de livres disponibles
 */
export function ChatbotSuggestions({
  suggestions,
  onSelectSuggestion,
  isLoading = false,
}: ChatbotSuggestionsProps) {
  if (suggestions.length === 0) return null;

  // Grouper les suggestions par catégorie
  const groupedSuggestions = suggestions.reduce(
    (acc, suggestion) => {
      if (!acc[suggestion.category]) {
        acc[suggestion.category] = [];
      }
      acc[suggestion.category].push(suggestion);
      return acc;
    },
    {} as Record<string, ChatbotSuggestion[]>
  );

  return (
    <div className="space-y-4 p-4">
      {Object.entries(groupedSuggestions).map(([category, items]) => (
        <div key={category} className="space-y-2">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            {category}
          </p>
          <div className="grid grid-cols-1 gap-2">
            {items.map((suggestion, index) => (
              <Button
                key={index}
                onClick={() => onSelectSuggestion(suggestion.text)}
                disabled={isLoading}
                variant="outline"
                className="justify-start text-left h-auto py-3 px-3 hover:bg-green-50 hover:border-green-500 hover:text-green-700 transition-colors"
              >
                <span className="mr-2 flex-shrink-0">{suggestion.icon}</span>
                <span className="text-sm flex-1">{suggestion.text}</span>
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Génère les suggestions basées sur les catégories de livres
 */
export function generateCategoryBasedSuggestions(): ChatbotSuggestion[] {
  return [
    // Manuels Scolaires
    {
      icon: <BookOpen className="w-4 h-4" />,
      text: "Montrez-moi les manuels scolaires pour le lycée",
      category: "Manuels Scolaires",
    },
    {
      icon: <BookOpen className="w-4 h-4" />,
      text: "Quels manuels pour le collège avez-vous ?",
      category: "Manuels Scolaires",
    },
    {
      icon: <BookOpen className="w-4 h-4" />,
      text: "Livres de mathématiques et sciences",
      category: "Manuels Scolaires",
    },

    // Manuels Universitaires
    {
      icon: <Book className="w-4 h-4" />,
      text: "Manuels universitaires en informatique",
      category: "Manuels Universitaires",
    },
    {
      icon: <Book className="w-4 h-4" />,
      text: "Livres de gestion et économie",
      category: "Manuels Universitaires",
    },
    {
      icon: <Book className="w-4 h-4" />,
      text: "Manuels de droit et sciences politiques",
      category: "Manuels Universitaires",
    },

    // Oeuvres Littéraires
    {
      icon: <Sparkles className="w-4 h-4" />,
      text: "Recommandez-moi des romans populaires",
      category: "Oeuvres Littéraires",
    },
    {
      icon: <Sparkles className="w-4 h-4" />,
      text: "Poésie et essais littéraires",
      category: "Oeuvres Littéraires",
    },
    {
      icon: <Sparkles className="w-4 h-4" />,
      text: "Pièces de théâtre classiques",
      category: "Oeuvres Littéraires",
    },

    // Fournitures Scolaires
    {
      icon: <ShoppingCart className="w-4 h-4" />,
      text: "Fournitures scolaires complètes",
      category: "Fournitures",
    },
    {
      icon: <ShoppingCart className="w-4 h-4" />,
      text: "Cahiers, stylos et accessoires",
      category: "Fournitures",
    },

    // Services Spéciaux
    {
      icon: <Upload className="w-4 h-4" />,
      text: "Télécharger ma liste de fournitures",
      category: "Services",
    },
    {
      icon: <Sparkles className="w-4 h-4" />,
      text: "Comment fonctionne l'analyse IA ?",
      category: "Services",
    },
  ];
}

/**
 * Filtre les suggestions basées sur la requête de l'utilisateur
 */
export function filterSuggestions(
  suggestions: ChatbotSuggestion[],
  query: string
): ChatbotSuggestion[] {
  if (!query.trim()) return suggestions;

  const lowerQuery = query.toLowerCase();
  return suggestions.filter(
    (suggestion) =>
      suggestion.text.toLowerCase().includes(lowerQuery) ||
      suggestion.category.toLowerCase().includes(lowerQuery)
  );
}
