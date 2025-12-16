import { useState, useRef } from "react";
import { useAuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const api_url = import.meta.env.VITE_API_URL || "";

function UserProfile({ isOpen, onClose }) {
  const { authUser, setAuthUser } = useAuthContext();
  const navigate = useNavigate();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [editingAbout, setEditingAbout] = useState(false);
  const [aboutText, setAboutText] = useState(
    authUser?.about || "Hey there! I am using VachChat 💬"
  );
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const fileInputRef = useRef(null);

  // Handle logout
  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem("chat-user");
    setAuthUser(null);

    // Navigate to login
    navigate("/login");
  };

  // Handle change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !passwordData.oldPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setError("All fields are required");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${api_url}/api/auth/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.msg || "Failed to change password");
      }

      setSuccess("Password changed successfully!");
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => {
        setShowChangePassword(false);
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  // Handle profile picture upload
  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    setUploadingPicture(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const res = await fetch(`${api_url}/api/auth/update-profile-picture`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.msg || "Failed to upload profile picture");
      }

      // Update auth user with new profile picture (no need for full URL, proxy handles it)
      const updatedUser = { ...authUser, profilePic: data.profilePic };
      setAuthUser(updatedUser);
      localStorage.setItem("chat-user", JSON.stringify(updatedUser));

      setSuccess("Profile picture updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to upload profile picture");
    } finally {
      setUploadingPicture(false);
    }
  };

  // Handle update about
  const handleUpdateAbout = async () => {
    if (!aboutText.trim()) {
      setError("About text cannot be empty");
      return;
    }

    if (aboutText.length > 139) {
      setError("About text must be 139 characters or less");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${api_url}/api/auth/update-about`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ about: aboutText }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.msg || "Failed to update about");
      }

      // Update auth user with new about
      const updatedUser = { ...authUser, about: aboutText };
      setAuthUser(updatedUser);
      localStorage.setItem("chat-user", JSON.stringify(updatedUser));

      setSuccess("About updated successfully!");
      setEditingAbout(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to update about");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${api_url}/api/auth/delete-account`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.msg || "Failed to delete account");
      }

      // Logout after successful deletion
      localStorage.removeItem("chat-user");
      setAuthUser(null);
      navigate("/signup");
    } catch (err) {
      setError(err.message || "Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1000,
        }}
      />

      {/* Profile Sidebar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "400px",
          height: "100vh",
          backgroundColor: "#1A1A1A",
          zIndex: 1001,
          display: "flex",
          flexDirection: "column",
          boxShadow: "2px 0 10px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px",
            backgroundColor: "#262626",
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#FAFAFA",
              cursor: "pointer",
              fontSize: "24px",
              padding: "0",
              display: "flex",
              alignItems: "center",
            }}
            title="Close"
          >
            ←
          </button>
          <h2
            style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: "600",
              color: "#FAFAFA",
            }}
          >
            Profile
          </h2>
        </div>

        {/* Profile Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "30px 20px" }}>
          {/* Success/Error Messages */}
          {error && (
            <div
              style={{
                padding: "12px",
                backgroundColor: "#3d1a1a",
                color: "#ef4444",
                borderRadius: "8px",
                fontSize: "14px",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              style={{
                padding: "12px",
                backgroundColor: "#1a3d1a",
                color: "#10B981",
                borderRadius: "8px",
                fontSize: "14px",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              {success}
            </div>
          )}

          {/* Profile Picture */}
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <div
              style={{
                position: "relative",
                width: "150px",
                height: "150px",
                margin: "0 auto 20px",
              }}
            >
              {authUser?.profilePic ? (
                <img
                  src={authUser.profilePic}
                  alt="Profile"
                  style={{
                    width: "150px",
                    height: "150px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    backgroundColor: "#404040",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "150px",
                    height: "150px",
                    borderRadius: "50%",
                    backgroundColor: "#404040",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "60px",
                    color: "#FAFAFA",
                  }}
                >
                  {authUser?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              )}

              {/* Camera Icon Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPicture}
                style={{
                  position: "absolute",
                  bottom: "5px",
                  right: "5px",
                  width: "45px",
                  height: "45px",
                  borderRadius: "50%",
                  backgroundColor: "#3B82F6",
                  border: "3px solid #1A1A1A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: uploadingPicture ? "not-allowed" : "pointer",
                  fontSize: "20px",
                  opacity: uploadingPicture ? 0.6 : 1,
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) =>
                  !uploadingPicture && (e.target.style.transform = "scale(1.1)")
                }
                onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                title="Change profile picture"
              >
                {uploadingPicture ? "⏳" : "📷"}
              </button>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                style={{ display: "none" }}
              />
            </div>

            {uploadingPicture && (
              <p style={{ fontSize: "14px", color: "#999", marginTop: "10px" }}>
                Uploading...
              </p>
            )}
          </div>

          {/* User Info Section */}
          <div style={{ marginBottom: "30px" }}>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  fontSize: "14px",
                  color: "#999",
                  marginBottom: "8px",
                  display: "block",
                }}
              >
                Your name
              </label>
              <div
                style={{
                  padding: "12px 15px",
                  backgroundColor: "#262626",
                  borderRadius: "8px",
                  color: "#FAFAFA",
                  fontSize: "16px",
                }}
              >
                {authUser?.name || "User"}
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  fontSize: "14px",
                  color: "#999",
                  marginBottom: "8px",
                  display: "block",
                }}
              >
                Email
              </label>
              <div
                style={{
                  padding: "12px 15px",
                  backgroundColor: "#262626",
                  borderRadius: "8px",
                  color: "#FAFAFA",
                  fontSize: "16px",
                }}
              >
                {authUser?.email || "email@example.com"}
              </div>
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <label
                  style={{
                    fontSize: "14px",
                    color: "#999",
                  }}
                >
                  About
                </label>
                {!editingAbout ? (
                  <button
                    onClick={() => {
                      setEditingAbout(true);
                      setError("");
                      setSuccess("");
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#3B82F6",
                      cursor: "pointer",
                      fontSize: "20px",
                      padding: "0",
                    }}
                    title="Edit about"
                  >
                    ✏️
                  </button>
                ) : null}
              </div>
              {editingAbout ? (
                <div>
                  <textarea
                    value={aboutText}
                    onChange={(e) => setAboutText(e.target.value)}
                    maxLength={139}
                    style={{
                      width: "100%",
                      padding: "12px 15px",
                      backgroundColor: "#262626",
                      border: "1px solid #404040",
                      borderRadius: "8px",
                      color: "#FAFAFA",
                      fontSize: "16px",
                      fontFamily: "inherit",
                      resize: "vertical",
                      minHeight: "80px",
                    }}
                    placeholder="Hey there! I am using VachChat 💬"
                  />
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#999",
                      marginTop: "5px",
                      textAlign: "right",
                    }}
                  >
                    {aboutText.length}/139
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginTop: "10px",
                    }}
                  >
                    <button
                      onClick={handleUpdateAbout}
                      disabled={loading}
                      style={{
                        flex: 1,
                        padding: "10px 20px",
                        backgroundColor: "#3B82F6",
                        color: "#FAFAFA",
                        border: "none",
                        borderRadius: "8px",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                        opacity: loading ? 0.6 : 1,
                      }}
                    >
                      {loading ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setEditingAbout(false);
                        setAboutText(
                          authUser?.about || "Hey there! I am using VachChat 💬"
                        );
                        setError("");
                      }}
                      disabled={loading}
                      style={{
                        flex: 1,
                        padding: "10px 20px",
                        backgroundColor: "#404040",
                        color: "#FAFAFA",
                        border: "none",
                        borderRadius: "8px",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: "12px 15px",
                    backgroundColor: "#262626",
                    borderRadius: "8px",
                    color: "#FAFAFA",
                    fontSize: "16px",
                    wordBreak: "break-word",
                  }}
                >
                  {authUser?.about || "Hey there! I am using VachChat 💬"}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ marginTop: "40px" }}>
            {/* Change Password Button */}
            <button
              onClick={() => setShowChangePassword(!showChangePassword)}
              style={{
                width: "100%",
                padding: "15px",
                backgroundColor: "#262626",
                border: "1px solid #404040",
                borderRadius: "8px",
                color: "#FAFAFA",
                fontSize: "16px",
                cursor: "pointer",
                marginBottom: "15px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#333333")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#262626")}
            >
              <span style={{ fontSize: "20px" }}>🔒</span>
              <span>Change Password</span>
            </button>

            {/* Change Password Form */}
            {showChangePassword && (
              <div
                style={{
                  padding: "20px",
                  backgroundColor: "#262626",
                  borderRadius: "8px",
                  marginBottom: "15px",
                  border: "1px solid #404040",
                }}
              >
                <form onSubmit={handleChangePassword}>
                  <input
                    type="password"
                    placeholder="Old Password"
                    value={passwordData.oldPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        oldPassword: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "12px",
                      marginBottom: "12px",
                      backgroundColor: "#1A1A1A",
                      border: "1px solid #404040",
                      borderRadius: "6px",
                      color: "#FAFAFA",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "12px",
                      marginBottom: "12px",
                      backgroundColor: "#1A1A1A",
                      border: "1px solid #404040",
                      borderRadius: "6px",
                      color: "#FAFAFA",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "12px",
                      marginBottom: "12px",
                      backgroundColor: "#1A1A1A",
                      border: "1px solid #404040",
                      borderRadius: "6px",
                      color: "#FAFAFA",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                  {error && (
                    <div
                      style={{
                        padding: "10px",
                        backgroundColor: "#3d1a1a",
                        color: "#ef4444",
                        borderRadius: "6px",
                        fontSize: "14px",
                        marginBottom: "12px",
                      }}
                    >
                      {error}
                    </div>
                  )}
                  {success && (
                    <div
                      style={{
                        padding: "10px",
                        backgroundColor: "#1a3d1a",
                        color: "#10B981",
                        borderRadius: "6px",
                        fontSize: "14px",
                        marginBottom: "12px",
                      }}
                    >
                      {success}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: "100%",
                      padding: "12px",
                      backgroundColor: "#3B82F6",
                      border: "none",
                      borderRadius: "6px",
                      color: "#FAFAFA",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.6 : 1,
                    }}
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </div>
            )}

            {/* Delete Account Button */}
            <button
              onClick={() => setShowDeleteAccount(!showDeleteAccount)}
              style={{
                width: "100%",
                padding: "15px",
                backgroundColor: "#262626",
                border: "1px solid #404040",
                borderRadius: "8px",
                color: "#ef4444",
                fontSize: "16px",
                cursor: "pointer",
                marginBottom: "15px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#333333")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#262626")}
            >
              <span style={{ fontSize: "20px" }}>🗑️</span>
              <span>Delete Account</span>
            </button>

            {/* Delete Account Confirmation */}
            {showDeleteAccount && (
              <div
                style={{
                  padding: "20px",
                  backgroundColor: "#3d1a1a",
                  borderRadius: "8px",
                  marginBottom: "15px",
                  border: "1px solid #ef4444",
                }}
              >
                <p
                  style={{
                    color: "#FAFAFA",
                    fontSize: "14px",
                    marginBottom: "15px",
                  }}
                >
                  ⚠️ This action cannot be undone. All your messages and data
                  will be permanently deleted.
                </p>
                {error && (
                  <div
                    style={{
                      padding: "10px",
                      backgroundColor: "#2a1414",
                      color: "#ef4444",
                      borderRadius: "6px",
                      fontSize: "14px",
                      marginBottom: "12px",
                    }}
                  >
                    {error}
                  </div>
                )}
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: "#ef4444",
                    border: "none",
                    borderRadius: "6px",
                    color: "#FAFAFA",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? "Deleting..." : "Yes, Delete My Account"}
                </button>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                padding: "15px",
                backgroundColor: "#262626",
                border: "1px solid #404040",
                borderRadius: "8px",
                color: "#ef4444",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#333333")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#262626")}
            >
              <span style={{ fontSize: "20px" }}>🚪</span>
              <span>Log out</span>
            </button>
            <p
              style={{
                fontSize: "12px",
                color: "#666",
                textAlign: "center",
                marginTop: "10px",
              }}
            >
              Chat history on this device will be cleared when you log out.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default UserProfile;
