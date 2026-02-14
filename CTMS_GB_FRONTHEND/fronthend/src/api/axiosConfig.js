// src/api/axiosConfig.js
import axios from 'axios';

// Create instance with correct base URL
const apiPublic = axios.create({
  // baseURL: 'http://127.0.0.1:8000/api/',  // Make sure this is correct
  baseURL: '/api',  // Make sure this is correct
  // baseURL: "https://bay-wiley-highway-indicating.trycloudflare.com/api/",
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiPublic;
