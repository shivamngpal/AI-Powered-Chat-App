import { useState, useRef } from "react";
import { useSocketContext } from "../context/SocketContext";

function MessageInput({ onSendMessage, disabled, receiverId }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { socket, isConnected } = useSocketContext();
  const typingTimeoutRef = useRef(null);

  const handleTyping = (e) => {
    const value = e.target.value;
    setMessage(value);

    if (!socket || !receiverId) return;

    // Emit typing event
    socket.emit("typing", { receiverId, isTyping: true });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", { receiverId, isTyping: false });
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim() || sending) return;

    // Stop typing indicator immediately
    if (socket && receiverId) {
      socket.emit("typing", { receiverId, isTyping: false });
    }

    // Clear timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    setSending(true);
    try {
      await onSendMessage(message);
      setMessage(""); // Clear input after sending
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: "15px",
        borderTop: "1px solid #ddd",
        backgroundColor: "white",
        display: "flex",
        gap: "10px",
      }}
    >
      <input
        type="text"
        placeholder={isConnected ? "Type a message..." : "Connecting..."}
        value={message}
        onChange={handleTyping}
        disabled={disabled || sending || !isConnected}
        style={{
          flex: 1,
          padding: "10px 15px",
          border: "1px solid #ddd",
          borderRadius: "20px",
          outline: "none",
          fontSize: "14px",
          opacity: isConnected ? 1 : 0.6,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#007bff";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#ddd";
        }}
      />
      <button
        type="submit"
        disabled={!message.trim() || disabled || sending || !isConnected}
        style={{
          padding: "10px 25px",
          backgroundColor:
            !message.trim() || disabled || sending || !isConnected
              ? "#ccc"
              : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "20px",
          cursor:
            !message.trim() || disabled || sending || !isConnected
              ? "not-allowed"
              : "pointer",
          fontWeight: "bold",
          fontSize: "14px",
        }}
      >
        {!isConnected ? "Offline" : sending ? "Sending..." : "Send"}
      </button>
    </form>
  );
}

export default MessageInput;
