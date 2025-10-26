import { useState, useRef } from "react";
import { useSocketContext } from "../context/SocketContext";
import EmojiPicker from "./EmojiPicker";

function MessageInput({ onSendMessage, onSendFile, disabled, receiverId }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [error, setError] = useState(null);
  const { socket, isConnected } = useSocketContext();
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  // File size limit (5MB)
  const MAX_FILE_SIZE = 5 * 1024 * 1024;

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

    // Clear any previous errors
    setError(null);

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
        // Validate file size
        if (selectedFile.size > MAX_FILE_SIZE) {
          throw new Error("File size exceeds 5MB limit");
        }
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
      const errorMessage =
        error.message || "Failed to send message. Please try again.";
      setError(errorMessage);
      // Auto-clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setSending(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    // Send message on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    // Clear file on Escape
    if (e.key === "Escape" && selectedFile) {
      handleRemoveFile();
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Clear any previous errors
    setError(null);

    // Validate file size (5MB limit)
    if (file.size > MAX_FILE_SIZE) {
      setError("File size exceeds 5MB limit. Please choose a smaller file.");
      setTimeout(() => setError(null), 5000);
      e.target.value = ""; // Reset file input
      return;
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/zip",
      "application/x-rar-compressed",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Invalid file type. Supported: images, PDF, DOC, DOCX, TXT, ZIP, RAR"
      );
      setTimeout(() => setError(null), 5000);
      e.target.value = ""; // Reset file input
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.onerror = () => {
        setError("Failed to load image preview");
        setTimeout(() => setError(null), 5000);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
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
      {/* Error Message */}
      {error && (
        <div
          style={{
            padding: "10px 15px",
            backgroundColor: "#fee",
            color: "#c33",
            fontSize: "14px",
            borderBottom: "1px solid #fcc",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>⚠️</span>
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              color: "#c33",
              cursor: "pointer",
              fontSize: "18px",
              padding: "0 5px",
            }}
          >
            ✕
          </button>
        </div>
      )}

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
          onKeyDown={handleKeyDown}
          disabled={disabled || sending || !isConnected}
          autoFocus
          style={{
            flex: 1,
            padding: "10px 15px",
            border: "1px solid #ddd",
            borderRadius: "20px",
            outline: "none",
            fontSize: "14px",
            opacity: isConnected ? 1 : 0.6,
            color: "#333", // ← ADD THIS LINE
            backgroundColor: "white", // ← ADD THIS LINE TOO
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
