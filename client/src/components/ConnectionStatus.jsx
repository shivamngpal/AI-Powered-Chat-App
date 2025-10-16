import { useSocketContext } from "../context/SocketContext";

function ConnectionStatus() {
  const { isConnected, isReconnecting } = useSocketContext();

  // Don't show anything if connected
  if (isConnected && !isReconnecting) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        padding: "10px",
        textAlign: "center",
        zIndex: 9999,
        backgroundColor: isReconnecting ? "#FFA500" : "#FF4444",
        color: "white",
        fontSize: "14px",
        fontWeight: "500",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
      }}
    >
      {isReconnecting ? (
        <>
          <div
            style={{
              width: "16px",
              height: "16px",
              border: "2px solid white",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <span>Reconnecting...</span>
        </>
      ) : (
        <>
          <span>⚠️</span>
          <span>Connection lost. Trying to reconnect...</span>
        </>
      )}
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default ConnectionStatus;
