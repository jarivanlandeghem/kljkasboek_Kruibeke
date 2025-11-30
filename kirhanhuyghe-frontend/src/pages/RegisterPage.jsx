import { useState } from 'react';
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
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/auth';
import AlgemeneLayout from "../components/AlgemeneLayout";
import kidsPlaying from "../assets/PlayingKids.jpg";
import UserManagementDialog from '../components/UserManagementDialog';

import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: "easeOut" } 
  },
  exit: { opacity: 0, y: -20 }
};

const formContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 50 } }
};

const shakeVariants = {
  initial: { x: 0 },
  animate: { 
    x: [-10, 10, -10, 10, 0],
    transition: { duration: 0.4 }
  }
};

export default function RegisterPage() {
  const { register, user, ready } = useAuth(); 
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    voornaam: '',
    familienaam: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  if (!ready) {
    return (
      <AlgemeneLayout image={kidsPlaying}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress />
        </Box>
      </AlgemeneLayout>
    );
  }

  const isAdmin = user && user.roles && user.roles.includes('admin');

  if (!isAdmin) {
    return (
      <AlgemeneLayout image={kidsPlaying}>
        <Container maxWidth="sm" sx={{ py: 10 }}>
          <Paper 
            component={motion.div}
            variants={shakeVariants}
            initial="initial"
            animate="animate"
            elevation={3} 
            sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}
          >
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
              <ErrorOutline color="error" sx={{ fontSize: 60, mb: 2 }} />
            </motion.div>
            
            <Typography variant="h4" gutterBottom color="error" sx={{ fontWeight: 'bold' }}>
              Geen Toegang
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              U heeft beheerdersrechten nodig om deze pagina te bekijken.
            </Typography>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="contained" 
                component={RouterLink} 
                to="/"
                color="error"
              >
                Terug naar Home
              </Button>
            </motion.div>
          </Paper>
        </Container>
      </AlgemeneLayout>
    );
  }

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
      
      await register(dataToSend);
      
      setMessage({ 
        type: 'success', 
        text: 'Nieuwe gebruiker succesvol aangemaakt!' 
      });
      
      setFormData({
        voornaam: '',
        familienaam: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
      
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
        
        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <motion.div 
                initial={{ scale: 0, rotate: -180 }} 
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 100 }}
              >
                <Person sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              </motion.div>
              
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
                Nieuwe Gebruiker Registreren
              </Typography>
              <Typography variant="body1" color="text.secondary">
                (Alleen voor beheerders)
              </Typography>
            </Box>

            <AnimatePresence mode='wait'>
              {message.text && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert severity={message.type} sx={{ mb: 3 }}>
                    {message.text}
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <Box 
              component={motion.form} 
              onSubmit={handleSubmit}
              variants={formContainerVariants}
              initial="hidden"
              animate="show"
            >
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <motion.div variants={itemVariants}>
                    <TextField
                      fullWidth
                      label="Voornaam *"
                      name="voornaam"
                      value={formData.voornaam}
                      inputProps={{ 'data-cy': 'register_voornaam' }}
                      onChange={handleChange}
                    />
                  </motion.div>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <motion.div variants={itemVariants}>
                    <TextField
                      fullWidth
                      label="Familienaam *"
                      name="familienaam"
                      value={formData.familienaam}
                      inputProps={{ 'data-cy': 'register_familienaam' }}
                      onChange={handleChange}
                    />
                  </motion.div>
                </Grid>

                <Grid item xs={12}>
                  <motion.div variants={itemVariants}>
                    <TextField
                      fullWidth
                      label="E-mailadres *"
                      name="email"
                      type="email"
                      value={formData.email}
                      inputProps={{ 'data-cy': 'register_email' }}
                      onChange={handleChange}
                    />
                  </motion.div>
                </Grid>

                <Grid item xs={12}>
                  <motion.div variants={itemVariants}>
                    <TextField
                      fullWidth
                      label="Wachtwoord *"
                      name="password"
                      type="password"
                      value={formData.password}
                      inputProps={{ 'data-cy': 'register_password' }}
                      onChange={handleChange}
                      helperText="Minimaal 8 tekens"
                    />
                  </motion.div>
                </Grid>
                <Grid item xs={12}>
                  <motion.div variants={itemVariants}>
                    <TextField
                      fullWidth
                      label="Bevestig wachtwoord *"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      inputProps={{ 'data-cy': 'register_confirmPassword' }}
                      onChange={handleChange}
                    />
                  </motion.div>
                </Grid>
              </Grid>

              <motion.div 
                variants={itemVariants} 
                className="mt-6"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  sx={{ mt: 4, mb: 2, py: 1.5, fontWeight: 'bold', fontSize: '1rem' }}
                  startIcon={<Lock />}
                  data-cy="register_submit"
                >
                  {isLoading ? 'Aanmaken...' : 'Gebruiker Aanmaken'}
                </Button>
              </motion.div>
            </Box>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <UserManagementDialog />
            </motion.div>

          </Paper>
        </motion.div>
      </Container>
    </AlgemeneLayout>
  );
}