const API_URL = import.meta.env.VITE_API_URL || "";

// Log API URL for debugging (only in development)
if (import.meta.env.DEV) {
  console.log("API_URL:", API_URL || "(using relative URLs)");
}

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

  const fullUrl = `${API_URL}${url}`;

  try {
    return await fetch(fullUrl, config);
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};
