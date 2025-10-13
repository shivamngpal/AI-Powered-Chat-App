import { useState } from "react";
import Sidebar from "../components/Sidebar";
import MessageContainer from "../components/MessageContainer";

function ChatPage() {
  const [selectedUser, setSelectedUser] = useState(null);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* Sidebar - Left side with conversations */}
      <Sidebar selectedUser={selectedUser} onSelectUser={handleSelectUser} />

      {/* MessageContainer - Right side with chat */}
      <MessageContainer selectedUser={selectedUser} />
    </div>
  );
}

export default ChatPage;
