import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import Admin from "./Admin";
import ManageAnnouncements from "./ManageAnnouncements";
import StudyGroups from "./StudyGroups";
import FacultyDashboard from "./FacultyDashboard";
import DoubtsPage from "./DoubtsPage";
import ProfilePage from "./profile/ProfilePage";
import StudyPlanner from "./StudyPlanner";
import SmartLearningHub from "./SmartLearningHub";
import "./Login.css";

function Home() {
  return (
    <div className="login-page">
      <div className="background-decorations">
        <div className="glow glow-1"></div>
        <div className="glow glow-2"></div>
        <div className="glow glow-3"></div>
        <div className="particles"></div>
        <div className="grid-overlay"></div>
        
        {/* Floating Geometric Shapes */}
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>
      
      <div className="login-card">
        <div className="card-accent accent-tl"></div>
        <div className="card-accent accent-tr"></div>
        <div className="card-accent accent-bl"></div>
        <div className="card-accent accent-br"></div>

        <div className="logo-box">
          <div className="logo-wrapper">
            <div className="logo-ring"></div>
            <div className="logo-icon animate-float">A</div>
          </div>
          <h1 className="animate-fade-in-down">Academix</h1>
          <p className="animate-fade-in-up">The future of collaborative learning</p>
        </div>

        <button
          className="google-btn animate-zoom-in"
          onClick={() =>
            (window.location.href =
              "http://localhost:5000/api/auth/google")
          }
        >
          <span className="btn-content">
            <svg viewBox="0 0 24 24" className="google-icon">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </span>
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

        {/* ✅ NEW Faculty Dashboard */}
        <Route path="/faculty-dashboard" element={<FacultyDashboard />} />

        {/* ✅ NEW Doubts Page */}
        <Route path="/doubts" element={<DoubtsPage />} />

        {/* ✅ NEW Profile Page */}
        <Route path="/profile" element={<ProfilePage />} />

        {/* ✅ NEW Study Planner Page */}
        <Route path="/study-planner" element={<StudyPlanner />} />

        {/* ✅ NEW Smart Learning Hub Page */}
        <Route path="/smart-learning-hub" element={<SmartLearningHub />} />

      </Routes>
    </Router>
  );
}

export default App;