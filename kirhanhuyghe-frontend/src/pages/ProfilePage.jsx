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
import { Lock, Person } from '@mui/icons-material';
import { useAuth } from '../contexts/auth';
import AlgemeneLayout from "../components/AlgemeneLayout";
import kidsPlaying from "../assets/PlayingKids.jpg";

// --- FRAMER MOTION IMPORTS ---
import { motion, AnimatePresence } from 'framer-motion';

// --- ANIMATIE VARIANTEN ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.15,
      when: "beforeChildren"
    }
  }
};

const cardVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 50, damping: 20 }
  }
};

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 60 }
  }
};

const alertVariants = {
  hidden: { opacity: 0, y: -10, height: 0 },
  visible: { 
    opacity: 1, 
    y: 0, 
    height: 'auto',
    transition: { duration: 0.3 }
  },
  exit: { opacity: 0, y: -10, height: 0, transition: { duration: 0.2 } }
};

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
      setMessage({ type: 'error', text: error.response?.data?.message || error.message || 'Er is een fout opgetreden bij het wijzigen van het wachtwoord' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlgemeneLayout image={kidsPlaying}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Wrap Paper in motion.div voor het 'opkomen' effect */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <Paper 
            component={motion.div} // Laat MUI Paper zich gedragen als een motion div
            variants={cardVariants}
            elevation={3} 
            sx={{ p: 4, borderRadius: 2, overflow: 'hidden' }}
          >
            
            {/* Profiel Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }} 
                transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
              >
                <Avatar
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    bgcolor: 'error.main', // KLJ Rood
                    fontSize: '2rem',
                    mr: 3,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                >
                  {user?.voornaam?.charAt(0).toUpperCase() || 'G'}
                </Avatar>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
                  Welkom, {user?.voornaam || 'Gebruiker'}!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Beheer uw accountinstellingen en wachtwoord
                </Typography>
              </motion.div>
            </Box>

            <motion.div variants={itemVariants}>
              <Divider sx={{ mb: 4 }} />
            </motion.div>

            <Grid container spacing={6}>
              
              {/* Linkerkant: Profiel Informatie */}
              <Grid item xs={12} md={6}>
                <motion.div variants={itemVariants}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Person sx={{ mr: 1, color: 'error.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Profielinformatie</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                        Voornaam
                      </Typography>
                      <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                        {user?.voornaam || 'Niet beschikbaar'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                        Achternaam
                      </Typography>
                      <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                        {user?.familienaam || 'Niet beschikbaar'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                        E-mail
                      </Typography>
                      <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                        {user?.email || 'Niet beschikbaar'}
                      </Typography>
                    </Box>
                  </Box>
                </motion.div>
              </Grid>

              {/* Rechterkant: Wachtwoord Wijzigen */}
              <Grid item xs={12} md={6}>
                <motion.div variants={itemVariants} custom={1}> {/* custom delay mogelijkheid */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Lock sx={{ mr: 1, color: 'error.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Wachtwoord wijzigen</Typography>
                  </Box>

                  {/* Animated Alert Message */}
                  <Box sx={{ minHeight: '50px', mb: 1 }}>
                    <AnimatePresence mode='wait'>
                      {message.text && (
                        <motion.div
                          key="alert"
                          variants={alertVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          <Alert severity={message.type} sx={{ mb: 2 }}>
                            {message.text}
                          </Alert>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Box>

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
                      variant="outlined"
                      size="small"
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
                      variant="outlined"
                      size="small"
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
                      variant="outlined"
                      size="small"
                    />

                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="error" // KLJ kleur
                        disabled={isLoading}
                        sx={{ 
                          mt: 3, 
                          mb: 2, 
                          py: 1.2, 
                          fontWeight: 'bold',
                          textTransform: 'none',
                          fontSize: '1rem'
                        }}
                      >
                        {isLoading ? 'Wijzigen...' : 'Wachtwoord wijzigen'}
                      </Button>
                    </motion.div>
                  </Box>
                </motion.div>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>
      </Container>
    </AlgemeneLayout>
  );
}