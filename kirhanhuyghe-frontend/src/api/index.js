// src/api/index.js
import axios from 'axios';

const baseUrl = import.meta?.env?.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
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

// Algemene methodes
export const getAll = (path) =>
  api.get(`/${path}`).then((r) => {
    if (r.data && Array.isArray(r.data.items)) return r.data.items;
    return r.data;
  });

export const getById = (path) => api.get(`/${path}`).then((r) => r.data);

export const post = async (url, { arg }) => {
  const { data } = await api.post(`/${url}`, arg);
  return data;
};

export const put = async (path, arg) => {
  const { data } = await api.put(`/${path}`, arg);
  return data;
};

export const putById = async (url, { id, arg }) => {
  const { data } = await api.put(`/${url}/${id}`, arg);
  return data;
};

export const deleteById = async (url, { arg: id }) => {
  const { data } = await api.delete(`/${url}/${id}`);
  return data;
};

// Specifieke exports voor SWR gebruik
export const getAllUsers = () => getAll('users');
export const updateUser = (id, data) => api.put(`/users/${id}`, data).then(r => r.data);