import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Vérifier si déjà installé
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Vérifier si déjà refusé récemment (7 jours)
    const dismissed = localStorage.getItem("pwa_install_dismissed");
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    // Détecter iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    if (ios) {
      // Sur iOS - afficher immédiatement si pas en standalone
      setShowBanner(true);
      return;
    }

    // Android/Desktop: intercepter l'événement natif
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Si l'événement ne se déclenche pas dans 5s, afficher quand même la bannière
    const fallback = setTimeout(() => {
      if (!deferredPrompt) setShowBanner(true);
    }, 5000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(fallback);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowBanner(false);
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa_install_dismissed", Date.now().toString());
  };

  if (isInstalled || !showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-slide-up">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 max-w-lg mx-auto">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-[#005f8a] rounded-xl flex items-center justify-center flex-shrink-0">
            <img src="/icon-96.png" alt="Cavally" className="w-8 h-8 rounded-lg" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm">Installer Cavally Livres</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {isIOS
                ? "Appuyez sur ⎙ puis "Sur l'écran d'accueil""
                : "Accédez rapidement à votre librairie depuis votre écran d'accueil"}
            </p>
            {!isIOS && (
              <button
                onClick={handleInstall}
                className="mt-2 flex items-center gap-1.5 bg-[#005f8a] text-white text-xs px-4 py-2 rounded-lg font-semibold hover:bg-[#004a6b] transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Installer l'application
              </button>
            )}
            {isIOS && (
              <div className="mt-2 flex items-center gap-1 text-xs text-[#005f8a] font-medium">
                <Smartphone className="w-3.5 h-3.5" />
                Tap ⎙ → Sur l'écran d'accueil
              </div>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
