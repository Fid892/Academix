import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import Admin from "./Admin";
import ManageAnnouncements from "./ManageAnnouncements";
import StudyGroups from "./StudyGroups";   // ✅ already imported
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

        {/* Student Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Admin Panel */}
        <Route path="/admin" element={<Admin />} />

        {/* Manage Announcements */}
        <Route path="/manage-announcements" element={<ManageAnnouncements />} />

        {/* ✅ NEW Study Groups Page */}
        <Route path="/study-groups" element={<StudyGroups />} />

      </Routes>
    </Router>
  );
}

export default App;