import { useState, useEffect } from "react";
import { X, Download, Smartphone, BookOpen } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const dismissed = localStorage.getItem("pwa_dismissed_v2");
    if (dismissed && Date.now() - parseInt(dismissed) < 3 * 24 * 60 * 60 * 1000) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    if (ios) {
      setTimeout(() => { setShowBanner(true); setTimeout(() => setIsVisible(true), 50); }, 4000);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => { setShowBanner(true); setTimeout(() => setIsVisible(true), 50); }, 3000);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") { setIsInstalled(true); }
      setDeferredPrompt(null);
    }
    handleDismiss();
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);
    localStorage.setItem("pwa_dismissed_v2", Date.now().toString());
  };

  if (isInstalled || !showBanner) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-[200] p-4 transition-all duration-300 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}>
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-w-lg mx-auto">
        {/* Header coloré */}
        <div className="bg-gradient-to-r from-[#005f8a] to-[#0080b8] p-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-7 h-7 text-[#005f8a]" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-white">Installer Cavally Livres</p>
            <p className="text-blue-100 text-xs">Accès rapide depuis votre écran d'accueil</p>
          </div>
          <button onClick={handleDismiss} className="text-white/70 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-4">
          {isIOS ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 font-medium">Pour installer sur iPhone :</p>
              <div className="space-y-2">
                {[
                  { n: "1", t: "Appuyez sur le bouton Partager", icon: "⎙" },
                  { n: "2", t: "Sélectionnez "Sur l'écran d'accueil"", icon: "➕" },
                  { n: "3", t: "Appuyez sur "Ajouter"", icon: "✓" },
                ].map(s => (
                  <div key={s.n} className="flex items-center gap-3 bg-gray-50 rounded-lg p-2">
                    <span className="text-lg">{s.icon}</span>
                    <span className="text-sm text-gray-700">{s.t}</span>
                  </div>
                ))}
              </div>
              <button onClick={handleDismiss} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700">
                J'ai compris, merci
              </button>
            </div>
          ) : (
            <div>
              <div className="flex gap-2 mb-4">
                {["📚 Catalogue hors-ligne", "📋 Envoi de listes", "🔔 Notifications devis"].map(f => (
                  <span key={f} className="text-xs bg-blue-50 text-[#005f8a] px-2 py-1 rounded-full whitespace-nowrap">{f}</span>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={handleDismiss} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                  Plus tard
                </button>
                <button
                  onClick={handleInstall}
                  className="flex-1 py-2.5 bg-[#005f8a] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#004a6b]"
                >
                  <Download className="w-4 h-4" /> Installer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
