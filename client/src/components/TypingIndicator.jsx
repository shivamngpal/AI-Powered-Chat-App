function TypingIndicator({ userName }) {
  return (
    <div
      style={{
        padding: "10px 20px",
        color: "#666",
        fontSize: "14px",
        fontStyle: "italic",
        display: "flex",
        alignItems: "center",
        gap: "5px",
      }}
    >
      <span>{userName} is typing</span>
      <div style={{ display: "flex", gap: "3px" }}>
        <span className="typing-dot">.</span>
        <span className="typing-dot">.</span>
        <span className="typing-dot">.</span>
      </div>
    </div>
  );
}

export default TypingIndicator;
