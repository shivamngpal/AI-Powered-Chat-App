import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import MessageContainer from "../components/MessageContainer";

function ChatPage() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setShowSidebar(true); // Always show sidebar on desktop
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    if (isMobile) {
      setShowSidebar(false); // Hide sidebar on mobile when user is selected
    }
  };

  const handleBackToSidebar = () => {
    setSelectedUser(null);
    setShowSidebar(true);
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        backgroundColor: "#f5f5f5",
        overflow: "hidden",
      }}
    >
      {/* Sidebar - Left side with conversations */}
      {(!isMobile || showSidebar) && (
        <Sidebar selectedUser={selectedUser} onSelectUser={handleSelectUser} />
      )}

      {/* MessageContainer - Right side with chat */}
      {(!isMobile || !showSidebar) && (
        <MessageContainer
          selectedUser={selectedUser}
          onBack={isMobile ? handleBackToSidebar : null}
        />
      )}
    </div>
  );
}

export default ChatPage;
