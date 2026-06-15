import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';

export function PWAPrompt() {
  const { canInstall, isIOS, installApp, dismissInstallPrompt } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  useEffect(() => {
    // Afficher le prompt si installable
    if (canInstall) {
      // Attendre 3 secondes avant d'afficher le prompt
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [canInstall]);

  useEffect(() => {
    // Afficher le prompt iOS au chargement
    if (isIOS) {
      const hasSeenIOSPrompt = localStorage.getItem('pwa-ios-prompt-seen');
      if (!hasSeenIOSPrompt) {
        setShowIOSPrompt(true);
        localStorage.setItem('pwa-ios-prompt-seen', 'true');
      }
    }
  }, [isIOS]);

  const handleInstall = async () => {
    await installApp();
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    dismissInstallPrompt();
    setShowPrompt(false);
  };

  const handleIOSClose = () => {
    setShowIOSPrompt(false);
  };

  // Prompt d'installation Android/Windows
  if (showPrompt && !isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-white rounded-lg shadow-lg border-l-4 border-yellow-500 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Installer Cavaly Livres</h3>
                <p className="text-sm text-gray-600">Accédez à l'application directement depuis votre écran d'accueil</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleInstall}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
              size="sm"
            >
              Installer
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline"
              className="flex-1"
              size="sm"
            >
              Plus tard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Prompt pour iOS (instructions manuelles)
  if (showIOSPrompt && isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-white rounded-lg shadow-lg border-l-4 border-yellow-500 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Ajouter à l'écran d'accueil</h3>
              <ol className="text-sm text-gray-600 space-y-1">
                <li>1. Appuyez sur <span className="font-semibold">Partager</span></li>
                <li>2. Sélectionnez <span className="font-semibold">Sur l'écran d'accueil</span></li>
                <li>3. Appuyez sur <span className="font-semibold">Ajouter</span></li>
              </ol>
            </div>
            <button
              onClick={handleIOSClose}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
