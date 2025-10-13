import { createContext, useState, useEffect, useContext } from "react";
import { useAuthContext } from "./AuthContext";
import io from "socket.io-client";

// Create context
const SocketContext = createContext();

// Custom hook for easy access
export const useSocketContext = () => {
  return useContext(SocketContext);
};

// Provider component
export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { authUser } = useAuthContext();

  useEffect(() => {
    if (authUser) {
      // User logged in - create socket connection
      const socketConnection = io("http://localhost:3001", {
        query: {
          userId: authUser.id,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      setSocket(socketConnection);

      // Connection event
      socketConnection.on("connect", () => {
        console.log("✅ Socket connected:", socketConnection.id);
      });

      // Listen for online users updates
      socketConnection.on("getOnlineUsers", (users) => {
        console.log("📡 Online users updated:", users);
        setOnlineUsers(users);
      });

      // Disconnection event
      socketConnection.on("disconnect", () => {
        console.log("❌ Socket disconnected");
      });

      // Error handling
      socketConnection.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      // Cleanup when component unmounts or authUser changes
      return () => {
        console.log("🧹 Cleaning up socket connection");
        socketConnection.close();
      };
    } else {
      // User logged out - close socket if exists
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [authUser]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
