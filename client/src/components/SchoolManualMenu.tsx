import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLocation } from "wouter";
import { useDarkMode } from "@/hooks/useDarkMode";

export interface SchoolLevel {
  id: string;
  name: string;
  subcategories?: string[];
}

const SCHOOL_LEVELS: SchoolLevel[] = [
  {
    id: "maternelle",
    name: "Maternelle",
    subcategories: ["Petite Section", "Moyenne Section", "Grande Section"],
  },
  {
    id: "primaire",
    name: "Primaire",
    subcategories: ["CP", "CE1", "CE2", "CM1", "CM2"],
  },
  {
    id: "premier-cycle",
    name: "Premier Cycle (Collège)",
    subcategories: ["6ème", "5ème", "4ème", "3ème"],
  },
  {
    id: "secondaire",
    name: "Secondaire (Lycée)",
    subcategories: ["2nde", "1ère", "Terminale"],
  },
  {
    id: "autres",
    name: "Autres Niveaux",
    subcategories: ["Formation Professionnelle", "Université"],
  },
];

export function SchoolManualMenu() {
  const [, navigate] = useLocation();
  const { isDarkMode } = useDarkMode();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const handleNavigate = (levelId: string, subcategory?: string) => {
    const path = subcategory
      ? `/school-manual/${levelId}/${subcategory.toLowerCase().replace(/\s+/g, "-")}`
      : `/school-manual/${levelId}`;
    navigate(path);
    setOpenMenu(null);
  };

  return (
    <div className="relative group">
      <button
        className={`font-medium transition-all duration-200 whitespace-nowrap text-sm flex items-center gap-2 px-3 py-1 rounded-lg ${
          isDarkMode
            ? "text-gray-300 hover:text-yellow-400 hover:bg-gray-700"
            : "text-gray-700 hover:text-yellow-600 hover:bg-yellow-50"
        }`}
      >
        Manuels Scolaires
        <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
      </button>

      {/* Menu déroulant desktop */}
      <div
        className={`absolute left-0 mt-0 w-64 rounded-lg shadow-xl border transition-all opacity-0 invisible group-hover:opacity-100 group-hover:visible z-50 ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-yellow-200"
        }`}
      >
        {SCHOOL_LEVELS.map((level) => (
          <div key={level.id} className="relative group/submenu">
            <button
              onClick={() => handleNavigate(level.id)}
              className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${
                isDarkMode
                  ? "hover:bg-gray-700 text-gray-300"
                  : "hover:bg-yellow-50 text-gray-700"
              }`}
            >
              <span className="font-medium">{level.name}</span>
              {level.subcategories && (
                <ChevronDown className="w-4 h-4 transition-transform group-hover/submenu:rotate-180" />
              )}
            </button>

            {/* Sous-menu */}
            {level.subcategories && (
              <div
                className={`absolute left-full top-0 mt-0 w-56 rounded-lg shadow-xl border transition-all opacity-0 invisible group-hover/submenu:opacity-100 group-hover/submenu:visible ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-yellow-200"
                }`}
              >
                {level.subcategories.map((subcategory) => (
                  <button
                    key={subcategory}
                    onClick={() => handleNavigate(level.id, subcategory)}
                    className={`w-full text-left px-4 py-2 transition-colors text-sm ${
                      isDarkMode
                        ? "hover:bg-gray-700 text-gray-300"
                        : "hover:bg-yellow-50 text-gray-700"
                    }`}
                  >
                    {subcategory}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
