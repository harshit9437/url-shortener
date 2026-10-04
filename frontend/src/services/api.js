import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add JWT automatically to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =========================
// AUTH
// =========================

export const registerUser = (data) =>
  api.post("/auth/register", data);

export const loginUser = (data) =>
  api.post("/auth/login", data);


// =========================
// URL
// =========================

export const createShortUrl = (data) =>
  api.post("/urls", data);

// IMPORTANT:
// Backend must provide GET /urls
// which returns URLs belonging to current user.
export const getMyUrls = () =>
  api.get("/urls");

export const getUrl = (id) =>
  api.get(`/urls/${id}`);

export const disableUrl = (id) =>
  api.delete(`/urls/${id}`);


// =========================
// ANALYTICS
// =========================

export const getAnalytics = (id) =>
  api.get(`/urls/${id}/analytics`);

export const getAnalyticsRange = (id, from, to) =>
  api.get(`/urls/${id}/analytics/range`, {
    params: {
      from,
      to,
    },
  });

export const getClickTimeline = (id, from, to) =>
  api.get(`/urls/${id}/analytics/timeline`, {
    params: {
      from,
      to,
    },
  });


export default api;