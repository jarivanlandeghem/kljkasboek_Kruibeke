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
  const [justLoggedIn, setJustLoggedIn] = useState(false);

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
          console.debug('Auth.login: doLogin result', result);

          // 2. Normaliseer waar het token kan zitten (verschillende axios/swr vormen)
          let newToken;
          if (!result) newToken = null;
          else if (typeof result === 'string') newToken = result;
          else if (result.token) newToken = result.token;
          else if (result.data && result.data.token) newToken = result.data.token;

          if (!newToken) {
            console.error('Auth.login: no token found in login response', result);
            throw new Error('Geen token ontvangen bij login');
          }

          // 3. Sla op in state en storage
          setToken(newToken);
          localStorage.setItem(JWT_TOKEN_KEY, newToken);

          // mark that we just logged in to ignore immediate 401s
          setJustLoggedIn(true);

          // 4. Zorg dat de API instantie de header meekrijgt (interceptor leest localStorage),
          //    en back-up: stel default axios header ook in voor direct gebruik.
          axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

          // 5. Klein waitje zodat axios instance/interceptor en storage settled
          await new Promise((res) => setTimeout(res, 120));
          // Vertel SWR dat hij users/me nu opnieuw moet proberen (met de nieuwe header)
          await mutateUser();

          // clear the just-logged-in guard after a short time
          setTimeout(() => setJustLoggedIn(false), 1500);

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
    if (
      userError &&
      userError.response?.status === 401 &&
      !loginLoading &&
      !justLoggedIn
    ) {
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