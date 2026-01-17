import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  withCredentials: true,
});

/* ================================
   REQUEST INTERCEPTOR (ADMIN TOKEN)
================================ */
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("admin_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ================================
   RESPONSE INTERCEPTOR (ERROR SHIELD)
================================ */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network / server unreachable
    if (!error.response) {
      if (typeof window !== "undefined") {
        window.location.replace("/error");
      }
      return Promise.reject(error);
    }

    const status = error.response.status;

    if (typeof window !== "undefined") {
      switch (status) {
        case 401:
          // Admin token expired / invalid
          localStorage.removeItem("admin_token");
          window.location.replace("/admin/login");
          break;

        case 403:
          window.location.replace("/403");
          break;

        case 404:
          window.location.replace("/not-found");
          break;

        default:
          if (status >= 500) {
            window.location.replace("/error");
          }
      }
    }

    return Promise.reject(error);
  }
);

