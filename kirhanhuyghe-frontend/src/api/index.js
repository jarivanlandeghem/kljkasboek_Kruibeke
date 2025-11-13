// src/api/index.js
import axios from 'axios';

// Use an env variable (Vite: VITE_API_URL) if provided, otherwise default to local backend
const baseUrl = import.meta?.env?.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true, // laat cookies mee-sturen (indien server CORS dit toestaat)
});

// als je token in localStorage bewaart (naam kan anders zijn)
api.interceptors.request.use((config) => {
  // Try all common token keys; the Auth provider uses 'jwtToken'
  const token =
    localStorage.getItem('jwtToken') ||
    localStorage.getItem('token') ||
    localStorage.getItem('accessToken') ||
    null;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAll = (path) =>
  api.get(`/${path}`).then((r) => {
    // Backend responses often return { items: [...] } — return items when present
    if (r.data && Array.isArray(r.data.items)) return r.data.items;
    return r.data;
  });
// export async function getAll(url) {
//   const { data } = await axios.get(`${baseUrl}/${url}`); 

//   return data.items;
// }

export const deleteById = async (url, { arg: id }) => {
  // use the configured api instance so the baseURL is applied
  const { data } = await api.delete(`/${url}/${id}`);
  return data;
};

// Voor authenticatie frontend
export const post = async (url, { arg }) => {
  // Post using the configured api instance so requests go to the backend
  const { data } = await api.post(`/${url}`, arg);
  return data;
};