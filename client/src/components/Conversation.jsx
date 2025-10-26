import { useAuthContext } from "../context/AuthContext";


// AI Bot ID - must match backend
// Must be a valid 24-character hexadecimal string for MongoDB ObjectId
const AI_BOT_ID = "671a00000000000000000001";

function Conversation({ user, isOnline, isSelected, onClick }) {
  const { authUser } = useAuthContext();

  // Check if this is the AI bot
  const isAIBot = user.id === AI_BOT_ID;

  // Format timestamp for last message
  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return "";

    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffInMs = now - messageDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return messageDate.toLocaleDateString();
  };

  // Truncate long messages
  const truncateMessage = (text, maxLength = 35) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Get last message preview text
  const getLastMessagePreview = () => {
    if (!user.lastMessage) return "";

    const isMyMessage = user.lastMessage.senderId === authUser?.id;
    const prefix = isMyMessage ? "You: " : "";
    const messageText = truncateMessage(user.lastMessage.message);

    return prefix + messageText;
  };

  // Get initials for avatar fallback
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      onClick={onClick}
      style={{
        padding: "12px 15px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        cursor: "pointer",
        backgroundColor: isSelected ? "#e3f2fd" : "transparent",
        borderBottom: "1px solid #eee",
        transition: "background-color 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = "#f5f5f5";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = "transparent";
        }
      }}
    >
      {/* Avatar with online status indicator */}
      <div style={{ position: "relative" }}>
        <img
          src={user.profilePic || "https://via.placeholder.com/40"}
          alt={user.fullName}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
        {/* Online status dot */}
        {isOnline && (
          <div
            style={{
              position: "absolute",
              bottom: "2px",
              right: "2px",
              width: "10px",
              height: "10px",
              backgroundColor: "#4caf50",
              border: "2px solid white",
              borderRadius: "50%",
            }}
          />
        )}
      </div>

      {/* User name and last message */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2px",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "15px",
              fontWeight: isSelected ? "600" : "500",
              color: isSelected ? "#007bff" : "#333",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {user.fullName}
            {isAIBot && (
              <span
                style={{
                  fontSize: "14px",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  color: "white",
                  fontWeight: "bold",
                }}
                title="AI Assistant"
              >
                🤖 AI
              </span>
            )}
          </p>
          {/* Last message timestamp */}
          {user.lastMessage && (
            <span
              style={{
                fontSize: "11px",
                color: "#999",
                whiteSpace: "nowrap",
                marginLeft: "8px",
              }}
            >
              {formatLastMessageTime(user.lastMessage.createdAt)}
            </span>
          )}
        </div>

        {/* Last message preview */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              color: "#666",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontWeight: user.unreadCount > 0 ? "600" : "normal",
            }}
          >
            {getLastMessagePreview() || "No messages yet"}
          </p>

          {/* Unread count badge */}
          {user.unreadCount > 0 && (
            <div
              style={{
                backgroundColor: "#25D366",
                color: "white",
                borderRadius: "10px",
                minWidth: "18px",
                height: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: "bold",
                padding: "0 4px",
                marginLeft: "6px",
                flexShrink: 0,
              }}
            >
              {user.unreadCount > 99 ? "99+" : user.unreadCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Conversation;
