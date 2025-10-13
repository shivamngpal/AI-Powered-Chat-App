import { useState, useEffect } from "react";
import { useSocketContext } from "../context/SocketContext";
import Messages from "./Messages";
import MessageInput from "./MessageInput";

function MessageContainer({ selectedUser }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { socket } = useSocketContext();

  // Fetch messages when selectedUser changes
  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/messages/${selectedUser.id}`);
        const data = await res.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedUser]);

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

      // Don't add message here - let Socket.IO handle it
      // This prevents duplicate messages
      console.log("📤 Message sent successfully:", data);
    } catch (error) {
      console.error("Error sending message:", error);
      throw error; // Re-throw so MessageInput can handle it
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
          backgroundColor: "#f5f5f5",
        }}
      >
        <div style={{ textAlign: "center", color: "#666" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>💬</h2>
          <h3 style={{ fontSize: "18px", fontWeight: "normal" }}>
            Select a conversation to start messaging
          </h3>
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
        backgroundColor: "white",
      }}
    >
      {/* Header - showing selected user's name */}
      <div
        style={{
          padding: "15px 20px",
          borderBottom: "1px solid #ddd",
          backgroundColor: "#007bff",
          color: "white",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
          {selectedUser.fullName}
        </h3>
      </div>

      {/* Messages area (scrollable) */}
      <Messages messages={messages} loading={loading} />

      {/* Input field for sending messages */}
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
}

export default MessageContainer;
