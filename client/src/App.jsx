import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthContext } from "./context/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ChatPage from "./pages/ChatPage";
import ConnectionStatus from "./components/ConnectionStatus";

function App() {
  const { authUser } = useAuthContext();

  return (
    <div>
      {/* Show connection status when logged in */}
      {authUser && <ConnectionStatus />}

      <Routes>
        <Route
          path="/"
          element={authUser ? <ChatPage /> : <Navigate to="/signup" />}
        />
        <Route
          path="/login"
          element={authUser ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/signup"
          element={authUser ? <Navigate to="/" /> : <Signup />}
        />
        <Route
          path="/forgot-password"
          element={authUser ? <Navigate to="/" /> : <ForgotPassword />}
        />
      </Routes>
    </div>
  );
}

export default App;
