import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Charger la préférence au montage du composant
  useEffect(() => {
    // Vérifier localStorage d'abord
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      const isDark = JSON.parse(savedMode);
      setIsDarkMode(isDark);
      applyDarkMode(isDark);
    } else {
      // Sinon, vérifier la préférence système
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      applyDarkMode(prefersDark);
    }
    setIsLoaded(true);
  }, []);

  // Appliquer le mode sombre au document
  const applyDarkMode = (isDark: boolean) => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
      html.style.colorScheme = 'dark';
    } else {
      html.classList.remove('dark');
      html.style.colorScheme = 'light';
    }
  };

  // Basculer le mode sombre
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
    applyDarkMode(newMode);
  };

  return {
    isDarkMode,
    toggleDarkMode,
    isLoaded,
  };
}
