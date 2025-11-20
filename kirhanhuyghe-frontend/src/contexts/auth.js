// src/contexts/auth.js
import { createContext, useContext } from 'react';
export const JWT_TOKEN_KEY = 'jwtToken';
export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);
const updatePassword = async (currentPassword, newPassword) => {
  // De axios instantie moet je auth header (token) al bevatten
  const response = await axios.put('/users/me/password', {
    currentPassword,
    newPassword,
  });
  return response.data;
};