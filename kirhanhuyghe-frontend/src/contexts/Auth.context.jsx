import {
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import useSWRMutation from 'swr/mutation';
import useSWR from 'swr';
import axios from 'axios';
import * as api from '../api';
import { JWT_TOKEN_KEY, AuthContext } from './auth';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem(JWT_TOKEN_KEY));
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  const {
    data: user,
    isLoading: userLoading,
    error: userError,
    mutate: mutateUser, // nodig om handmatig te verversen na login
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

          const result = await doLogin({ email, password });
          console.debug('Auth.login: doLogin result', result);

          let newToken;
          if (!result) newToken = null;
          else if (typeof result === 'string') newToken = result;
          else if (result.token) newToken = result.token;
          else if (result.data && result.data.token) newToken = result.data.token;

          if (!newToken) {
            console.error('Auth.login: no token found in login response', result);
            throw new Error('Geen token ontvangen bij login');
          }

          setToken(newToken);
          localStorage.setItem(JWT_TOKEN_KEY, newToken);

          setJustLoggedIn(true);

          axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

          await new Promise((res) => setTimeout(res, 120));
          await mutateUser();

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
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  useEffect(() => {
    if (
      userError &&
      userError.response?.status === 401 &&
      !loginLoading &&
      !justLoggedIn
    ) {
      console.error("Sessie verlopen, automatisch uitloggen...");
      logout();
    }
  }, [userError, loginLoading, logout, justLoggedIn]);

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