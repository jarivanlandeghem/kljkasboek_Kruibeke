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
  } = useSWRMutation('session', api.post);  // moet session zijn!

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
        throw error; // Fout doorgooien zodat frontend het kan tonen
      }
    },
    [doLogin],
  );

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem(JWT_TOKEN_KEY);
  }, []);

  // 👇 1. NIEUWE FUNCTIE: REGISTER
  // Deze functie maakt de user aan, maar logt NIET in (zodat admin ingelogd blijft)
  const register = useCallback(async (data) => {
    // We gebruiken api.post die we in api/index.js hebben gemaakt
    // api.post verwacht (url, { arg: body })
    await api.post('users', { arg: data });
    return true;
  }, []);

  // 👇 2. BESTAANDE FUNCTIE: UPDATE PASSWORD
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
      register,       // 👈 3. TOEVOEGEN AAN EXPORT
      updatePassword, // 👈 3. TOEVOEGEN AAN EXPORT
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
      register,       // 👈 4. TOEVOEGEN AAN DEPENDENCIES
      updatePassword, // 👈 4. TOEVOEGEN AAN DEPENDENCIES
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};