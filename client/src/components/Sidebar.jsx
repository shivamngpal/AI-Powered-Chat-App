import { useState, useEffect } from "react";
import { useSocketContext } from "../context/SocketContext";
import { useAuthContext } from "../context/AuthContext";
import { fetchWithAuth } from "../utils/api";
import Conversation from "./Conversation";
import SearchBar from "./SearchBar";
import UserProfile from "./UserProfile";

const API_URL = import.meta.env.VITE_API_URL || "";


function Sidebar({ selectedUser, onSelectUser }) {
  const [users, setUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { onlineUsers, socket } = useSocketContext();
  const { authUser } = useAuthContext();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`/api/users`);
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
        borderRight: "1px solid #404040",
        backgroundColor: "#1A1A1A",
        display: "flex",
        flexDirection: "column",
        color: "#FAFAFA",
      }}
    >
      <div
        style={{
          padding: "20px",
          borderBottom: "1px solid #404040",
          backgroundColor: "#1A1A1A",
          color: "#FAFAFA",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img
            src="/vachchat-logo.png"
            alt="VachChat"
            style={{ width: "40px", height: "40px", objectFit: "contain" }}
          />
          <h3
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: "700",
              letterSpacing: "0.5px",
            }}
          >
            {isSearching ? "Search Results" : "VachChat"}
          </h3>
        </div>
        {/* Profile Button */}
        <button
          onClick={() => setShowProfile(true)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#262626")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
          title="Profile"
        >
          {authUser?.profilePic ? (
            <img
              src={authUser.profilePic}
              alt="Profile"
              style={{
                width: "35px",
                height: "35px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: "35px",
                height: "35px",
                borderRadius: "50%",
                backgroundColor: "#3B82F6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                fontWeight: "600",
                color: "#FFFFFF",
              }}
            >
              {authUser?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
        </button>
      </div>
      {/* Search Bar */}
      <SearchBar
        onSearchResults={handleSearchResults}
        onClearSearch={handleClearSearch}
      />
      {/* Users list */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading ? (
          <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>
            <p>Loading...</p>
          </div>
        ) : displayUsers.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>
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
                  profilePic: user.profilePic || "",
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
                    profilePic: user.profilePic || "",
                  });

                  // Clear search after selecting a user
                  handleClearSearch();
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* User Profile Sidebar */}
      <UserProfile isOpen={showProfile} onClose={() => setShowProfile(false)} />
    </div>
  );
}

export default Sidebar;
