// web/src/lib/api.ts
import axios, { AxiosRequestConfig, AxiosHeaders } from "axios";

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

api.interceptors.request.use((cfg) => {
  const token = (import.meta as any).env?.VITE_ADMIN_TOKEN as string | undefined;
  if (!token) return cfg;

  // Normalize to AxiosHeaders so TS is happy
  const hdrs =
    cfg.headers instanceof AxiosHeaders
      ? cfg.headers
      : AxiosHeaders.from(cfg.headers);

  hdrs.set("Authorization", `Bearer ${token}`);
  cfg.headers = hdrs;
  return cfg;
});

// Optional helper if you want typed responses
export async function request<T = unknown>(path: string, config?: AxiosRequestConfig) {
  const res = await api.request<T>({ url: path, ...config });
  return res.data;
}
