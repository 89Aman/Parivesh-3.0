import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);
const THEME_KEY = 'parivesh-theme';

const readStoredTheme = () => {
  try {
    const value = localStorage.getItem(THEME_KEY);
    if (value === 'light' || value === 'dark') {
      return value;
    }
  } catch {
    // Ignore storage access errors.
  }
  return null;
};

const getSystemTheme = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) return { theme: 'light', toggleTheme: () => {} };
  return ctx;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => readStoredTheme() || getSystemTheme());

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const isDark = theme === 'dark';

    root.classList.toggle('dark', isDark);
    body.classList.toggle('dark', isDark);
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');

    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Ignore storage access errors.
    }
  }, [theme]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== THEME_KEY) return;
      const next = event.newValue;
      if (next === 'light' || next === 'dark') {
        setTheme(next);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    if (readStoredTheme() || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = () => setTheme(query.matches ? 'dark' : 'light');

    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', handleThemeChange);
      return () => query.removeEventListener('change', handleThemeChange);
    }

    query.addListener(handleThemeChange);
    return () => query.removeListener(handleThemeChange);
  }, []);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
