import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export function buildWebSocketUrl(path, token) {
  const configuredBase =
    import.meta.env.VITE_WS_BASE_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    window.location.origin;
  const normalizedBase = configuredBase.replace(/^http/i, "ws");
  const url = new URL(path, normalizedBase);

  if (token) {
    url.searchParams.set("token", token);
  }

  return url.toString();
}

export default api;
