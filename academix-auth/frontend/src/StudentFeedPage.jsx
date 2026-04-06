import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AnnouncementCard from "./AnnouncementCard";
import "./Dashboard.css"; // Reuse dashboard styles

const StudentFeedPage = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser();
    fetchAnnouncements();
  }, []);

  async function fetchUser() {
    try {
      const res = await fetch("http://localhost:5000/api/auth/current-user", { credentials: "include" });
      const data = await res.json();
      setUser(data);
    } catch { setUser(null); }
  }

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/announcements/student", { credentials: "include" });
      const data = await res.json();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-container">
      <div className="dashboard-bg">
        <div className="bg-glow bg-glow-1"></div>
        <div className="bg-glow bg-glow-2"></div>
      </div>

      <div className="student-header">
        <button className="back-button" onClick={() => navigate("/dashboard")} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-subtle)", color: "white", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}>
          ← Back to Dashboard
        </button>
      </div>

      <div className="welcome-section" style={{ marginTop: "40px" }}>
        <h1 className="welcome-name">👩‍🎓 Student Announcements</h1>
        <p className="welcome-label" style={{ marginTop: "8px" }}>Catch up with what your peers are sharing</p>
      </div>

      <div className="main-feed-container" style={{ marginTop: "40px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-dim)" }}>Loading Feed...</div>
        ) : announcements.length > 0 ? (
          <div className="feed-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '32px' }}>
            {announcements.map((a, i) => (
              <div key={a._id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <AnnouncementCard a={a} currentUser={user} />
              </div>
            ))}
          </div>
        ) : (
          <div className="faculty-empty" style={{ padding: "60px", textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px dashed var(--border-subtle)" }}>
            <p>No announcements available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentFeedPage;
