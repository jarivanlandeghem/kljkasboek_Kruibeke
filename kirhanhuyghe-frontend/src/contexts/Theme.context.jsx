//src/contexts/theme.context.jsx
// uit cursus, gevolgd & aangevuld tijdens de les

import { useState, useEffect, useMemo, useCallback } from 'react';
import {ThemeContext} from './'; // als je ./ doet zoekt hij naar de index.js


const ThemeProvider = ({ children }) => {
  
  const [darkmode, setDarkmode] = useState(Boolean(localStorage.getItem('darkmode')));

  
  useEffect(() => {
    if (darkmode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // mag normaal nooit maar dit is de enigste toegestane manier met combinatie react & tailwind css
    localStorage.setItem('darkmode', darkmode);
  }, [darkmode]);

  // toggle methode om manueel aan te passen
  // TODO dit moet gelijklopen met de button!
  const toggleDarkmode = useCallback(() => setDarkmode((prev) => !prev), []);
  // ? value om te zien wate de staat is?
  const value = useMemo(() => ({ darkmode, toggleDarkmode }), [darkmode, toggleDarkmode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;