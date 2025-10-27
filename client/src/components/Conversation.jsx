import { useAuthContext } from "../context/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// AI Bot ID - must match backend
const AI_BOT_ID = "671a00000000000000000001";

function Conversation({ user, isOnline, isSelected, onClick }) {
  const { authUser } = useAuthContext();

  // Check if this is the AI bot
  const isAIBot = user.id === AI_BOT_ID;

  // Format timestamp for last message
  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return "";

    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffInMs = now - messageDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return messageDate.toLocaleDateString();
  };

  // Truncate long messages
  const truncateMessage = (text, maxLength = 35) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Get last message preview text
  const getLastMessagePreview = () => {
    if (!user.lastMessage) return "";

    const isMyMessage = user.lastMessage.senderId === authUser?.id;
    const prefix = isMyMessage ? "You: " : "";

    // Handle different message types
    if (user.lastMessage.messageType === "image") {
      return prefix + "📷 Photo";
    }

    if (user.lastMessage.messageType === "file") {
      return prefix + "📎 " + (user.lastMessage.fileName || "File");
    }

    // Regular text message
    const messageText = truncateMessage(user.lastMessage.message);
    return prefix + messageText;
  };

  // Get initials for avatar fallback
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get profile picture URL (proxy handles localhost routing)
  const getProfilePicUrl = () => {
    if (!user.profilePic) return ""; // Return empty string for default avatar
    if (user.profilePic.startsWith("http")) return user.profilePic;
    return user.profilePic; // Use relative path, Vite proxy will handle it
  };

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-3 p-3 cursor-pointer transition-colors border-b border-border
        ${isSelected ? "bg-primary/10" : "hover:bg-secondary/30"}
      `}
    >
      {/* Avatar with online status indicator */}
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={getProfilePicUrl()} alt={user.fullName} />
          <AvatarFallback className="bg-primary/20 text-primary font-semibold">
            {getInitials(user.fullName)}
          </AvatarFallback>
        </Avatar>

        {/* Online status dot */}
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full" />
        )}
      </div>

      {/* User name and last message */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <div className="flex items-center gap-2">
            <p
              className={`text-sm font-medium ${
                isSelected ? "text-primary" : "text-foreground"
              }`}
            >
              {user.fullName}
            </p>
            {isAIBot && (
              <Badge className="text-xs px-1.5 py-0 h-5 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800">
                🤖 AI
              </Badge>
            )}
          </div>

          {/* Last message timestamp */}
          {user.lastMessage && (
            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
              {formatLastMessageTime(user.lastMessage.createdAt)}
            </span>
          )}
        </div>

        {/* Last message preview */}
        <div className="flex justify-between items-center">
          <p
            className={`text-xs overflow-hidden text-ellipsis whitespace-nowrap ${
              user.unreadCount > 0
                ? "font-semibold text-foreground"
                : "text-muted-foreground"
            }`}
          >
            {getLastMessagePreview() || "No messages yet"}
          </p>

          {/* Unread count badge */}
          {user.unreadCount > 0 && (
            <Badge
              variant="default"
              className="ml-2 flex-shrink-0 h-5 min-w-[20px] px-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold"
            >
              {user.unreadCount > 99 ? "99+" : user.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

export default Conversation;
