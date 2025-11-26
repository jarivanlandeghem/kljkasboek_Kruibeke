import { createTheme, ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const theme = createTheme({
  typography: {
    fontFamily: "'Poppins', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    button: {
      textTransform: 'none', 
      fontWeight: 600,
    },
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
  },
  palette: {
    mode: 'light', 
    primary: {
      main: '#1a1a1a', 
    },
    error: {
      main: '#d32f2f',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff', 
    },
  },
  shape: {
    borderRadius: 12, 
  },
});

export const ThemeProvider = ({ children }) => {
  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline /> 
      {children}
    </MUIThemeProvider>
  );
};

export default ThemeProvider;