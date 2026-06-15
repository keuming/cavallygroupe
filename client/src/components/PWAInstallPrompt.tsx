import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';

export function PWAInstallPrompt() {
  const { showInstallPrompt, isIOS, canInstall, installApp, dismissInstallPrompt } = usePWA();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Afficher le prompt après 3 secondes si disponible
    if (showInstallPrompt && canInstall) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showInstallPrompt, canInstall]);

  const handleInstall = async () => {
    await installApp();
    setIsVisible(false);
  };

  const handleDismiss = () => {
    dismissInstallPrompt();
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 animate-in slide-in-from-bottom-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Installer l'app</h3>
              <p className="text-sm text-gray-600">Accès rapide sur votre écran d'accueil</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isIOS && (
          <p className="text-xs text-gray-600 mb-3">
            Appuyez sur <span className="font-semibold">Partager</span> puis <span className="font-semibold">Sur l'écran d'accueil</span>
          </p>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleDismiss}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Plus tard
          </Button>
          {!isIOS && (
            <Button
              onClick={handleInstall}
              size="sm"
              className="flex-1 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white"
            >
              Installer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
