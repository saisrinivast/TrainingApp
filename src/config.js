// src/config.js
const API_BASE = import.meta.env.DEV
  ? '' 
  : import.meta.env.VITE_API_URL;

export default API_BASE;
