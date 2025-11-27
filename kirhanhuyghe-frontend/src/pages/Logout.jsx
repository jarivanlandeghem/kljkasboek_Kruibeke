import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/auth';
import {
  Box,
  Button,
  Typography,
  Grid,
  Paper,
  CircularProgress
} from '@mui/material';
import KLJIcon from '../assets/KLJIcon.png';
import PlayingKids from '../assets/PlayingKids.jpg';

export default function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(true);

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        setIsLoggingOut(false);
      } catch (error) {
        console.error('Logout error:', error);
        setIsLoggingOut(false);
      }
    };

    performLogout();
  }, [logout]);

  const handleBackToLogin = () => {
    navigate('/login');
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
            justifyContent: 'center',
            minHeight: '60vh',
          }}
        >
          <img src={KLJIcon} alt="KLJ Logo" style={{ width: '100px', marginBottom: '20px' }} />
          
          {isLoggingOut ? (
            <>
              <CircularProgress sx={{ mb: 3 }} />
              <Typography component="h1" variant="h5">
                Uitloggen...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Een moment geduld
              </Typography>
            </>
          ) : (
            <>
              <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
                Je bent succesvol uitgelogd
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Bedankt voor het gebruik van het KLJ Portaal
              </Typography>
              
              <Button
                variant="contained"
                fullWidth
                onClick={handleBackToLogin}
                sx={{ maxWidth: '400px' }}
              >
                Terug naar login
              </Button>
            </>
          )}
        </Box>
      </Grid>
    </Grid>
  );
}