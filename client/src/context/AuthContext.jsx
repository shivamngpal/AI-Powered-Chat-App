import { createContext, useContext, useState, useEffect } from "react";

// 1. Create the context object
export const AuthContext = createContext();

// 3. Create the custom hook for easy access
export const useAuthContext = () => {
  return useContext(AuthContext);
};

// 2. Create the provider component
export const AuthProvider = ({ children }) => {
  // Attempt to get the user from localStorage.
  // This keeps the user logged in even after a page refresh.
  const [authUser, setAuthUser] = useState(() => {
    const storedUser = localStorage.getItem("chat-user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Use an effect to update localStorage whenever authUser changes.
  useEffect(() => {
    if (authUser) {
      localStorage.setItem("chat-user", JSON.stringify(authUser));
    } else {
      localStorage.removeItem("chat-user");
    }
  }, [authUser]);

  return (
    <AuthContext.Provider value={{ authUser, setAuthUser }}>
      {children}
    </AuthContext.Provider>
  );
};
