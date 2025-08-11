// web/src/lib/api.ts
import axios from 'axios';

export const API_BASE =
  (import.meta as any).env?.VITE_API_URL || (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3000';

export const api = axios.create({ baseURL: API_BASE, timeout: 12000 });
