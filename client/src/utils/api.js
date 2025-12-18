const API_URL = import.meta.env.VITE_API_URL || "";

// Log API URL for debugging (only in development)
if (import.meta.env.DEV) {
  console.log("API_URL:", API_URL || "(using relative URLs)");
}

export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("jwt-token");

  // Debug logging
  console.log("fetchWithAuth called for:", url);
  console.log(
    "Token from localStorage:",
    token ? `${token.substring(0, 20)}...` : "null"
  );

  const defaultHeaders = {
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  } else {
    console.warn("⚠️ No token found in localStorage!");
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
  console.log("Full URL:", fullUrl);

  try {
    return await fetch(fullUrl, config);
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};
