import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthContext } from "./context/AuthContext"; // Make sure this path is correct
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import ChatPage from "./pages/ChatPage";

function App() {
  const { authUser } = useAuthContext();

  return (
    <div>
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
      </Routes>
    </div>
  );
}

export default App;
