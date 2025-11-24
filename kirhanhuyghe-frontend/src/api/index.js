// src/api/index.js
import axios from 'axios';

const baseUrl = import.meta?.env?.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================================================
// GENERIEKE METHODES (Geschikt voor SWR fetchers & mutations)
// ============================================================================

export const getAll = (path) =>
  api.get(`/${path}`).then((r) => {
    // Backend stuurt vaak { items: [...] }, maar soms direct een array.
    // Deze check zorgt dat beide werken.
    if (r.data && Array.isArray(r.data.items)) return r.data.items;
    return r.data;
  });

export const getById = (path) => api.get(`/${path}`).then((r) => r.data);

// SWR Mutation style: verwacht (key, { arg })
export const post = async (url, { arg }) => {
  const { data } = await api.post(`/${url}`, arg);
  return data;
};

// SWR Mutation style: verwacht (key, { arg })
export const update = async (url, { arg }) => {
  const { data } = await api.patch(`/${url}`, arg); 
  return data;
};

// SWR Mutation style: verwacht (key, { arg: id })
export const deleteById = async (url, { arg: id }) => {
  const { data } = await api.delete(`/${url}/${id}`);
  return data;
};

// Legacy methodes (zonder { arg } wrapper, voor direct gebruik buiten SWR)
export const put = async (path, arg) => {
  const { data } = await api.put(`/${path}`, arg);
  return data;
};

export const putById = async (url, { id, arg }) => {
  const { data } = await api.put(`/${url}/${id}`, arg);
  return data;
};

// ============================================================================
// SPECIFIEKE EXPORTS
// ============================================================================

// 1. USERS
export const getAllUsers = () => getAll('users');
export const updateUser = (id, data) => api.put(`/users/${id}`, data).then(r => r.data);

// 2. AANWEZIGHEDEN
export const getAanwezigheden = () => getAll('aanwezigheden');
export const getAanwezighedenByEvent = (eventId) => getAll(`evenementen/${eventId}/aanwezigheden`);

export const updateAanwezigheid = async (id, data) => {
  // Let op: Backend verwacht PATCH voor gedeeltelijke updates
  const { data: response } = await api.patch(`/aanwezigheden/${id}`, data);
  return response;
};

// 3. RONDE 
// Deze zijn handig als je ze specifiek wilt importeren, 
// maar 'post' en 'getAll' direct gebruiken in de component werkt ook prima.
export const importRonde = (payload) => post('ronde/import', { arg: payload });
export const getRondeResultaat = (rondeId) => getAll(`ronde/${rondeId}/resultaat`);

// 4. KASJES / BUDGETTEN
// Haalt alles op (komt overeen met GET /api/kasjes)
export const getKasjes = () => getAll('kasjes');

// Update een specifiek kasje (komt overeen met PUT /api/kasjes/:id)
export const updateKasje = (id, data) => api.put(`/kasjes/${id}`, data).then(r => r.data);