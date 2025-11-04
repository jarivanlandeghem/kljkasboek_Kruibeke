// src/api/index.js
import axios from 'axios';

const baseUrl = 'http://localhost:3000/api'; 

export async function getAll(url) {
  const { data } = await axios.get(`${baseUrl}/${url}`); 

  return data.items;
}

export const deleteById = async (url, { arg: id }) => {
  await axios.delete(`${baseUrl}/${url}/${id}`); 
};
