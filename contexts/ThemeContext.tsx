// app/contexts/ThemeContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';

export interface Theme {
  isDark: boolean;
  colors: {
    background: string;
    surface: string;
    primary: string;
    text: string;
    textSecondary: string;
    border: string;
    headerBackground: string;
    shadowColor: string;
  };
}

const lightTheme: Theme = {
  isDark: false,
  colors: {
    background: '#fff',
    surface: '#F9F9F9',
    primary: '#007AFF',
    text: '#333',
    textSecondary: '#666',
    border: '#E0E0E0',
    headerBackground: '#fff',
    shadowColor: '#000',
  },
};

const darkTheme: Theme = {
  isDark: true,
  colors: {
    background: '#000',
    surface: '#1C1C1E',
    primary: '#0A84FF',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    border: '#38383A',
    headerBackground: '#1C1C1E',
    shadowColor: '#FFFFFF',
  },
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      } else {
        // Use system preference if no saved preference
        const systemTheme = Appearance.getColorScheme();
        setIsDark(systemTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    try {
      await AsyncStorage.setItem('theme', newIsDark ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const setTheme = async (newIsDark: boolean) => {
    setIsDark(newIsDark);
    try {
      await AsyncStorage.setItem('theme', newIsDark ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};