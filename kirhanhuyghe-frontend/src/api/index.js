// src/api/index.js
import axiosRoot from 'axios';
import { JWT_TOKEN_KEY } from '../contexts/auth';

const baseUrl = import.meta.env.VITE_API_URL;

// Maak axios instance aan voordat je het gebruikt
export const axios = axiosRoot.create({
  baseURL: baseUrl,
});

// Interceptor toevoegen
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem(JWT_TOKEN_KEY);

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
});

// Functie declarations komen na de axios setup
export async function getAll(url) {
  const { data } = await axios.get(url);
  return data.items;
}

export const deleteById = async (url, { arg: id }) => {
  await axios.delete(`${url}/${id}`);
};

// Voor authenticatie frontend
export const post = async (url, { arg }) => {
  const { data } = await axios.post(url, arg);
  return data;
};