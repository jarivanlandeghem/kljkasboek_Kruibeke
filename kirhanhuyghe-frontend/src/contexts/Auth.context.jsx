// src/contexts/Auth.context.jsx
import {
  useState,
  useCallback,
  useMemo,
} from 'react';
import useSWRMutation from 'swr/mutation';
import useSWR from 'swr';
import * as api from '../api';
import { JWT_TOKEN_KEY, AuthContext } from './auth';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem(JWT_TOKEN_KEY));

  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useSWR(token ? 'users/me' : null, api.getById);

  const {
    trigger: doLogin,
    isMutating: loginLoading,
    error: loginError,
  } = useSWRMutation('session', api.post); // 'session' of 'sessions' moet matchen met je backend controller

  const login = useCallback(
    async (email, password) => {
      try {
        console.debug('Auth.login: calling doLogin', { url: import.meta.env.VITE_API_URL || '/api', email });
        const result = await doLogin({
          email,
          password,
        });
        console.debug('Auth.login: doLogin result', result);
        const { token } = result || {};

        setToken(token);
        localStorage.setItem(JWT_TOKEN_KEY, token);

        return true;
      } catch (error) {
        console.error('Auth.login: login error', error);
        return false;
      }
    },
    [doLogin],
  );

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem(JWT_TOKEN_KEY);
  }, []);

  // 👇 NIEUWE FUNCTIE: Wachtwoord wijzigen
  const updatePassword = useCallback(async (currentPassword, newPassword) => {
    // We roepen de API direct aan.
    // Zorg dat api.put bestaat in je '../api' bestand.
    // Endpoint: users/me/password (komt overeen met backend @Put('me/password') in UserController)
    await api.put('users/me/password', {
      currentPassword,
      newPassword,
    });
    
    return true;
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      error: loginError || userError,
      loading: loginLoading || userLoading,
      isAuthed: Boolean(token),
      ready: !userLoading,
      login,
      logout,
      updatePassword, // 👈 Toevoegen aan de export
    }),
    [
      token,
      user,
      loginError,
      loginLoading,
      userError,
      userLoading,
      login,
      logout,
      updatePassword, // 👈 Toevoegen aan dependencies
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};