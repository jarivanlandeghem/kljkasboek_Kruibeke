// src/api/index.js
import axios from 'axios';

const baseUrl = 'http://localhost:3000/api'; 

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // laat cookies mee-sturen (indien server CORS dit toestaat)
});

// als je token in localStorage bewaart (naam kan anders zijn)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || null;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAll = (path) => api.get(`/${path}`).then(r => r.data);
// export async function getAll(url) {
//   const { data } = await axios.get(`${baseUrl}/${url}`); 

//   return data.items;
// }

export const deleteById = async (url, { arg: id }) => {
  await axios.delete(`${url}/${id}`);
};

// Voor authenticatie frontend
export const post = async (url, { arg }) => {
  const { data } = await axios.post(url, arg);
  return data;
};