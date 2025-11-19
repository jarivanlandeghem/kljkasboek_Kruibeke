// src/pages/Login.jsx
import { useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { FormProvider, useForm, Controller } from 'react-hook-form';
import { useAuth } from '../contexts/auth';
import Error from '../components/Error';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Grid, 
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions 
} from '@mui/material';
import KLJIcon from '../assets/KLJIcon.png';
import PlayingKids from '../assets/PlayingKids.jpg';

const validationRules = {
  email: {
    required: 'Email is een verplicht veld!',
  },
  password: {
    required: 'Paswoord is een verplicht veld!',
  },
};

export default function Login() {
  const { error, loading, login } = useAuth();
  const navigate = useNavigate();
  const { search } = useLocation();
  
  // State voor de foutmelding popup
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState('');

  const methods = useForm({
    defaultValues: {
      email: 'jasper.huyghe@outlook.be',
      password: 'hashed_pw_123',
    },
  });

  const { handleSubmit, reset, control, formState: { errors } } = methods;

  const handleCancel = useCallback(() => {
    reset();
  }, [reset]);

  // Functie om de foutdialog te openen
  const openErrorDialog = (message) => {
    setErrorDialogMessage(message);
    setErrorDialogOpen(true);
  };

  // Functie om de foutdialog te sluiten
  const closeErrorDialog = () => {
    setErrorDialogOpen(false);
  };

  const handleLogin = useCallback(
    async ({ email, password }) => {
      // Controleer of alle velden zijn ingevuld
      if (!email || !password) {
        openErrorDialog('Gelieve zowel email als wachtwoord in te vullen.');
        return;
      }

      const loggedIn = await login(email, password);
      if (loggedIn) {
        const params = new URLSearchParams(search);
        navigate({
          pathname: params.get('redirect') || '/',
          replace: true,
        });
      } else {
        // Toon foutmelding in popup als login mislukt
        openErrorDialog('Ongeldige email of wachtwoord. Probeer opnieuw.');
      }
    },
    [login, navigate, search],
  );

  // Effect voor form validation errors
  const hasValidationErrors = Object.keys(errors).length > 0;

  const handleFormSubmit = (data) => {
    if (hasValidationErrors) {
      openErrorDialog('Gelieve alle verplichte velden correct in te vullen.');
      return;
    }
    handleLogin(data);
  };

  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
      {/* Linkerkant – Afbeelding */}
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          backgroundImage: `url(${PlayingKids})`,
          backgroundRepeat: 'no-repeat',
          backgroundColor: (t) =>
            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Rechterkant – Formulier */}
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Logo */}
          <img src={KLJIcon} alt="KLJ Logo" style={{ width: '100px', marginBottom: '20px' }} />
          
          <Typography component="h1" variant="h5">
            Welkom bij het KLJ Kasboek
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Meld je aan om verder te gaan
          </Typography>

          {error && <Error message={error} />}

          <FormProvider {...methods}>
            <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} sx={{ mt: 1, width: '100%' }}>
              <Controller
                name="email"
                control={control}
                rules={validationRules.email}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email"
                    autoComplete="email"
                    autoFocus
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              
              <Controller
                name="password"
                control={control}
                rules={validationRules.password}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    margin="normal"
                    required
                    fullWidth
                    label="Paswoord"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                >
                  Inloggen
                </Button>
              </Box>
            </Box>
          </FormProvider>
        </Box>
      </Grid>

      {/* Foutmelding Dialog */}
      <Dialog
        open={errorDialogOpen}
        onClose={closeErrorDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" sx={{ color: 'error.main' }}>
          Inlogfout
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {errorDialogMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeErrorDialog} autoFocus>
            Oké
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}