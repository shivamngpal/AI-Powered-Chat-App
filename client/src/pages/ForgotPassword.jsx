import { useState } from "react";
import { useNavigate } from "react-router-dom";


function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter token and new password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Step 1: Request reset token
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.msg);
        setStep(2);

        // In development, show where to find the code
        if (process.env.NODE_ENV !== "production") {
          setSuccess(
            `${data.msg}\n\n⚠️ Development Mode: Check the server console for your reset code.`
          );
        }
      } else {
        setError(data.msg || "Failed to send reset code");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset password with token
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.msg);
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(data.msg || "Failed to reset password");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "40px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        }}
      >
        <h2 style={{ marginBottom: "10px", color: "#333", fontSize: "28px" }}>
          Reset Password
        </h2>
        <p style={{ marginBottom: "30px", color: "#666", fontSize: "14px" }}>
          {step === 1
            ? "Enter your email to receive a reset code"
            : "Enter the 6-digit code and your new password"}
        </p>

        {/* Error Message */}
        {error && (
          <div
            style={{
              padding: "12px",
              marginBottom: "20px",
              backgroundColor: "#fee",
              color: "#c33",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div
            style={{
              padding: "12px",
              marginBottom: "20px",
              backgroundColor: "#efe",
              color: "#3c3",
              borderRadius: "8px",
              fontSize: "14px",
              whiteSpace: "pre-line",
            }}
          >
            {success}
          </div>
        )}

        {/* Step 1: Request Reset Token */}
        {step === 1 && (
          <form onSubmit={handleRequestReset}>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#333",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.3s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                placeholder="Enter your email"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: loading ? "#ccc" : "#667eea",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background-color 0.3s",
                marginBottom: "15px",
              }}
            >
              {loading ? "Sending..." : "Send Reset Code"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "transparent",
                color: "#667eea",
                border: "1px solid #667eea",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
            >
              Back to Login
            </button>
          </form>
        )}

        {/* Step 2: Reset Password with Token */}
        {step === 2 && (
          <form onSubmit={handleResetPassword}>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#333",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                6-Digit Reset Code
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) =>
                  setToken(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                required
                disabled={loading}
                maxLength={6}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "18px",
                  outline: "none",
                  letterSpacing: "4px",
                  textAlign: "center",
                  fontWeight: "600",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                placeholder="000000"
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#333",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                onBlur={(e) => (e.target.style.borderColor = "#ddd")}
                placeholder="Enter new password"
              />
              <p style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                Must be 6-12 characters with uppercase, lowercase, and number
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: loading ? "#ccc" : "#667eea",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background-color 0.3s",
                marginBottom: "15px",
              }}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setToken("");
                setNewPassword("");
                setError("");
                setSuccess("");
              }}
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "transparent",
                color: "#667eea",
                border: "1px solid #667eea",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s",
              }}
            >
              Back to Email Entry
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
