import { useState, useEffect } from "react";
import { useSocketContext } from "../context/SocketContext";
import { useAuthContext } from "../context/AuthContext";
import Messages from "./Messages";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";

function MessageContainer({ selectedUser, onBack }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const { socket } = useSocketContext();
  const { authUser } = useAuthContext();

  // Fetch messages when selectedUser changes
  useEffect(() => {
    if (!selectedUser) {
      setMessages([]); // Clear messages when no user selected
      return;
    }

    // Clear previous messages immediately when switching users
    setMessages([]);

    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/messages/${selectedUser.id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch messages");
        }
        const data = await res.json();
        setMessages(data);

        // Mark messages as read after fetching
        await markAsRead();
      } catch (error) {
        console.error("Error fetching messages:", error);
        setError("Failed to load messages. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedUser]);

  // Function to mark messages as read
  const markAsRead = async () => {
    if (!selectedUser) return;

    try {
      await fetch(`/api/messages/read/${selectedUser.id}`, {
        method: "PUT",
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  // Listen for real-time messages via Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      console.log("New message received:", newMessage);
      console.log("Selected user ID:", selectedUser?.id);
      console.log("Sender ID:", newMessage.senderId);
      console.log("Receiver ID:", newMessage.receiverId);

      // Only add message if it's for the current conversation
      if (
        newMessage.senderId === selectedUser?.id ||
        newMessage.receiverId === selectedUser?.id
      ) {
        console.log("Adding message to conversation");
        setMessages((prev) => [...prev, newMessage]);

        // If the message is from the selected user (not from me), mark it as read
        if (newMessage.senderId === selectedUser?.id) {
          console.log("Marking received message as read");
          markAsRead();
        }
      } else {
        console.log("Message not for this conversation");
      }
    };

    socket.on("newMessage", handleNewMessage);
    console.log("Listening for newMessage events");

    // Cleanup listener on unmount or dependency change
    return () => {
      console.log("Removing newMessage listener");
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, selectedUser]);

  // Listen for typing events
  useEffect(() => {
    if (!socket || !selectedUser) return;

    const handleTyping = ({ userId, isTyping }) => {
      console.log("⌨️ Typing event received:", { userId, isTyping });
      // Only show typing if it's from the selected user
      if (userId === selectedUser.id) {
        console.log("✅ Showing typing indicator");
        setIsTyping(isTyping);
      }
    };

    const handleAITyping = ({ userId, isTyping }) => {
      console.log("🤖 AI Typing event received:", { userId, isTyping });
      // Show AI typing indicator
      if (userId === selectedUser.id) {
        console.log("✅ Showing AI typing indicator");
        setIsTyping(isTyping);
      }
    };

    socket.on("userTyping", handleTyping);
    socket.on("aiTyping", handleAITyping);
    console.log("👂 Listening for typing events");

    return () => {
      console.log("🧹 Removing typing listeners");
      socket.off("userTyping", handleTyping);
      socket.off("aiTyping", handleAITyping);
    };
  }, [socket, selectedUser]);

  // Listen for read receipts and status updates
  useEffect(() => {
    if (!socket || !selectedUser) return;

    const handleMessagesRead = ({ receiverId }) => {
      console.log("📖 Messages read by:", receiverId);
      // Update all my sent messages to 'read' status
      setMessages((prev) =>
        prev.map((msg) =>
          msg.receiverId === receiverId && msg.senderId === authUser.id
            ? { ...msg, status: "read" }
            : msg
        )
      );
    };

    const handleMessageStatusUpdate = ({ messageId, status }) => {
      console.log("📊 Message status update:", { messageId, status });
      // Update specific message status
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? { ...msg, status } : msg))
      );
    };

    socket.on("messagesRead", handleMessagesRead);
    socket.on("messageStatusUpdate", handleMessageStatusUpdate);
    console.log("👂 Listening for read receipt events");

    return () => {
      console.log("🧹 Removing read receipt listeners");
      socket.off("messagesRead", handleMessagesRead);
      socket.off("messageStatusUpdate", handleMessageStatusUpdate);
    };
  }, [socket, selectedUser, authUser]);

  // Listen for message status updates (delivered, read)
  useEffect(() => {
    if (!socket) return;

    const handleMessageStatusUpdate = ({ messageId, status }) => {
      console.log("📬 Message status update:", { messageId, status });
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, status } : msg
        )
      );
    };

    const handleMessagesRead = ({ receiverId }) => {
      console.log("✓✓ Messages marked as read by:", receiverId);
      console.log("Current user ID:", authUser?.id);
      console.log("Selected user ID:", selectedUser?.id);

      // Update all messages sent BY ME (authUser) TO the person who read them (receiverId)
      setMessages((prevMessages) =>
        prevMessages.map((msg) => {
          const shouldMarkAsRead =
            msg.senderId === authUser?.id && // I sent this message
            msg.receiverId === receiverId && // To the person who just read it
            msg.status !== "read"; // And it's not already marked as read

          console.log(`Message ${msg._id}:`, {
            senderId: msg.senderId,
            receiverId: msg.receiverId,
            status: msg.status,
            shouldMarkAsRead,
          });

          return shouldMarkAsRead ? { ...msg, status: "read" } : msg;
        })
      );
    };

    socket.on("messageStatusUpdate", handleMessageStatusUpdate);
    socket.on("messagesRead", handleMessagesRead);
    console.log("👂 Listening for status update events");

    return () => {
      console.log("🧹 Removing status update listeners");
      socket.off("messageStatusUpdate", handleMessageStatusUpdate);
      socket.off("messagesRead", handleMessagesRead);
    };
  }, [socket, authUser, selectedUser]);

  // Handle sending new messages
  const handleSendMessage = async (messageText) => {
    if (!selectedUser) return;

    try {
      const res = await fetch(`/api/messages/send/${selectedUser.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText }),
      });

      const data = await res.json();

      // Check if it's a slash command response
      if (data.isSlashCommand) {
        console.log(`⚡ Slash command response: ${data.command}`);

        // Add the AI response as a temporary message in the chat
        const aiMessage = {
          _id: `temp-${Date.now()}`,
          senderId: {
            _id: "671a00000000000000000001", // AI Bot ID
            name: "Vach AI",
          },
          receiverId: authUser._id,
          message: `🤖 **Command: ${data.command}**\n\n${data.response}`,
          createdAt: new Date().toISOString(),
          status: "delivered",
          isSlashCommand: true,
        };

        setMessages((prev) => [...prev, aiMessage]);
        return;
      }

      // Don't add message here - let Socket.IO handle it
      // This prevents duplicate messages
      console.log("📤 Message sent successfully:", data);
    } catch (error) {
      console.error("Error sending message:", error);
      throw error; // Re-throw so MessageInput can handle it
    }
  };

  // Handle sending file messages
  const handleSendFile = async (file, caption = "") => {
    if (!selectedUser) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (caption) {
        formData.append("caption", caption);
      }

      const res = await fetch(`/api/messages/send-file/${selectedUser.id}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to send file");
      }

      const data = await res.json();
      console.log("📎 File sent successfully:", data);
    } catch (error) {
      console.error("Error sending file:", error);
      throw error;
    }
  };

  // Show placeholder if no conversation is selected
  if (!selectedUser) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1F1F1F",
        }}
      >
        <div style={{ textAlign: "center", color: "#999" }}>
          <img
            src="/vachchat-logo.png"
            alt="VachChat"
            style={{
              width: "200px",
              height: "auto",
              margin: "0 auto 20px",
              opacity: 0.8,
            }}
          />
          <h3
            style={{
              fontSize: "20px",
              fontWeight: "500",
              color: "#B0B0B0",
              letterSpacing: "0.5px",
              marginTop: "20px",
            }}
          >
            Select a conversation to start messaging
          </h3>
          <p
            style={{
              fontSize: "14px",
              color: "#666",
              marginTop: "10px",
            }}
          >
            Powered by VachChat - Real-time messaging
          </p>
        </div>
      </div>
    );
  }

  // Render full chat interface
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#0f0f0f",
      }}
    >
      {/* Header - showing selected user's name */}
      <div
        style={{
          padding: "20px",
          borderBottom: "1px solid #404040",
          backgroundColor: "#1A1A1A",
          color: "#FAFAFA",
          display: "flex",
          alignItems: "center",
          gap: "15px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
        }}
      >
        {onBack && (
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              color: "#FAFAFA",
              cursor: "pointer",
              fontSize: "24px",
              padding: "0",
              display: "flex",
              alignItems: "center",
              fontWeight: "bold",
            }}
            title="Back to conversations"
          >
            ←
          </button>
        )}
        <h3
          style={{
            margin: 0,
            fontSize: "20px",
            fontWeight: "700",
            letterSpacing: "0.5px",
          }}
        >
          {selectedUser.fullName}
        </h3>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            padding: "12px 20px",
            backgroundColor: "#3d1a1a",
            color: "#ef4444",
            fontSize: "14px",
            borderBottom: "1px solid #531a1a",
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
              color: "#ef4444",
              cursor: "pointer",
              fontSize: "18px",
              padding: "0 5px",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Messages area (scrollable) */}
      <Messages messages={messages} loading={loading} />

      {/* Typing indicator */}
      {isTyping && <TypingIndicator userName={selectedUser.fullName} />}

      {/* Input field for sending messages */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onSendFile={handleSendFile}
        receiverId={selectedUser.id}
      />
    </div>
  );
}

export default MessageContainer;
