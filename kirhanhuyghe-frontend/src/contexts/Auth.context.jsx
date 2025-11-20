// src/contexts/Auth.context.jsx
import {
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import useSWRMutation from 'swr/mutation';
import useSWR from 'swr';
import axios from 'axios'; // 👈 1. BELANGRIJK: Importeer axios zodat we de header kunnen zetten
import * as api from '../api';
import { JWT_TOKEN_KEY, AuthContext } from './auth';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem(JWT_TOKEN_KEY));

  // Als we de pagina laden, zetten we direct de header goed als er een token is
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  const {
    data: user,
    isLoading: userLoading,
    error: userError,
    mutate: mutateUser, // 👈 We hebben deze nodig om handmatig te verversen na login
  } = useSWR(token ? 'users/me' : null, api.getById);

  const {
    trigger: doLogin,
    isMutating: loginLoading,
    error: loginError,
  } = useSWRMutation('session', api.post);

  const login = useCallback(
    async (email, password) => {
      try {
        console.debug('Auth.login: calling doLogin');
        
        // 1. Haal de token op
        const result = await doLogin({ email, password });
        const { token: newToken } = result || {};

        // 2. Sla op in state en storage
        setToken(newToken);
        localStorage.setItem(JWT_TOKEN_KEY, newToken);

        // 3. CRUCIAAL: Forceer de Axios header DIRECT update
        // Hierdoor gaat de volgende request (users/me) wél met de juiste token weg
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        // 4. Vertel SWR dat hij users/me nu opnieuw moet proberen (met de nieuwe header)
        await mutateUser(); 

        return true;
      } catch (error) {
        console.error('Auth.login: login error', error);
        throw error;
      }
    },
    [doLogin, mutateUser],
  );

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem(JWT_TOKEN_KEY);
    // Verwijder ook de header bij uitloggen
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  // 👇 DE FIX VOOR DE BUG
  useEffect(() => {
    // Log alleen automatisch uit als:
    // 1. Er een userError is
    // 2. De error daadwerkelijk een 401 (Unauthorized) is
    // 3. We NIET net bezig zijn met inloggen (loginLoading)
    if (userError && userError.response?.status === 401 && !loginLoading) {
      console.error("Sessie verlopen, automatisch uitloggen...");
      logout();
    }
  }, [userError, loginLoading, logout]);

  const register = useCallback(async (data) => {
    await api.post('users', { arg: data });
    return true;
  }, []);

  const updatePassword = useCallback(async (currentPassword, newPassword) => {
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
      register,
      updatePassword,
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
      register,
      updatePassword,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};