// src/pages/Login.jsx
import { useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { FormProvider, useForm, Controller } from 'react-hook-form';
import { useAuth } from '../contexts/auth';
import * as api from '../api'; 
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
  DialogActions,
  Divider,
  CircularProgress 
} from '@mui/material';
import { PersonAdd } from '@mui/icons-material';
import KLJIcon from '../assets/KLJIcon.png';
import PlayingKids from '../assets/PlayingKids.jpg';

const validationRules = {
  email: { 
    required: 'Email is een verplicht veld!',
    pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: "Ongeldig emailadres formaat"
    }
  },
  password: { required: 'Paswoord is een verplicht veld!' },
  firstName: { required: 'Voornaam is verplicht' },
  lastName: { required: 'Achternaam is verplicht' },
  requestEmail: { 
    required: 'Email is verplicht',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Ongeldig emailadres"
    }
  }
};

export default function Login() {
  const { loading, login } = useAuth(); 
  const navigate = useNavigate();
  const { search } = useLocation();
  
  // State voor dialogs
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogMessage, setErrorDialogMessage] = useState('');
  
  // State voor account aanvragen dialog
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Formulier 1: Login
  const loginMethods = useForm({
    defaultValues: {
      email: 'jasper.huyghe@outlook.be', // 👈 TEST WAARDE TERUGGEZET
      password: 'hashed_pw_123',         // 👈 TEST WAARDE TERUGGEZET
    },
  });

  // Formulier 2: Account Aanvragen
  const requestMethods = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: ''
    }
  });

  const { handleSubmit, control, formState: { errors } } = loginMethods;

  // --- Error Dialog Logic ---
  const openErrorDialog = (message) => {
    setErrorDialogMessage(message);
    setErrorDialogOpen(true);
  };

  const closeErrorDialog = () => {
    setErrorDialogOpen(false);
  };

  // --- Request Account Logic ---
  const handleOpenRequest = () => {
    requestMethods.reset();
    setRequestDialogOpen(true);
  };

  const handleCloseRequest = () => {
    if (!isSubmittingRequest) { 
      setRequestDialogOpen(false);
    }
  };

  const handleRequestSubmit = async (data) => {
    setIsSubmittingRequest(true); 

    try {
      await api.post('users/request-account', { 
        arg: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email 
        }
      });
      
      handleCloseRequest();
      openErrorDialog(`Bedankt ${data.firstName}, je aanvraag is succesvol verstuurd! Een beheerder kijkt er naar.`);
    
    } catch (err) {
      console.error("Fout bij aanvragen:", err);
      openErrorDialog("Er ging iets mis bij het versturen van de aanvraag. Probeer het later opnieuw.");
    } finally {
      setIsSubmittingRequest(false); 
    }
  };

  // --- Login Logic ---
  const handleLogin = useCallback(
    async ({ email, password }) => {
      if (!email || !password) {
        openErrorDialog('Gelieve zowel email als wachtwoord in te vullen.');
        return;
      }

      try {
        const loggedIn = await login(email, password);

        if (loggedIn) {
          const params = new URLSearchParams(search);
          navigate({
            pathname: params.get('redirect') || '/',
            replace: true,
          });
        } else {
          openErrorDialog('Ongeldige email of wachtwoord.');
        }
      } catch (error) {
        console.error("Login error detail:", error);

        if (error.response) {
            // Specifieke API foutmeldingen afhandelen
            if (error.response.status === 401 || error.response.status === 403) {
                openErrorDialog('Het opgegeven emailadres of wachtwoord is onjuist.');
            } 
            else if (error.response.status === 404) {
                openErrorDialog('Er is geen account gevonden met dit emailadres.');
            }
            else if (error.response.status >= 500) {
                openErrorDialog('Er is een probleem met de server. Probeer het later opnieuw.');
            }
            else {
                openErrorDialog('Er is een onbekende fout opgetreden bij het inloggen.');
            }
        } else if (error.request) {
            openErrorDialog('Geen verbinding met de server. Controleer je internetverbinding.');
        } else {
            openErrorDialog('Er is een technische fout opgetreden.');
        }
      }
    },
    [login, navigate, search],
  );

  const handleFormSubmit = (data) => {
    if (Object.keys(errors).length > 0) {
      openErrorDialog('Gelieve alle verplichte velden correct in te vullen.');
      return;
    }
    handleLogin(data);
  };

  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
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
          <img src={KLJIcon} alt="KLJ Logo" style={{ width: '100px', marginBottom: '20px' }} />
          
          <Typography component="h1" variant="h5">
            Welkom bij het KLJ Kasboek
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Meld je aan om verder te gaan
          </Typography>

          <FormProvider {...loginMethods}>
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
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  size="large"
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Inloggen'}
                </Button>

                <Divider>OF</Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  color="error" 
                  startIcon={<PersonAdd />}
                  onClick={handleOpenRequest}
                >
                  Geen account? Vraag toegang aan
                </Button>
              </Box>
            </Box>
          </FormProvider>
        </Box>
      </Grid>

      {/* --- Dialog 1: Account Aanvragen --- */}
      <Dialog 
        open={requestDialogOpen} 
        onClose={handleCloseRequest}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Account Aanvragen</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Vul onderstaande gegevens in. Een beheerder zal je aanvraag beoordelen.
          </DialogContentText>
          
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Controller
              name="firstName"
              control={requestMethods.control}
              rules={validationRules.firstName}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Voornaam"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="lastName"
              control={requestMethods.control}
              rules={validationRules.lastName}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Achternaam"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              name="email"
              control={requestMethods.control}
              rules={validationRules.requestEmail}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Emailadres"
                  type="email"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseRequest} color="inherit" disabled={isSubmittingRequest}>
            Annuleren
          </Button>
          <Button 
            onClick={requestMethods.handleSubmit(handleRequestSubmit)} 
            variant="contained"
            disabled={isSubmittingRequest}
            startIcon={isSubmittingRequest ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isSubmittingRequest ? 'Versturen...' : 'Vraag aan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- Dialog 2: Foutmeldingen/Succes POPUP --- */}
      <Dialog
        open={errorDialogOpen}
        onClose={closeErrorDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" sx={{ color: errorDialogMessage.includes('Bedankt') ? 'success.main' : 'error.main' }}>
          {errorDialogMessage.includes('Bedankt') ? 'Succes' : 'Foutmelding'}
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