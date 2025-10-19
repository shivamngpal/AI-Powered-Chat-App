import { useState, useEffect } from "react";
import { useSocketContext } from "../context/SocketContext";
import { useAuthContext } from "../context/AuthContext";
import Conversation from "./Conversation";
import SearchBar from "./SearchBar";

function Sidebar({ selectedUser, onSelectUser }) {
  const [users, setUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const { onlineUsers, socket } = useSocketContext();
  const { authUser } = useAuthContext();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/users", { credentials: "include" });
        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setUsers(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Listen for real-time unread count updates
  useEffect(() => {
    if (!socket) return;

    const handleUnreadCountUpdate = ({ senderId, unreadCount }) => {
      console.log("📬 Unread count update:", { senderId, unreadCount });

      // Don't update count if this conversation is currently selected (user is viewing it)
      if (senderId === selectedUser?.id) {
        console.log("⛔ Skipping unread count update - conversation is open");
        return;
      }

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === senderId ? { ...user, unreadCount } : user
        )
      );
    };

    const handleNewMessage = (newMessage) => {
      console.log("📨 New message in sidebar:", newMessage);

      // Update last message and unread count for the sender
      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          if (
            user._id === newMessage.senderId ||
            user._id === newMessage.receiverId
          ) {
            // Determine if this message is for this user
            const isForThisUser =
              (user._id === newMessage.senderId &&
                newMessage.receiverId === authUser?.id) ||
              (user._id === newMessage.receiverId &&
                newMessage.senderId === authUser?.id);

            if (isForThisUser) {
              // Update last message
              const updatedUser = { ...user, lastMessage: newMessage };

              // If I'm not viewing this conversation and I received the message, count is already updated by backend
              // If I sent the message, don't increment my unread count
              if (
                newMessage.senderId !== authUser?.id &&
                user._id !== selectedUser?.id
              ) {
                // Backend already incremented, just reflect it
                return updatedUser;
              }

              return updatedUser;
            }
          }
          return user;
        })
      );
    };

    socket.on("unreadCountUpdate", handleUnreadCountUpdate);
    socket.on("newMessage", handleNewMessage);
    console.log("👂 Sidebar listening for updates");

    return () => {
      socket.off("unreadCountUpdate", handleUnreadCountUpdate);
      socket.off("newMessage", handleNewMessage);
      console.log("🧹 Sidebar removing listeners");
    };
  }, [socket, authUser, selectedUser]);

  const handleSelectUser = (user) => {
    onSelectUser(user);
  };

  const handleSearchResults = (results) => {
    setSearchResults(results);
    setIsSearching(true);
  };

  const handleClearSearch = () => {
    setSearchResults([]);
    setIsSearching(false);
  };

  // Display either search results or all users
  const displayUsers = isSearching ? searchResults : users;

  return (
    <div
      style={{
        width: "300px",
        borderRight: "1px solid #ddd",
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "15px 20px",
          borderBottom: "1px solid #ddd",
          backgroundColor: "#007bff",
          color: "white",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
          {isSearching ? "Search Results" : "Conversations"}
        </h3>
      </div>

      {/* Search Bar */}
      <SearchBar
        onSearchResults={handleSearchResults}
        onClearSearch={handleClearSearch}
      />

      {/* Users list */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading ? (
          <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
            <p>Loading...</p>
          </div>
        ) : displayUsers.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
            <p>{isSearching ? "No users found" : "No conversations yet"}</p>
          </div>
        ) : (
          <div>
            {displayUsers.map((user) => (
              <Conversation
                key={user._id}
                user={{
                  id: user._id,
                  fullName: user.name, // Changed from user.fullName to user.name
                  profilePic:
                    user.profilePic || "https://via.placeholder.com/40",
                  unreadCount: user.unreadCount || 0,
                  lastMessage: user.lastMessage || null,
                }}
                isOnline={onlineUsers.includes(user._id)}
                isSelected={selectedUser?._id === user._id}
                onClick={() => {
                  // Reset unread count locally when user selects conversation
                  setUsers((prevUsers) =>
                    prevUsers.map((u) =>
                      u._id === user._id ? { ...u, unreadCount: 0 } : u
                    )
                  );

                  handleSelectUser({
                    id: user._id,
                    fullName: user.name, // Changed from user.fullName to user.name
                    profilePic:
                      user.profilePic || "https://via.placeholder.com/40",
                  });

                  // Clear search after selecting a user
                  handleClearSearch();
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
