// src/contexts/theme.context.jsx
import { createTheme, ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// We maken een statisch thema aan (altijd Light mode)
const theme = createTheme({
  typography: {
    fontFamily: "'Poppins', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    button: {
      textTransform: 'none', // Geen hoofdletters
      fontWeight: 600,
    },
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
  },
  palette: {
    mode: 'light', // Forceer light mode
    primary: {
      main: '#1a1a1a', // Zwart/Donkergrijs voor primaire acties
    },
    error: {
      main: '#d32f2f', // KLJ Rood
    },
    background: {
      default: '#f5f5f5', // Lichte achtergrond
      paper: '#ffffff',   // Witte kaarten
    },
  },
  shape: {
    borderRadius: 12, // Moderne ronde hoeken
  },
});

export const ThemeProvider = ({ children }) => {
  return (
    <MUIThemeProvider theme={theme}>
      {/* CssBaseline zorgt voor een consistente basisstijl (reset) */}
      <CssBaseline /> 
      {children}
    </MUIThemeProvider>
  );
};

// Export default voor consistentie met je imports
export default ThemeProvider;