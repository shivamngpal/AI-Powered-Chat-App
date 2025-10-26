import { useEffect, useRef, useState } from "react";
import Message from "./Message";

function Messages({ messages, loading }) {
  const messagesEndRef = useRef(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Auto-scroll to bottom when messages load or change
  useEffect(() => {
    if (messages.length > 0) {
      // Instant scroll on initial load or when opening a chat
      if (isInitialLoad || loading === false) {
        messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
        setIsInitialLoad(false);
      } else {
        // Smooth scroll for new messages
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages, loading]);

  // Reset initial load state when messages are cleared (switching chats)
  useEffect(() => {
    if (messages.length === 0) {
      setIsInitialLoad(true);
    }
  }, [messages.length]);

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "20px 0",
        backgroundColor: "#f8f9fa",
      }}
    >
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #007bff",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <div style={{ color: "#666" }}>Loading messages...</div>
        </div>
      ) : messages.length === 0 ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            color: "#666",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div style={{ fontSize: "48px" }}>💬</div>
          <div>No messages yet. Start the conversation!</div>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <Message key={message._id} message={message} />
          ))}
          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}

export default Messages;
