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
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import { Person, Lock } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import AlgemeneLayout from "../components/AlgemeneLayout";
import kidsPlaying from "../assets/PlayingKids.jpg";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    voornaam: '',
    familienaam: '',
    email: '',
    password: '',
    confirmPassword: '',
    roles: ['user'] // Default role
  });

  const availableRoles = [
    { value: 'user', label: 'Gebruiker' },
    { value: 'admin', label: 'Beheerder' },
    { value: 'parent', label: 'Ouder' },
    { value: 'child', label: 'Kind' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData(prev => ({
      ...prev,
      roles: typeof value === 'string' ? value.split(',') : value,
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

    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Wachtwoord moet minimaal 6 tekens lang zijn' });
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Wachtwoorden komen niet overeen' });
      setIsLoading(false);
      return;
    }

    if (!formData.roles.length) {
      setMessage({ type: 'error', text: 'Selecteer minimaal één rol' });
      setIsLoading(false);
      return;
    }

    try {
      await register(formData);
      setMessage({ 
        type: 'success', 
        text: 'Account succesvol aangemaakt! Je wordt doorgestuurd...' 
      });
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Er is een fout opgetreden bij het aanmaken van het account' 
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
              Account aanmaken
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Maak een account aan om gebruik te maken van de applicatie
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
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Familienaam *"
                  name="familienaam"
                  value={formData.familienaam}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>

              {/* Account Gegevens */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="E-mailadres *"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Wachtwoord *"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  margin="normal"
                  helperText="Minimaal 6 tekens"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Bevestig wachtwoord *"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  margin="normal"
                />
              </Grid>

              {/* Rollen Selectie */}
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Rollen *</InputLabel>
                  <Select
                    multiple
                    name="roles"
                    value={formData.roles}
                    onChange={handleRoleChange}
                    label="Rollen *"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip 
                            key={value} 
                            label={availableRoles.find(role => role.value === value)?.label || value}
                            size="small"
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {availableRoles.map((role) => (
                      <MenuItem key={role.value} value={role.value}>
                        {role.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Selecteer de rollen voor deze gebruiker (meerdere mogelijk)
                </Typography>
              </Grid>
            </Grid>

            {/* Submit Knop */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ mt: 4, mb: 2 }}
              startIcon={<Lock />}
            >
              {isLoading ? 'Account aanmaken...' : 'Account aanmaken'}
            </Button>
          </Box>

          {/* Login Link */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Heb je al een account?{' '}
              <Link component={RouterLink} to="/login" underline="hover">
                Inloggen
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </AlgemeneLayout>
  );
}