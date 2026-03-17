import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import { setAuthToken } from "./api";

function App() {
  const [token, setToken] = useState(localStorage.getItem("auth_token"));
  const navigate = useNavigate();

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setToken(null);
    navigate("/login");
  };

  return (
    <div className="min-h-screen">
      <Routes>
        <Route
          path="/"
          element={
            token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/login"
          element={<Login onSuccess={(t) => setToken(t)} />}
        />
        <Route
          path="/dashboard"
          element={
            token ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" replace />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
