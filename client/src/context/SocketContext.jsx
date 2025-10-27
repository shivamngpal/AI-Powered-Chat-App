// changed useState to useRef
import { createContext, useState, useEffect, useContext, useRef } from "react";
import { useAuthContext } from "./AuthContext";
import io from "socket.io-client";

// Get Socket URL from environment or use relative URL for development
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "";

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
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
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
      // Use environment variable for production or relative URL for development
      const socketConnection = io(SOCKET_URL, {
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
        console.log("✅ Socket connected:", socketConnection.id);
        setIsConnected(true);
        setIsReconnecting(false);
        setConnectionError(null);
      });

      // Listen for online users updates
      socketConnection.on("getOnlineUsers", (users) => {
        console.log("👥 Online users updated:", users);
        setOnlineUsers(users);
      });

      // Disconnection event
      socketConnection.on("disconnect", (reason) => {
        console.log("❌ Socket disconnected:", reason);
        setIsConnected(false);

        // Show reconnecting state for user-initiated disconnect
        if (reason === "io server disconnect") {
          setConnectionError("Server disconnected");
        }
      });

      // Reconnection attempt
      socketConnection.on("reconnect_attempt", (attemptNumber) => {
        console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
        setIsReconnecting(true);
      });

      // Reconnection success
      socketConnection.on("reconnect", (attemptNumber) => {
        console.log(`✅ Reconnected after ${attemptNumber} attempts`);
        setIsConnected(true);
        setIsReconnecting(false);
        setConnectionError(null);
      });

      // Reconnection failed
      socketConnection.on("reconnect_failed", () => {
        console.error("❌ Reconnection failed");
        setIsReconnecting(false);
        setConnectionError("Failed to reconnect. Please refresh the page.");
      });

      // Error handling
      socketConnection.on("connect_error", (error) => {
        console.error("⚠️ Socket connection error:", error);
        setIsConnected(false);
        setConnectionError(error.message);
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
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        onlineUsers,
        isConnected,
        isReconnecting,
        connectionError,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
