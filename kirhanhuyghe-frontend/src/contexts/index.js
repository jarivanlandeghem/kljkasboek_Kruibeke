import { createContext, useContext } from 'react';

export const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const useThemeColor = () => {
  const { darkmode } = useContext(ThemeContext);
  return { darkmode };
}; 