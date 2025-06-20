// src/Components/config.js
const API_BASE = import.meta.env.DEV
  ? '' // dev: routed by vite proxy
  : import.meta.env.VITE_API_URL; // production URL

export default API_BASE;
