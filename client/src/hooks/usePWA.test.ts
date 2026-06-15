import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePWA } from './usePWA';

describe('usePWA Hook', () => {
  beforeEach(() => {
    // Réinitialiser les mocks
    vi.clearAllMocks();
    
    // Mock navigator.serviceWorker
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        register: vi.fn().mockResolvedValue({
          addEventListener: vi.fn()
        })
      },
      writable: true
    });
  });

  it('devrait initialiser avec les valeurs par défaut', () => {
    const { result } = renderHook(() => usePWA());
    
    expect(result.current.isInstallable).toBe(false);
    expect(result.current.isInstalled).toBe(false);
    expect(result.current.isIOS).toBe(false);
    expect(result.current.deferredPrompt).toBeNull();
  });

  it('devrait enregistrer le Service Worker', async () => {
    renderHook(() => usePWA());
    
    // Attendre que le Service Worker soit enregistré
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js', {
      scope: '/'
    });
  });

  it('devrait détecter iOS', () => {
    // Mock iOS user agent
    Object.defineProperty(navigator, 'userAgent', {
      value: 'iPhone OS 15_0 like Mac OS X',
      writable: true
    });
    
    const { result } = renderHook(() => usePWA());
    
    // iOS devrait être détecté
    expect(result.current.isIOS).toBe(true);
  });

  it('devrait détecter l\'installation de l\'app', () => {
    // Mock display-mode: standalone
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(display-mode: standalone)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }));
    
    const { result } = renderHook(() => usePWA());
    
    expect(result.current.isInstalled).toBe(true);
  });

  it('devrait gérer l\'événement beforeinstallprompt', async () => {
    const { result } = renderHook(() => usePWA());
    
    // Créer un événement beforeinstallprompt
    const event = new Event('beforeinstallprompt');
    Object.assign(event, {
      prompt: vi.fn(),
      userChoice: Promise.resolve({ outcome: 'accepted' })
    });
    
    window.dispatchEvent(event);
    
    // Attendre que le hook traite l'événement
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(result.current.isInstallable).toBe(true);
  });

  it('devrait installer l\'app', async () => {
    const { result } = renderHook(() => usePWA());
    
    // Créer un événement beforeinstallprompt
    const mockPrompt = vi.fn();
    const event = new Event('beforeinstallprompt');
    Object.assign(event, {
      prompt: mockPrompt,
      userChoice: Promise.resolve({ outcome: 'accepted' })
    });
    
    window.dispatchEvent(event);
    
    // Attendre que le hook traite l'événement
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Appeler installApp
    await result.current.installApp();
    
    expect(mockPrompt).toHaveBeenCalled();
  });

  it('devrait gérer l\'événement appinstalled', async () => {
    const { result } = renderHook(() => usePWA());
    
    // Créer un événement appinstalled
    const event = new Event('appinstalled');
    window.dispatchEvent(event);
    
    // Attendre que le hook traite l'événement
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(result.current.isInstalled).toBe(true);
  });

  it('devrait retourner canInstall true quand installable et non installé', async () => {
    const { result } = renderHook(() => usePWA());
    
    // Créer un événement beforeinstallprompt
    const event = new Event('beforeinstallprompt');
    Object.assign(event, {
      prompt: vi.fn(),
      userChoice: Promise.resolve({ outcome: 'accepted' })
    });
    
    window.dispatchEvent(event);
    
    // Attendre que le hook traite l'événement
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(result.current.canInstall).toBe(true);
  });

  it('devrait retourner canInstall false quand installé', async () => {
    // Mock display-mode: standalone
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(display-mode: standalone)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }));
    
    const { result } = renderHook(() => usePWA());
    
    expect(result.current.canInstall).toBe(false);
  });
});
