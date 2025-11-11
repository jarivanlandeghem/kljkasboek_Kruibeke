// src/pages/Login.jsx
import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { FormProvider, useForm, Controller } from 'react-hook-form';
import { useAuth } from '../contexts/auth';
import Error from '../components/Error';

import { Box, Button, TextField, Typography } from '@mui/material';

const validationRules = {
  email: {
    required: 'Email is required',
  },
  password: {
    required: 'Password is required',
  },
};

export default function Login() {
  const { error, loading, login } = useAuth();
  const navigate = useNavigate();

  const methods = useForm({
    defaultValues: {
      email: 'thomas.aelbrecht@hogent.be',
      password: '12345678',
    },
  });
  const { handleSubmit, reset, control } = methods;

  const handleCancel = useCallback(() => {
    reset();
  }, [reset]);

  const handleLogin = useCallback(
    async ({ email, password }) => {
      const loggedIn = await login(email, password);
      if (loggedIn) {
        navigate({
          pathname: '/',
          replace: true,
        });
      }
    },
    [login, navigate]
  );

  return (
    <FormProvider {...methods}>
      <Box
        sx={{
          maxWidth: 400,
          mx: 'auto',
          mt: 8,
          p: 4,
          borderRadius: 2,
          boxShadow: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Sign in
        </Typography>

        {error && <Error error={error} />}

        <form onSubmit={handleSubmit(handleLogin)}>
          <Controller
            name="email"
            control={control}
            rules={validationRules.email}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Email"
                type="email"
                fullWidth
                margin="normal"
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
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
            <Button
              type="button"
              variant="outlined"
              color="secondary"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              Sign in
            </Button>
          </Box>
        </form>
      </Box>
    </FormProvider>
  );
}
