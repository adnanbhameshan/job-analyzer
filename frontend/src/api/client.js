import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api', // Uses env variable in production
  withCredentials: true,
});

export default client;
