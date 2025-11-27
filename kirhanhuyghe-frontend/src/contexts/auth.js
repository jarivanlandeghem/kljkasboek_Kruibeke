import { createContext, useContext } from 'react';

export const JWT_TOKEN_KEY = 'jwtToken';
export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);