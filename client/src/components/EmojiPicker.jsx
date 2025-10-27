import { useState, useRef } from "react";

function EmojiPicker({ onEmojiSelect }) {
  const [showPicker, setShowPicker] = useState(false);

  // Common emojis
  const emojis = [
    "😀",
    "😃",
    "😄",
    "😁",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
    "😛",
    "😝",
    "😜",
    "🤪",
    "🤨",
    "🧐",
    "🤓",
    "😎",
    "🥸",
    "🤩",
    "🥳",
    "😏",
    "😒",
    "😞",
    "😔",
    "😟",
    "😕",
    "🙁",
    "😣",
    "😖",
    "😫",
    "😩",
    "🥺",
    "😢",
    "😭",
    "😤",
    "😠",
    "😡",
    "🤬",
    "👍",
    "👎",
    "👏",
    "🙌",
    "👐",
    "🤝",
    "🙏",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "💪",
    "🦾",
    "🖕",
    "✍️",
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "💔",
    "❣️",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💘",
    "🎉",
    "🎊",
    "🎈",
    "🎁",
    "🏆",
    "🥇",
    "🥈",
    "🥉",
    "⭐",
    "🌟",
    "✨",
    "💫",
    "🔥",
    "💯",
    "✅",
    "❌",
  ];

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "20px",
          padding: "5px 10px",
        }}
        title="Add emoji"
      >
        😊
      </button>

      {showPicker && (
        <>
          {/* Backdrop to close picker */}
          <div
            onClick={() => setShowPicker(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
          />

          {/* Emoji picker popup */}
          <div
            style={{
              position: "absolute",
              bottom: "45px",
              left: "0",
              backgroundColor: "#262626",
              border: "1px solid #404040",
              borderRadius: "10px",
              padding: "10px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              zIndex: 1000,
              width: "300px",
              maxHeight: "250px",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(8, 1fr)",
                gap: "5px",
              }}
            >
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    onEmojiSelect(emoji);
                    setShowPicker(false);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "24px",
                    padding: "5px",
                    borderRadius: "5px",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#404040";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "transparent";
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default EmojiPicker;
