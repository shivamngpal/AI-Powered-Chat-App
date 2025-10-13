import { useState, useEffect } from "react";
import { useSocketContext } from "../context/SocketContext";
import Conversation from "./Conversation";

function Sidebar({ selectedUser, onSelectUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { onlineUsers } = useSocketContext();

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

  const handleSelectUser = (user) => {
    onSelectUser(user);
  };

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
          Conversations
        </h3>
      </div>

      {/* Users list */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading ? (
          <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
            <p>Loading...</p>
          </div>
        ) : (
          <div>
            {users.map((user) => (
              <Conversation
                key={user._id}
                user={{
                  id: user._id,
                  fullName: user.name, // Changed from user.fullName to user.name
                  profilePic:
                    user.profilePic || "https://via.placeholder.com/40",
                }}
                isOnline={onlineUsers.includes(user._id)}
                isSelected={selectedUser?._id === user._id}
                onClick={() =>
                  handleSelectUser({
                    id: user._id,
                    fullName: user.name, // Changed from user.fullName to user.name
                    profilePic:
                      user.profilePic || "https://via.placeholder.com/40",
                  })
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
