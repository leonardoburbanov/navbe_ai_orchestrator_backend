import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8003';

export const apiClient = axios.create({
  baseURL: API_URL,
});
