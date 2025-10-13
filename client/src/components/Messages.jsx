import { useEffect, useRef } from "react";
import Message from "./Message";

function Messages({ messages, loading }) {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
          }}
        >
          Loading messages...
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
