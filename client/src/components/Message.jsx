import { useAuthContext } from "../context/AuthContext";

function Message({ message }) {
  const { authUser } = useAuthContext();

  // Check if this message is from the logged-in user
  const isMyMessage = message.senderId === authUser?.id;

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status icon based on message status
  const getStatusIcon = () => {
    if (!isMyMessage) return null; // Only show status on sender's messages

    switch (message.status) {
      case "sent":
        return (
          <span
            style={{ marginLeft: "4px", color: "rgba(255, 255, 255, 0.7)" }}
          >
            ✓
          </span>
        );
      case "delivered":
        return (
          <span
            style={{ marginLeft: "4px", color: "rgba(255, 255, 255, 0.7)" }}
          >
            ✓✓
          </span>
        );
      case "read":
        return (
          <span
            style={{ marginLeft: "4px", color: "#06f569ff", fontWeight: "bold" }}
          >
            ✓✓
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isMyMessage ? "flex-end" : "flex-start",
        marginBottom: "15px",
        padding: "0 15px",
      }}
    >
      <div
        style={{
          maxWidth: "60%",
          backgroundColor: isMyMessage ? "#007bff" : "#e9ecef",
          color: isMyMessage ? "white" : "black",
          padding: "10px 15px",
          borderRadius: "18px",
          borderBottomRightRadius: isMyMessage ? "4px" : "18px",
          borderBottomLeftRadius: isMyMessage ? "18px" : "4px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ wordWrap: "break-word", marginBottom: "5px" }}>
          {message.message}
        </div>
        <div
          style={{
            fontSize: "10px",
            opacity: 0.7,
            textAlign: "right",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          {formatTime(message.createdAt)}
          {getStatusIcon()}
        </div>
      </div>
    </div>
  );
}

export default Message;
