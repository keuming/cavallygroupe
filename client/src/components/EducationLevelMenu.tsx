import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useDarkMode } from "@/hooks/useDarkMode";

export interface EducationLevel {
  id: string;
  name: string;
  label: string;
  sublevels?: {
    id: string;
    name: string;
    label: string;
  }[];
}

const EDUCATION_LEVELS: EducationLevel[] = [
  {
    id: "maternelle",
    name: "Maternelle",
    label: "Maternelle",
    sublevels: [
      { id: "petite-section", name: "Petite Section", label: "Petite Section" },
      { id: "moyenne-section", name: "Moyenne Section", label: "Moyenne Section" },
      { id: "grande-section", name: "Grande Section", label: "Grande Section" },
    ],
  },
  {
    id: "primaire",
    name: "Primaire",
    label: "Primaire",
  },
  {
    id: "premier-cycle",
    name: "Premier Cycle",
    label: "Premier Cycle (Collège)",
  },
  {
    id: "secondaire",
    name: "Secondaire",
    label: "Secondaire (Lycée)",
  },
  {
    id: "autres",
    name: "Autres",
    label: "Autres niveaux",
  },
];

export function EducationLevelMenu() {
  const [, navigate] = useLocation();
  const { isDarkMode } = useDarkMode();
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);

  const handleNavigate = (levelId: string, sublevelId?: string) => {
    const path = sublevelId ? `/education/${levelId}/${sublevelId}` : `/education/${levelId}`;
    navigate(path);
    setExpandedLevel(null);
  };

  return (
    <div className="space-y-1">
      {EDUCATION_LEVELS.map((level) => (
        <div key={level.id}>
          <button
            onClick={() => {
              if (level.sublevels) {
                setExpandedLevel(expandedLevel === level.id ? null : level.id);
              } else {
                handleNavigate(level.id);
              }
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all ${
              isDarkMode
                ? "text-gray-100 hover:bg-gray-700 hover:text-yellow-400"
                : "text-gray-700 hover:bg-yellow-50 hover:text-yellow-600"
            }`}
          >
            <span>{level.label}</span>
            {level.sublevels && (
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  expandedLevel === level.id ? "rotate-180" : ""
                }`}
              />
            )}
          </button>

          {/* Sublevels */}
          {level.sublevels && expandedLevel === level.id && (
            <div className="ml-4 space-y-1 mt-1">
              {level.sublevels.map((sublevel) => (
                <button
                  key={sublevel.id}
                  onClick={() => handleNavigate(level.id, sublevel.id)}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all ${
                    isDarkMode
                      ? "text-gray-300 hover:bg-gray-700 hover:text-yellow-400"
                      : "text-gray-600 hover:bg-yellow-100 hover:text-yellow-700"
                  }`}
                >
                  {sublevel.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default EducationLevelMenu;
