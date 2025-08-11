// web/src/lib/api.ts
import axios, { AxiosRequestConfig } from "axios";

export const API_BASE =
  (import.meta as any).env?.VITE_API_URL ??
  (typeof window !== "undefined"
    ? window.location.origin.replace(/\/$/, "")
    : "http://localhost:8080");

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 12000,
  headers: { "Content-Type": "application/json" },
});

// Optional helper if you want typed responses
export async function request<T = unknown>(path: string, config?: AxiosRequestConfig) {
  const res = await api.request<T>({ url: path, ...config });
  return res.data;
}
