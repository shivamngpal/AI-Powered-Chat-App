const API_URL = import.meta.env.VITE_API_URL || "";

export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("jwt-token");

  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    credentials: "include",
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  return fetch(`${API_URL}${url}`, config);
};