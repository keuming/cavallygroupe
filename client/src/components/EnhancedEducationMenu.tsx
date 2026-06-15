'use client';

import { ChevronDown, BookOpen, Download, Share2, TrendingUp } from 'lucide-react';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export interface EducationLevel {
  id: string;
  name: string;
  sublevels?: {
    id: string;
    name: string;
  }[];
}

export const EDUCATION_LEVELS: EducationLevel[] = [
  {
    id: 'maternelle',
    name: 'Maternelle',
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
    sublevels: [
      { id: 'seconde-g', name: 'Classe de Seconde G' },
      { id: 'premiere-g', name: 'Classe de Première G' },
      { id: 'terminale-g', name: 'Classe de Terminale G' },
    ],
  },
];

interface EnhancedEducationMenuProps {
  isDarkMode?: boolean;
}

export function EnhancedEducationMenu({ isDarkMode = false }: EnhancedEducationMenuProps) {
  const [, navigate] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);

  const handleNavigate = (levelId: string, sublevelId?: string) => {
    const path = sublevelId
      ? `/education/${levelId}/${sublevelId}`
      : `/education/${levelId}`;
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <div
      className={cn(
        'relative',
        isDarkMode ? 'text-gray-100' : 'text-gray-900'
      )}
      onMouseEnter={() => setIsMenuOpen(true)}
      onMouseLeave={() => setIsMenuOpen(false)}
    >
      {/* Bouton principal MANUELS SCOLAIRES */}
      <button
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg font-semibold transition-all duration-300 hover:bg-opacity-80 relative z-10',
          isDarkMode
            ? 'bg-gray-700 hover:bg-gray-600 text-gray-100'
            : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-900'
        )}
        onMouseEnter={() => setIsMenuOpen(true)}
      >
        <BookOpen className="w-5 h-5" />
        Manuels Scolaires
        <ChevronDown className={cn(
          'w-4 h-4 transition-transform',
          isMenuOpen ? 'rotate-180' : ''
        )} />
      </button>

      {/* Menu déroulant principal */}
      {isMenuOpen && (
        <div
          className={cn(
            'absolute left-0 top-full mt-2 w-96 rounded-xl shadow-2xl z-[9999] transition-all duration-300 border-2 max-h-96 overflow-y-auto',
            isDarkMode
              ? 'bg-gray-800 border-yellow-600'
              : 'bg-white border-yellow-400'
          )}
        >
          {/* En-tête avec capacités */}
          <div
            className={cn(
              'p-4 border-b bg-gradient-to-r sticky top-0 z-[10000]',
              isDarkMode ? 'border-gray-700 from-gray-700 to-gray-800' : 'border-yellow-200 from-yellow-50 to-yellow-100'
            )}
          >
            <h3 className={cn('font-bold text-lg mb-3', isDarkMode ? 'text-yellow-400' : 'text-yellow-700')}>Gestion des Listes de Fournitures</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-blue-500" />
                <span>Télécharger</span>
              </div>
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-green-500" />
                <span>Partager</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                <span>Statistiques</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-500" />
                <span>Suivi</span>
              </div>
            </div>
          </div>

          {/* Niveaux d'étude */}
          <div>
            {EDUCATION_LEVELS.map((level) => (
              <div key={level.id}>
                {/* Niveau principal */}
                <button
                  onClick={() => {
                    setExpandedLevel(expandedLevel === level.id ? null : level.id);
                    if (!level.sublevels) {
                      handleNavigate(level.id);
                    }
                  }}
                  className={cn(
                    'w-full text-left px-4 py-3 flex items-center justify-between hover:bg-opacity-50 transition-colors',
                    isDarkMode
                      ? 'hover:bg-gray-700 text-gray-100'
                      : 'hover:bg-yellow-50 text-gray-900'
                  )}
                >
                  <span className="font-semibold">{level.name}</span>
                  {level.sublevels && (
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 transition-transform',
                        expandedLevel === level.id ? 'rotate-180' : ''
                      )}
                    />
                  )}
                </button>

                {/* Sous-niveaux */}
                {level.sublevels && expandedLevel === level.id && (
                  <div
                    className={cn(
                      'bg-opacity-50',
                      isDarkMode ? 'bg-gray-700' : 'bg-yellow-50'
                    )}
                  >
                    {level.sublevels.map((sublevel) => (
                      <button
                        key={sublevel.id}
                        onClick={() => handleNavigate(level.id, sublevel.id)}
                        className={cn(
                          'w-full text-left px-8 py-2 text-sm hover:bg-opacity-75 transition-colors',
                          isDarkMode
                            ? 'hover:bg-gray-600 text-gray-200'
                            : 'hover:bg-yellow-100 text-gray-800'
                        )}
                      >
                        {sublevel.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
