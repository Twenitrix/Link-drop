// api/client.ts — Centralized API client
//
// Instead of calling fetch() directly in every component with the same headers,
// we create one configured axios instance.
//
// Benefits:
//   - Auth header added automatically to every request
//   - Base URL configured once
//   - 401 errors handled in one place (auto logout)
//   - Easy to swap to a different API URL for prod

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:8000" : "");

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — runs before every request
// Reads the token from localStorage and adds it to the Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — runs after every response
// If the server returns 401, the token is expired/invalid — log the user out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ─── Typed API functions ──────────────────────────────────────────────────────
// These match the backend schemas exactly

export interface User {
  id: number;
  email: string;
  username: string;
  created_at: string;
}

export interface Link {
  id: number;
  original_url: string;
  short_code: string;
  title: string | null;
  clicks: number;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

// Auth
export const authApi = {
  register: (data: { email: string; username: string; password: string }) =>
    api.post<User>("/api/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post<Token>("/api/auth/login", data),
};

// Links
export const linksApi = {
  getAll: () =>
    api.get<Link[]>("/api/links/"),

  create: (data: { original_url: string; title?: string }) =>
    api.post<Link>("/api/links/", data),

  delete: (id: number) =>
    api.delete(`/api/links/${id}`),
};
