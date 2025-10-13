// client/src/pages/Login.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext"; // Make sure this path is correct

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setAuthUser } = useAuthContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.msg);
      }

      // On success, update the global context with user data
      console.log("Login successful, user data:", data.user);
      setAuthUser(data.user);
    } catch (error) {
      console.error("Login failed:", error.message);
      // You can add an alert or toast message here for the user
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? Create one.{" "}
        {/* We will make this a <Link> later */}
      </p>
    </div>
  );
}

export default Login;
