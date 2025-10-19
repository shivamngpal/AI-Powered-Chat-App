import { useState, useRef } from "react";
import { useSocketContext } from "../context/SocketContext";
import EmojiPicker from "./EmojiPicker";

function MessageInput({ onSendMessage, onSendFile, disabled, receiverId }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const { socket, isConnected } = useSocketContext();
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

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

    if ((!message.trim() && !selectedFile) || sending) return;

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
      if (selectedFile) {
        // Send file message
        await onSendFile(selectedFile, message);
        setSelectedFile(null);
        setFilePreview(null);
      } else {
        // Send text message
        await onSendMessage(message);
      }
      setMessage(""); // Clear input after sending
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji);
  };

  return (
    <div style={{ borderTop: "1px solid #ddd", backgroundColor: "white" }}>
      {/* File Preview */}
      {selectedFile && (
        <div
          style={{
            padding: "10px 15px",
            borderBottom: "1px solid #ddd",
            backgroundColor: "#f8f9fa",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {filePreview ? (
              <img
                src={filePreview}
                alt="Preview"
                style={{
                  width: "60px",
                  height: "60px",
                  objectFit: "cover",
                  borderRadius: "5px",
                }}
              />
            ) : (
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#e9ecef",
                  borderRadius: "5px",
                  fontSize: "24px",
                }}
              >
                📎
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "500", fontSize: "14px" }}>
                {selectedFile.name}
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>
                {(selectedFile.size / 1024).toFixed(2)} KB
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "20px",
                color: "#dc3545",
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          padding: "15px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />

        {/* File attach button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || sending || !isConnected}
          style={{
            background: "none",
            border: "none",
            cursor:
              disabled || sending || !isConnected ? "not-allowed" : "pointer",
            fontSize: "22px",
            padding: "5px",
            opacity: disabled || sending || !isConnected ? 0.5 : 1,
          }}
          title="Attach file"
        >
          📎
        </button>

        {/* Emoji picker */}
        <EmojiPicker onEmojiSelect={handleEmojiSelect} />

        {/* Message input */}
        <input
          type="text"
          placeholder={
            isConnected
              ? "Type a message or use /help for AI commands..."
              : "Connecting..."
          }
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
          disabled={
            (!message.trim() && !selectedFile) ||
            disabled ||
            sending ||
            !isConnected
          }
          style={{
            padding: "10px 25px",
            backgroundColor:
              (!message.trim() && !selectedFile) ||
              disabled ||
              sending ||
              !isConnected
                ? "#ccc"
                : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "20px",
            cursor:
              (!message.trim() && !selectedFile) ||
              disabled ||
              sending ||
              !isConnected
                ? "not-allowed"
                : "pointer",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          {!isConnected
            ? "Offline"
            : sending
            ? "Sending..."
            : selectedFile
            ? "Send File"
            : "Send"}
        </button>
      </form>
    </div>
  );
}

export default MessageInput;
