// Service Worker et PWA désactivés
export function usePWA() {
  return {
    isOnline: true,
    isUpdateAvailable: false,
    applyUpdate: () => {},
    cacheUrls: (_urls: string[]) => {},
    clearCache: () => {},
  };
}
