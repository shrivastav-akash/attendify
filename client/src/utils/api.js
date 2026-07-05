import axios from "axios";

// Auth is now cookie-based: the browser sends the httpOnly JWT cookie
// automatically, so we only need withCredentials + a CSRF token on mutations.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let csrfToken = null;

// Fetch a CSRF token once on app load; the server sets the paired httpOnly cookie.
export const initCsrf = async () => {
  try {
    const { data } = await api.get("/auth/csrf");
    csrfToken = data.csrfToken;
  } catch {
    csrfToken = null;
  }
};

const MUTATING = ["post", "put", "patch", "delete"];

// Attach the CSRF token to state-changing requests (double-submit cookie pattern).
api.interceptors.request.use((config) => {
  if (csrfToken && MUTATING.includes((config.method || "").toLowerCase())) {
    config.headers["x-csrf-token"] = csrfToken;
  }
  return config;
});

export default api;
