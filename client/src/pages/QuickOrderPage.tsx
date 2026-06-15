import React from "react";
import { QuickOrderForm } from "@/components/QuickOrderForm";
import { useDarkMode } from "@/hooks/useDarkMode";

export function QuickOrderPage() {
  const { isDarkMode } = useDarkMode();

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-gray-950" : "bg-gray-50"}`}>
      {/* En-tête */}
      <div className={`${isDarkMode ? "bg-gray-900" : "bg-white"} border-b ${isDarkMode ? "border-gray-800" : "border-yellow-200"}`}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? "text-yellow-400" : "text-yellow-900"}`}>
            Commande Rapide
          </h1>
          <p className={`mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Créez votre liste de fournitures en quelques secondes
          </p>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire */}
          <div className="lg:col-span-2">
            <QuickOrderForm />
          </div>

          {/* Informations */}
          <div className="space-y-6">
            {/* Avantages */}
            <div className={`${isDarkMode ? "bg-gray-900" : "bg-white"} rounded-lg p-6 border ${isDarkMode ? "border-gray-800" : "border-yellow-200"}`}>
              <h3 className={`font-semibold mb-4 ${isDarkMode ? "text-yellow-400" : "text-yellow-900"}`}>
                ✨ Avantages
              </h3>
              <ul className={`space-y-2 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                <li>✓ Importer vos listes en PDF, Excel ou photo</li>
                <li>✓ Saisie manuelle simple et rapide</li>
                <li>✓ Estimation automatique du prix</li>
                <li>✓ Sauvegarde de vos listes</li>
                <li>✓ Livraison rapide en Côte d'Ivoire</li>
              </ul>
            </div>

            {/* Formats supportés */}
            <div className={`${isDarkMode ? "bg-gray-900" : "bg-white"} rounded-lg p-6 border ${isDarkMode ? "border-gray-800" : "border-yellow-200"}`}>
              <h3 className={`font-semibold mb-4 ${isDarkMode ? "text-yellow-400" : "text-yellow-900"}`}>
                📄 Formats Acceptés
              </h3>
              <div className="space-y-2 text-sm">
                <div className={`flex items-center gap-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  <span className="text-lg">📄</span>
                  <span>PDF</span>
                </div>
                <div className={`flex items-center gap-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  <span className="text-lg">📊</span>
                  <span>Excel (.xls, .xlsx)</span>
                </div>
                <div className={`flex items-center gap-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  <span className="text-lg">📸</span>
                  <span>Images (JPG, PNG)</span>
                </div>
                <div className={`flex items-center gap-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  <span className="text-lg">✏️</span>
                  <span>Saisie manuelle</span>
                </div>
              </div>
              <p className={`text-xs mt-3 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                Taille maximale: 10 MB
              </p>
            </div>

            {/* Besoin d'aide */}
            <div className={`${isDarkMode ? "bg-blue-900/20" : "bg-blue-50"} rounded-lg p-6 border ${isDarkMode ? "border-blue-800" : "border-blue-200"}`}>
              <h3 className={`font-semibold mb-2 ${isDarkMode ? "text-blue-400" : "text-blue-900"}`}>
                ❓ Besoin d'aide?
              </h3>
              <p className={`text-sm mb-3 ${isDarkMode ? "text-blue-300" : "text-blue-800"}`}>
                Contactez notre équipe pour toute question
              </p>
              <a
                href="mailto:service.clients@cavallygroupe.com"
                className={`inline-block px-4 py-2 rounded font-medium transition-colors ${isDarkMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
              >
                Nous Contacter
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
