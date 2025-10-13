import { useState } from "react";

function MessageInput({ onSendMessage, disabled }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim() || sending) return;

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
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={disabled || sending}
        style={{
          flex: 1,
          padding: "10px 15px",
          border: "1px solid #ddd",
          borderRadius: "20px",
          outline: "none",
          fontSize: "14px",
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
        disabled={!message.trim() || disabled || sending}
        style={{
          padding: "10px 25px",
          backgroundColor:
            !message.trim() || disabled || sending ? "#ccc" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "20px",
          cursor:
            !message.trim() || disabled || sending ? "not-allowed" : "pointer",
          fontWeight: "bold",
          fontSize: "14px",
        }}
      >
        {sending ? "Sending..." : "Send"}
      </button>
    </form>
  );
}

export default MessageInput;
