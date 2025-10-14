// changed useState to useRef
import { createContext, useState, useEffect, useContext, useRef } from "react";
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
  const socketRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { authUser } = useAuthContext();

  useEffect(() => {
    if (authUser) {
      // Close any existing socket first
      if (socketRef.current) {
        console.log("Closing existing socket before creating new one");
        socketRef.current.off();
        socketRef.current.close();
      }

      // User logged in - create socket connection
      const socketConnection = io("http://localhost:3001", {
        query: {
          userId: authUser.id,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      socketRef.current = socketConnection;

      // Connection event
      socketConnection.on("connect", () => {
        console.log("Socket connected:", socketConnection.id);
      });

      // Listen for online users updates
      socketConnection.on("getOnlineUsers", (users) => {
        console.log("Online users updated:", users);
        setOnlineUsers(users);
      });

      // Disconnection event
      socketConnection.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      // Error handling
      socketConnection.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      // Cleanup when component unmounts or authUser changes
      return () => {
        console.log("Cleaning up socket connection");
        if (socketRef.current) {
          socketRef.current.off(); // Remove all listeners
          socketRef.current.close(); // Close connection
          socketRef.current = null;
        }
        setOnlineUsers([]);
      };
    }
  }, [authUser]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
