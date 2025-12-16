import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const api_url = import.meta.env.VITE_API_URL;

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
      const response = await fetch(`${api_url}/api/auth/forgot-password`, {
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
      const response = await fetch(`${api_url}/api/auth/reset-password`, {
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
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)",
      }}
    >
      <Card
        className="w-full max-w-md border-border shadow-2xl backdrop-blur-sm"
        style={{
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)",
        }}
      >
        <CardHeader className="space-y-3 text-center">
          {/* VachChat Logo */}
          <div className="flex justify-center mb-4">
            <img
              src="/vachchat-logo.png"
              alt="VachChat Logo"
              style={{ width: "200px", height: "auto" }}
            />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            Reset Password
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {step === 1
              ? "Enter your email to receive a reset code"
              : "Enter the 6-digit code and your new password"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-success/10 border border-success/50 text-success px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <span>✓</span>
              <span className="whitespace-pre-line">{success}</span>
            </div>
          )}

          {/* Step 1: Request Reset Token */}
          {step === 1 && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  className="bg-secondary/50 border-border"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold border border-primary/30 hover:border-primary/50 transition-all"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Code"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full border-border hover:bg-secondary/50"
                onClick={() => navigate("/login")}
              >
                Back to Login
              </Button>
            </form>
          )}

          {/* Step 2: Reset Password with Token */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="token"
                  className="text-sm font-medium text-foreground"
                >
                  6-Digit Reset Code
                </label>
                <Input
                  id="token"
                  type="text"
                  placeholder="000000"
                  value={token}
                  onChange={(e) =>
                    setToken(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  disabled={loading}
                  required
                  maxLength={6}
                  className="bg-secondary/50 border-border text-center text-lg tracking-widest font-semibold"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="newPassword"
                  className="text-sm font-medium text-foreground"
                >
                  New Password
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  required
                  className="bg-secondary/50 border-border"
                />
                <p className="text-xs text-muted-foreground">
                  Must be 6-12 characters with uppercase, lowercase, and number
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold border border-primary/30 hover:border-primary/50 transition-all"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full border-border hover:bg-secondary/50"
                onClick={() => {
                  setStep(1);
                  setToken("");
                  setNewPassword("");
                  setError("");
                  setSuccess("");
                }}
              >
                Back to Email Entry
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ForgotPassword;
