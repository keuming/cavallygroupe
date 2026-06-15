'use client';

import { ChevronDown, Search, BookOpen, GraduationCap, Users, Zap } from 'lucide-react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';

export interface EducationLevel {
  id: string;
  name: string;
  icon?: React.ReactNode;
  sublevels?: {
    id: string;
    name: string;
  }[];
}

const EDUCATION_CATEGORIES: EducationLevel[] = [
  {
    id: 'maternelle',
    name: 'Maternelle',
    icon: <span className="text-2xl">🎨</span>,
    sublevels: [
      { id: 'toute-petite-section', name: 'Toute Petite Section' },
      { id: 'petite-section', name: 'Petite Section' },
      { id: 'moyenne-section', name: 'Moyenne Section' },
      { id: 'grande-section', name: 'Grande Section' },
    ],
  },
  {
    id: 'primaire',
    name: 'Primaire',
    icon: <span className="text-2xl">📚</span>,
    sublevels: [
      { id: 'cp1', name: 'CP1' },
      { id: 'cp2', name: 'CP2' },
      { id: 'ce1', name: 'CE1' },
      { id: 'ce2', name: 'CE2' },
      { id: 'cm1', name: 'CM1' },
      { id: 'cm2', name: 'CM2' },
    ],
  },
  {
    id: 'premier-cycle',
    name: 'Premier Cycle',
    icon: <span className="text-2xl">🎓</span>,
    sublevels: [
      { id: '6eme', name: 'Classe de 6ème' },
      { id: '5eme', name: 'Classe de 5ème' },
      { id: '4eme', name: 'Classe de 4ème' },
      { id: '3eme', name: 'Classe de 3ème' },
    ],
  },
  {
    id: 'second-cycle',
    name: 'Second Cycle',
    icon: <span className="text-2xl">📖</span>,
    sublevels: [
      { id: 'seconde-a', name: 'Classe de Seconde A' },
      { id: 'seconde-c', name: 'Classe de Seconde C' },
      { id: 'premiere-a', name: 'Classe de Première A' },
      { id: 'premiere-c', name: 'Classe de Première C' },
      { id: 'premiere-d', name: 'Classe de Première D' },
      { id: 'terminale-a', name: 'Classe de Terminale A' },
      { id: 'terminale-c', name: 'Classe de Terminale C' },
      { id: 'terminale-d', name: 'Classe de Terminale D' },
    ],
  },
  {
    id: 'second-cycle-technique',
    name: 'Second Cycle Technique',
    icon: <span className="text-2xl">⚙️</span>,
    sublevels: [
      { id: 'seconde-g', name: 'Classe de Seconde G' },
      { id: 'premiere-g', name: 'Classe de Première G' },
      { id: 'terminale-g', name: 'Classe de Terminale G' },
    ],
  },
];

interface ModernEducationMenuProps {
  isDarkMode?: boolean;
}

export function ModernEducationMenu({ isDarkMode = false }: ModernEducationMenuProps) {
  const [, navigate] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrer les catégories et sous-niveaux selon la recherche
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return EDUCATION_CATEGORIES;

    const query = searchQuery.toLowerCase();
    return EDUCATION_CATEGORIES.map((category) => ({
      ...category,
      sublevels: category.sublevels?.filter((sub) =>
        sub.name.toLowerCase().includes(query)
      ),
    })).filter((cat) => 
      cat.name.toLowerCase().includes(query) || 
      (cat.sublevels && cat.sublevels.length > 0)
    );
  }, [searchQuery]);

  const handleNavigate = (levelId: string, sublevelId?: string) => {
    const path = sublevelId
      ? `/education/${levelId}/${sublevelId}`
      : `/education/${levelId}`;
    navigate(path);
    setIsMenuOpen(false);
    setSearchQuery('');
  };

  const handleCategoryHover = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleSelectClass = (classId: string) => {
    setIsMenuOpen(false);
    setSelectedCategory(null);
    setSearchQuery('');
    navigate(`/education-class/${classId}`);
  };

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsMenuOpen(true)}
      onMouseLeave={() => {
        setIsMenuOpen(false);
        setSelectedCategory(null);
        setSearchQuery('');
      }}
    >
      {/* Bouton principal MANUELS SCOLAIRES */}
      <button
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 relative z-10 whitespace-nowrap',
          'hover:shadow-lg',
          isDarkMode
            ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-white'
            : 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-yellow-900'
        )}
      >
        <BookOpen className="w-5 h-5" />
        <span>Manuels Scolaires</span>
        <ChevronDown
          className={cn(
            'w-4 h-4 transition-transform duration-300',
            isMenuOpen ? 'rotate-180' : ''
          )}
        />
      </button>

      {/* Menu déroulant principal */}
      {isMenuOpen && (
        <div
          className={cn(
            'absolute left-0 top-full mt-1 rounded-xl shadow-2xl z-[9999]',
            'border-2 backdrop-blur-sm transition-all duration-200 animate-in fade-in slide-in-from-top-2',
            isDarkMode
              ? 'bg-gray-900/98 border-yellow-600'
              : 'bg-white/99 border-yellow-300'
          )}
          style={{
            minWidth: '900px',
            maxHeight: '550px',
            display: 'flex',
            flexDirection: 'column',
          }}
          onMouseEnter={() => setIsMenuOpen(true)}
          onMouseLeave={() => {
            setIsMenuOpen(false);
            setSelectedCategory(null);
          }}
        >
          {/* Barre de recherche */}
          <div className={cn(
            'p-4 border-b sticky top-0 z-[10001]',
            isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-yellow-100 bg-yellow-50/50'
          )}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un niveau d'études..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  'w-full pl-10 pr-4 py-2 rounded-lg border-2 transition-all focus:outline-none',
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-500'
                    : 'bg-white border-yellow-200 text-gray-900 placeholder-gray-500 focus:border-yellow-400'
                )}
              />
            </div>
          </div>

          {/* Contenu du menu */}
          <div className="flex flex-1 overflow-hidden">
            {/* Colonne gauche - Catégories principales */}
            <div
              className={cn(
                'w-1/3 border-r overflow-y-auto',
                isDarkMode ? 'border-gray-700 bg-gray-800/30' : 'border-yellow-100 bg-yellow-50/30'
              )}
            >
              {filteredCategories.map((category) => (
                <button
                  key={category.id}
                  onMouseEnter={() => handleCategoryHover(category.id)}
                  onClick={() => handleCategoryHover(category.id)}
                  className={cn(
                    'w-full text-left px-4 py-3 flex items-center gap-3 transition-all duration-200 border-l-4',
                    selectedCategory === category.id
                      ? isDarkMode
                        ? 'bg-gray-700 border-yellow-500 text-yellow-300'
                        : 'bg-yellow-100 border-yellow-500 text-yellow-700'
                      : isDarkMode
                      ? 'border-transparent hover:bg-gray-700 text-gray-200'
                      : 'border-transparent hover:bg-yellow-50 text-gray-700'
                  )}
                >
                  <span className="text-xl">{category.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold">{category.name}</div>
                    {category.sublevels && (
                      <div className={cn(
                        'text-xs',
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      )}>
                        {category.sublevels.length} niveaux
                      </div>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </button>
              ))}
            </div>

            {/* Colonne droite - Sous-niveaux */}
            <div className="w-2/3 overflow-y-auto p-4">
              {selectedCategory && filteredCategories.find(c => c.id === selectedCategory)?.sublevels ? (
                <div>
                  <div className={cn(
                    'font-bold text-lg mb-4 pb-2 border-b-2',
                    isDarkMode
                      ? 'text-yellow-400 border-yellow-600'
                      : 'text-yellow-700 border-yellow-300'
                  )}>
                    {filteredCategories.find(c => c.id === selectedCategory)?.name}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {filteredCategories
                      .find(c => c.id === selectedCategory)
                      ?.sublevels?.map((sublevel) => (
                        <button
                          key={sublevel.id}
                          onClick={() => handleSelectClass(sublevel.id)}
                          className={cn(
                            'text-left px-3 py-2 rounded-lg transition-all duration-200 font-medium',
                            isDarkMode
                              ? 'hover:bg-yellow-600/30 hover:text-yellow-300 text-gray-200'
                              : 'hover:bg-yellow-200/50 hover:text-yellow-800 text-gray-700'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-current opacity-60" />
                            {sublevel.name}
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              ) : (
                <div className={cn(
                  'flex flex-col items-center justify-center h-full text-center',
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                )}>
                  <GraduationCap className="w-12 h-12 mb-2 opacity-50" />
                  <p>Sélectionnez une catégorie pour voir les niveaux disponibles</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer avec infos */}
          <div className={cn(
            'px-4 py-3 border-t text-xs flex items-center justify-between',
            isDarkMode
              ? 'border-gray-700 bg-gray-800/30 text-gray-400'
              : 'border-yellow-100 bg-yellow-50/30 text-gray-600'
          )}>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Navigation rapide par niveau d'études</span>
            </div>
            <span className="text-xs opacity-75">
              {filteredCategories.reduce((acc, cat) => acc + (cat.sublevels?.length || 0), 0)} niveaux disponibles
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
