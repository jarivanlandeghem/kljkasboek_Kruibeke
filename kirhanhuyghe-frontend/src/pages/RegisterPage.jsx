// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { Person, Lock, ErrorOutline } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import AlgemeneLayout from "../components/AlgemeneLayout";
import kidsPlaying from "../assets/PlayingKids.jpg";
import UserManagementDialog from '../components/UserManagementDialog';

export default function RegisterPage() {
  // 1. Haal user en ready status op
  const { register, user, ready } = useAuth(); 
  // const navigate = useNavigate();
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    voornaam: '',
    familienaam: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // ---------------------------------------------------------
  // BEVEILIGING LOGICA
  // ---------------------------------------------------------
  
  // 1. Wachten tot we weten of de gebruiker is ingelogd
  if (!ready) {
    return (
      <AlgemeneLayout image={kidsPlaying}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress />
        </Box>
      </AlgemeneLayout>
    );
  }

  // 2. Controleer of het een admin is
  const isAdmin = user && user.roles && user.roles.includes('admin');

  if (!isAdmin) {
    return (
      <AlgemeneLayout image={kidsPlaying}>
        <Container maxWidth="sm" sx={{ py: 10 }}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <ErrorOutline color="error" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h4" gutterBottom color="error">
              Geen Toegang
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              U heeft beheerdersrechten nodig om deze pagina te bekijken.
            </Typography>
            <Button 
              variant="contained" 
              component={RouterLink} 
              to="/"
            >
              Terug naar Home
            </Button>
          </Paper>
        </Container>
      </AlgemeneLayout>
    );
  }

  // ---------------------------------------------------------
  // REGISTRATIE LOGICA (Alleen zichtbaar voor admins)
  // ---------------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    // Validatie
    if (!formData.voornaam || !formData.familienaam || !formData.email || !formData.password) {
      setMessage({ type: 'error', text: 'Vul alle verplichte velden in' });
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setMessage({ type: 'error', text: 'Wachtwoord moet minimaal 8 tekens lang zijn' });
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Wachtwoorden komen niet overeen' });
      setIsLoading(false);
      return;
    }

    try {
      const dataToSend = {
        voornaam: formData.voornaam,
        familienaam: formData.familienaam,
        email: formData.email,
        paswoord: formData.password, 
      };

      // Omdat we al admin zijn, maken we hier een nieuwe user aan.
      // Let op: Je backend 'register' functie logt de nieuwe gebruiker misschien automatisch in 
      // en geeft een token terug. Als admin wil je waarschijnlijk NIET uitgelogd worden.
      // Als je backend 'register' puur een user aanmaakt is het goed. 
      // Als 'register' in je AuthContext de token vervangt, wordt de admin uitgelogd.
      
      await register(dataToSend);
      
      setMessage({ 
        type: 'success', 
        text: 'Nieuwe gebruiker succesvol aangemaakt!' 
      });
      
      // Reset formulier zodat admin nog iemand kan toevoegen
      setFormData({
        voornaam: '',
        familienaam: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
      
      // We navigeren NIET weg, want de admin wil misschien nog iemand toevoegen
      // of rollen aanpassen.
      
    } catch (error) {
      console.error(error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Er is een fout opgetreden bij het aanmaken van het account' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlgemeneLayout image={kidsPlaying}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Person sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Nieuwe Gebruiker Registreren
            </Typography>
            <Typography variant="body1" color="text.secondary">
              (Alleen voor beheerders)
            </Typography>
          </Box>

          {message.text && (
            <Alert severity={message.type} sx={{ mb: 3 }}>
              {message.text}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Persoonlijke Gegevens */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Voornaam *"
                  name="voornaam"
                  value={formData.voornaam}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Familienaam *"
                  name="familienaam"
                  value={formData.familienaam}
                  onChange={handleChange}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="E-mailadres *"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Grid>

              {/* Wachtwoorden */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Wachtwoord *"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  helperText="Minimaal 8 tekens"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bevestig wachtwoord *"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ mt: 4, mb: 2 }}
              startIcon={<Lock />}
            >
              {isLoading ? 'Aanmaken...' : 'Gebruiker Aanmaken'}
            </Button>
          </Box>

          {/* Admin beheer knop */}
          <UserManagementDialog />

        </Paper>
      </Container>
    </AlgemeneLayout>
  );
}