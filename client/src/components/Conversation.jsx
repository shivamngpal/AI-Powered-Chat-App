function Conversation({ user, isOnline, isSelected, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "12px 15px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        cursor: "pointer",
        backgroundColor: isSelected ? "#e3f2fd" : "transparent",
        borderBottom: "1px solid #eee",
        transition: "background-color 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = "#f5f5f5";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = "transparent";
        }
      }}
    >
      {/* Avatar with online status indicator */}
      <div style={{ position: "relative" }}>
        <img
          src={user.profilePic || "https://via.placeholder.com/40"}
          alt={user.fullName}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
        {/* Online status dot */}
        {isOnline && (
          <div
            style={{
              position: "absolute",
              bottom: "2px",
              right: "2px",
              width: "10px",
              height: "10px",
              backgroundColor: "#4caf50",
              border: "2px solid white",
              borderRadius: "50%",
            }}
          />
        )}
      </div>

      {/* User name */}
      <div style={{ flex: 1 }}>
        <p
          style={{
            margin: 0,
            fontSize: "15px",
            fontWeight: isSelected ? "600" : "500",
            color: isSelected ? "#007bff" : "#333",
          }}
        >
          {user.fullName}
        </p>
      </div>
    </div>
  );
}

export default Conversation;
