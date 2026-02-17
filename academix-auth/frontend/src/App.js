import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import Admin from "./Admin";
import ManageAnnouncements from "./ManageAnnouncements";
import "./Login.css";

function Home() {
  return (
    <div className="login-page">
      <div className="login-card">

        <div className="logo-box">
          <div className="logo-icon">A</div>
          <h1>Academix</h1>
          <p>Access your dashboard securely</p>
        </div>

        <button
          className="google-btn"
          onClick={() =>
            (window.location.href =
              "http://localhost:5000/api/auth/google")
          }
        >
          Continue with Google
        </button>

      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>

        {/* Login */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Home />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Existing Admin Add User Module */}
        <Route path="/admin" element={<Admin />} />

        {/* NEW Manage Announcements Page */}
        <Route path="/manage-announcements" element={<ManageAnnouncements />} />

      </Routes>
    </Router>
  );
}

export default App;
