import { useAuthContext } from "../context/AuthContext";
import { useState } from "react";

function Message({ message }) {
  const { authUser } = useAuthContext();
  const [imageExpanded, setImageExpanded] = useState(false);

  // Check if this message is from the logged-in user
  // Handle both object with _id and direct ID string
  const senderId = message.senderId?._id || message.senderId;
  const isMyMessage = senderId === authUser?.id || senderId === authUser?._id;

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
            style={{
              marginLeft: "4px",
              color: "#999999",
              fontWeight: "bold",
              fontSize: "11px",
            }}
          >
            ✓
          </span>
        );
      case "delivered":
        return (
          <span
            style={{
              marginLeft: "4px",
              color: "#3B82F6",
              fontWeight: "bold",
              fontSize: "11px",
            }}
          >
            ✓✓
          </span>
        );
      case "read":
        return (
          <span
            style={{
              marginLeft: "4px",
              color: "#10B981",
              fontWeight: "bold",
              fontSize: "11px",
            }}
          >
            ✓✓
          </span>
        );
      default:
        return null;
    }
  };

  // Check if this is a slash command response
  const isSlashCommand = message.isSlashCommand || false;

  // Get file URL (proxy handles localhost routing)
  const fullImageUrl = message.fileUrl?.startsWith("http")
    ? message.fileUrl
    : message.fileUrl;

  // Render image message
  const renderImageMessage = () => {
    return (
      <>
        {message.fileUrl && (
          <div style={{ marginBottom: "8px" }}>
            <img
              src={fullImageUrl}
              alt={message.fileName || "Image"}
              onClick={() => setImageExpanded(true)}
              style={{
                maxWidth: "100%",
                maxHeight: "300px",
                borderRadius: "12px",
                cursor: "pointer",
                display: "block",
              }}
            />
          </div>
        )}
        {message.message && (
          <div
            style={{
              wordWrap: "break-word",
              marginBottom: "5px",
              whiteSpace: "pre-wrap",
            }}
          >
            {message.message}
          </div>
        )}
      </>
    );
  };

  // Render file message
  const renderFileMessage = () => {
    const fileSize = message.fileSize
      ? `${(message.fileSize / 1024).toFixed(2)} KB`
      : "";

    // Get file URL (proxy handles localhost routing)
    const fileUrl = message.fileUrl?.startsWith("http")
      ? message.fileUrl
      : message.fileUrl;

    return (
      <>
        <a
          href={fileUrl}
          download={message.fileName}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            color: "inherit",
            padding: "8px",
            backgroundColor: isMyMessage
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.05)",
            borderRadius: "8px",
            marginBottom: message.message ? "8px" : "0",
          }}
        >
          <div style={{ fontSize: "28px" }}>📎</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "600", fontSize: "14px" }}>
              {message.fileName || "File"}
            </div>
            {fileSize && (
              <div style={{ fontSize: "12px", opacity: 0.8 }}>{fileSize}</div>
            )}
          </div>
          <div style={{ fontSize: "20px" }}>⬇️</div>
        </a>
        {message.message && (
          <div
            style={{
              wordWrap: "break-word",
              marginBottom: "5px",
              whiteSpace: "pre-wrap",
            }}
          >
            {message.message}
          </div>
        )}
      </>
    );
  };

  // Render text message
  const renderTextMessage = () => {
    return (
      <div
        style={{
          wordWrap: "break-word",
          marginBottom: "5px",
          whiteSpace: "pre-wrap",
        }}
      >
        {message.message}
      </div>
    );
  };

  return (
    <>
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
            maxWidth: isSlashCommand ? "80%" : "60%",
            background: isSlashCommand
              ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              : isMyMessage
              ? "#404040"
              : "#262626",
            color: "#FAFAFA",
            padding: "10px 15px",
            borderRadius: "18px",
            borderBottomRightRadius: isMyMessage ? "4px" : "18px",
            borderBottomLeftRadius: isMyMessage ? "18px" : "4px",
            boxShadow: isSlashCommand
              ? "0 4px 8px rgba(102, 126, 234, 0.3)"
              : "0 1px 2px rgba(0,0,0,0.2)",
          }}
        >
          {message.messageType === "image"
            ? renderImageMessage()
            : message.messageType === "file"
            ? renderFileMessage()
            : renderTextMessage()}
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

      {/* Image modal for expanded view */}
      {imageExpanded && message.messageType === "image" && (
        <div
          onClick={() => setImageExpanded(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            cursor: "pointer",
          }}
        >
          <img
            src={fullImageUrl}
            alt={message.fileName || "Image"}
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              borderRadius: "8px",
            }}
          />
        </div>
      )}
    </>
  );
}

export default Message;
