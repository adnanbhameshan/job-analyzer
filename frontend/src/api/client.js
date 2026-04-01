import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:5001/api', // Adjust in production
  withCredentials: true,
});

export default client;
