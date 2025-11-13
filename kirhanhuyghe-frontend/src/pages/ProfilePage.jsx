import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Alert,
  Divider
} from '@mui/material';
import { Lock, Person, Edit } from '@mui/icons-material';
import { useAuth } from '../contexts/auth';
import AlgemeneLayout from "../components/AlgemeneLayout";
import kidsPlaying from "../assets/PlayingKids.jpg";

export default function ProfilePage() {
  const { user, updatePassword } = useAuth();
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Validatie
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Nieuwe wachtwoorden komen niet overeen' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Wachtwoord moet minimaal 6 tekens lang zijn' });
      return;
    }

    setIsLoading(true);

    try {
      await updatePassword(passwordData.currentPassword, passwordData.newPassword);
      setMessage({ type: 'success', text: 'Wachtwoord succesvol gewijzigd!' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Er is een fout opgetreden bij het wijzigen van het wachtwoord' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlgemeneLayout image={kidsPlaying}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          {/* Profiel Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Avatar
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: 'primary.main',
                fontSize: '2rem',
                mr: 3
              }}
            >
              {user?.voornaam?.charAt(0).toUpperCase() || 'G'}
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Welkom, {user?.voornaam || 'Gebruiker'}!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Beheer uw accountinstellingen en wachtwoord
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Grid container spacing={4}>
            {/* Profiel Informatie */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Person sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Profielinformatie</Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Voornaam
                </Typography>
                <Typography variant="body1">
                  {user?.voornaam || 'Niet beschikbaar'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Achternaam
                </Typography>
                <Typography variant="body1">
                  {user?.achternaam || 'Niet beschikbaar'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  E-mail
                </Typography>
                <Typography variant="body1">
                  {user?.email || 'Niet beschikbaar'}
                </Typography>
              </Box>

              <Button 
                variant="outlined" 
                startIcon={<Edit />}
                sx={{ mt: 2 }}
              >
                Profiel bewerken
              </Button>
            </Grid>

            {/* Wachtwoord Wijzigen */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Lock sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Wachtwoord wijzigen</Typography>
              </Box>

              {message.text && (
                <Alert 
                  severity={message.type} 
                  sx={{ mb: 2 }}
                >
                  {message.text}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Huidig wachtwoord"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  margin="normal"
                  required
                />
                
                <TextField
                  fullWidth
                  label="Nieuw wachtwoord"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  margin="normal"
                  required
                  helperText="Minimaal 6 tekens"
                />
                
                <TextField
                  fullWidth
                  label="Bevestig nieuw wachtwoord"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  margin="normal"
                  required
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  sx={{ mt: 3, mb: 2 }}
                >
                  {isLoading ? 'Wijzigen...' : 'Wachtwoord wijzigen'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </AlgemeneLayout>
  );
}